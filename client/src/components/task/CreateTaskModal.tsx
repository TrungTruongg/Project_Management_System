import { useEffect, useRef, useState } from "react";
import { IoMdClose as CloseIcon } from "react-icons/io";
import { MdAttachFile, MdDelete } from "react-icons/md";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Modal,
  Select,
  TextareaAutosize,
  TextField,
  Typography,
} from "@mui/material";
import { createNotification } from "../utils/createNotification";
import { useUser } from "../context/UserContext";
import api from "../api/axiosConfig";

function CreateTaskModal({
  open,
  onClose,
  onSave,
  onUpdate,
  selectedTask = null,
  currentProject,
}: any) {
  // Check if this is a status-only update (member updating assigned task)
  const [isStatusOnly, setIsStatusOnly] = useState(false);
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<string[]>([]);
  const [attachmentInput, setAttachmentInput] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState("");
  const [assignedTo, setAssignedTo] = useState<number[]>([]);
  const [status, setStatus] = useState("in-process");
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUpdate = selectedTask !== null;

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [responseProject, responseUser, responseAttachment] =
        await Promise.all([
          api.get("/projects"),
          api.get("/users"),
          api.get("/attachments"),
        ]);

      setProjects(responseProject.data);
      setUsers(responseUser.data);

      if (selectedTask) {
        const taskAttachments = responseAttachment.data
          .filter((att: any) => att.taskId === selectedTask._id)
          .map((att: any) => ({
            _id: att._id,
            name: att.name,
            url: att.url,
            type: att.type,
            isExisting: true
          }));
        setAttachments(taskAttachments);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = () => {
    const url = attachmentInput.trim();
    if (!url) return;

    if (url.startsWith('data:')) {
      setShowError(true);
      return;
    }

    try {
      new URL(url);
    } catch (error) {
      alert('Please enter valid URL');
      return;
    }

    setAttachments([
      ...attachments,
      {
        name: url,
        url: url,
        type: 'link',
        isExisting: false
      }
    ]);
    setAttachmentInput("");
  };

  // Add file
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).map(file => ({
      name: file.name,
      file: file,
      type: 'file',
      isExisting: false
    }));

    setAttachments([...attachments, ...newFiles]);

    // Reset input to choose same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Delete attachment
  const handleRemoveAttachment = (index: number) => {
    const attachment = attachments[index];

    // Nếu là attachment đã tồn tại, thêm vào list cần xóa
    if (attachment.isExisting && attachment._id) {
      setDeletedAttachmentIds([...deletedAttachmentIds, attachment._id]);
    }

    // Xóa khỏi state hiển thị
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const getProjectMembers = () => {
    const selectedProjectId = currentProject?._id || projectId;
    if (!selectedProjectId) return [];

    const project = projects.find((p) => p._id === selectedProjectId);
    if (!project?.members) return [];

    return users.filter((u) => project.members.includes(u._id));
  };

  const handleProjectChange = (newProjectId: number) => {
    setProjectId(newProjectId);
    setAssignedTo([]);

    const selectedProject = projects.find((p) => p._id === newProjectId);
    if (selectedProject) {
      setStartDate(selectedProject.startDate || "");
      setEndDate(selectedProject.endDate || "");
    }
  };

  const validateDates = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    const projectStart = currentProject ? new Date(currentProject.startDate) : null;
    const projectEnd = currentProject ? new Date(currentProject.endDate) : null;

    if (start >= end) return "End Date must be after Start Date";
    if (end < now) return "End Date cannot be in the past";
    if (projectStart && start < projectStart) return "Start Date cannot be before Project Start Date";
    if (projectEnd && end > projectEnd) return "End Date cannot be after Project End Date";
    return null;
  };


  const uploadFile = async (file: File, taskId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', taskId);
    const response = await api.post("/attachments/upload", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data.url;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setShowError(true);
      return;
    }

    const dateError = validateDates();
    if (dateError) {
      alert(dateError);
      return;
    }

    setLoading(true);

    try {
      // Count completion based on status
      let completion = 0;
      if (status === "to-do") {
        completion = 0;
      } else if (status === "in-progress") {
        completion = 50;
      } else if (status === "completed") {
        completion = 100;
      }

      const taskData = {
        projectId: isUpdate ? selectedTask.projectId : (currentProject?._id || projectId),
        name,
        description,
        startDate,
        endDate,
        assignedTo,
        priority: priority.toLowerCase(),
        status,
        completion,
      };

      let taskId;

      if (isUpdate) {

        const response = await api.put(
          `/tasks/update/${selectedTask._id}`,
          taskData
        );

        const updatedData = response.data.task;
        taskId = selectedTask._id;

        if (!updatedData._id) {
          updatedData._id = selectedTask._id;
        }

        // Delete old attachments 
        for (const attachmentId of deletedAttachmentIds) {
          try {
            await api.delete(`/attachments/delete/${attachmentId}`);
            console.log(`Deleted attachment: ${attachmentId}`);
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`Error deleting attachment ${attachmentId}:`, error);
          }
        }

        if (assignedTo.length > 0) {
          await createNotification({
            userId: assignedTo,
            type: "task",
            title: `Task Updated`,
            description: `updated task: ${name}`,
            createdBy: user?._id,
          });
        }

        onUpdate(updatedData);
      } else {
        const response = await api.post("/tasks/create", taskData);
        const createdData = response.data;

        taskId = createdData._id || createdData.task?._id;

        // Send notifications
        if (assignedTo.length > 0) {
          await createNotification({
            userId: assignedTo,
            type: "task",
            title: `New Task Assignment`,
            description: `assigned you to task: ${name}`,
            createdBy: user?._id,
          });
        }

        onSave(createdData);
      }

      // Send notification
      // if (assignedTo.length > 0) {
      //   await createNotification({
      //     userId: assignedTo,
      //     type: "task",
      //     title: isUpdate ? `Task Updated` : `New Task Assignment`,
      //     description: isUpdate ? `updated task: ${name}` : `assigned you to task: ${name}`,
      //     createdBy: user?._id,
      //   });
      // }

      // isUpdate ? onUpdate(taskData) : onSave(taskData);

      for (const att of attachments) {
        if (att.isExisting) continue;

        let finalUrl = att.url;

        // Nếu là file, upload lên server trước
        if (att.type === 'file' && att.file) {
          try {
            finalUrl = await uploadFile(att.file, taskId);
          } catch (error) {
            console.error('Error uploading file:', error);
            continue;
          }
        }

        // Lưu attachment vào database
        try {
          await api.post("/attachments/create", {
            taskId: selectedTask._id,
            url: finalUrl,
            name: att.name,
            type: att.type,
            uploadedAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Error saving attachment:', error);
        }
      }

      onClose();

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAllData();

      if (selectedTask) {
        // Check if current user is project leader
        const project = projects.find((p) => p._id === selectedTask.projectId);
        const isLeader = project?.leaderId === user?._id;
        const isAssigned = Array.isArray(selectedTask.assignedTo)
          ? selectedTask.assignedTo.includes(user?._id)
          : selectedTask.assignedTo === user?._id;

        // Status-only mode if not leader but assigned to task
        setIsStatusOnly(!isLeader && isAssigned);

        setName(selectedTask.name || "");
        setProjectId(selectedTask.projectId || "");
        setDescription(selectedTask.description || "");
        setStartDate(selectedTask.startDate || "");
        setEndDate(selectedTask.endDate || "");
        setPriority(selectedTask.priority || "");
        setAssignedTo(Array.isArray(selectedTask.assignedTo) ? selectedTask.assignedTo : []);
        setStatus(selectedTask.status || "");
      } else {
        setIsStatusOnly(false);
        setName("");
        setProjectId(currentProject?._id || "");
        setDescription("");
        setAttachments([]);
        setStartDate(currentProject?.startDate || "");
        setEndDate(currentProject?.endDate || "");
        setPriority("");
        setAssignedTo([]);
        setStatus("to-do");
      }
      setDeletedAttachmentIds([]);
      setShowError(false);
    }
  }, [open, selectedTask, currentProject]);

  const projectMembers = getProjectMembers();
  const dateError = validateDates();

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      className="flex items-center justify-center"
    >
      <Box className="relative bg-white rounded-xl w-125 max-h-[90vh] overflow-y-auto no-scrollbar shadow-xl mx-auto p-6">
        <Box className="flex items-center justify-between mb-6">
          <Typography
            sx={{
              fontSize: "18px",
              lineHeight: "28px",
              fontWeight: 600,
              color: "black"
            }}
          >
            {isStatusOnly ? "Update Task Status" : isUpdate ? "Update Task" : "Create Task"}
          </Typography>
          <Button
            onClick={onClose}
            sx={{
              minWidth: "30px",
              width: "30px",
              height: "30px",
              padding: 0,
              borderRadius: "50%",
              color: "rgb(156, 163, 175)",
              "&:hover": {
                backgroundColor: "#d5d5d5",
                color: "rgb(75, 85, 99)",
              },
              transition: "all 0.2s",
            }}
          >
            <CloseIcon className="w-10 h-10" />
          </Button>
        </Box>

        <Box component="form" className="space-y-4" onSubmit={handleSave}>
          {!isStatusOnly && (
            <>
              {/* Name */}
              <Box>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    mb: 0.5,
                    color: "#374151",
                  }}
                >
                  Name <span className="text-red-500">*</span>
                </Typography>
                <TextField
                  fullWidth
                  type="text"
                  size="small"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Type task name"
                  error={showError && !name.trim()}
                  // helperText={showError && !name.trim() ? "Task name is required" : ""}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "14px",
                      color: "black"
                    },
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                  }}
                />

                {showError && !name.trim() ?
                  <Typography sx={{ color: "red", fontSize: "12px", mt: 0.5 }}>Task name is required</Typography>
                  : ""}
              </Box>

              {/* Project */}
              <Box>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    mb: 0.5,
                    color: 'black'
                  }}
                >
                  Project
                </Typography>
                <Select
                  fullWidth
                  displayEmpty
                  size="small"
                  value={projectId}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  sx={{
                    fontSize: "14px",
                    color: projectId === "" ? "#9ca3af" : "#111827",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                  }}
                  disabled={!!currentProject}
                >
                  <MenuItem value="" disabled>
                    Choose Project
                  </MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project._id} value={project._id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              <Box className="gap-4">
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    mb: 0.5,
                    color: "#374151",
                  }}
                >
                  Description
                </Typography>
                <TextareaAutosize
                  placeholder="Type description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  minRows={3}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    resize: "none",
                    color: "black"
                  }}
                />
              </Box>

              {/* Attachments */}
              <Box>
                <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 1, color: "black" }}>
                  Attachments
                </Typography>

                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />

                  <Button
                    variant="outlined"
                    startIcon={<MdAttachFile />}
                    onClick={() => fileInputRef.current?.click()}
                    size="small"
                  >
                    File
                  </Button>

                  <TextField
                    size="small"
                    placeholder="or paste link"
                    value={attachmentInput}
                    onChange={(e) => setAttachmentInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddLink();
                      }
                    }}
                    sx={{
                      flex: 1,
                      "& .MuiOutlinedInput-root": {
                        fontSize: "14px",
                        color: "black"
                      },
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                    }}
                  />

                  <Button
                    variant="outlined"
                    onClick={handleAddLink}
                    size="small"
                  >
                    Add
                  </Button>
                </Box>

                {attachments.length > 0 && (
                  <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    maxHeight: "200px",
                    overflowY: "auto",
                    border: "1px solid #e5e7eb",
                    borderRadius: "4px",
                    padding: "8px"
                  }}>
                    {attachments.map((att, i) => (
                      <Box
                        key={i}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 10px",
                          backgroundColor: "#f9fafb",
                          borderRadius: "4px",
                          "&:hover": {
                            backgroundColor: "#f3f4f6"
                          }
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
                          <MdAttachFile style={{ color: "#6b7280", flexShrink: 0 }} />
                          <Typography
                            sx={{
                              fontSize: "13px",
                              color: att.type === 'link' ? "#2563eb" : "#374151",
                              cursor: att.type === 'link' ? "pointer" : "default",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              "&:hover": att.type === 'link' ? {
                                textDecoration: "underline"
                              } : {}
                            }}
                            onClick={() => {
                              if (att.type === 'link' && att.url) {
                                window.open(att.url, '_blank');
                              }
                            }}
                          >
                            {att.name}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveAttachment(i)}
                          sx={{ padding: "4px" }}
                        >
                          <MdDelete style={{ fontSize: "18px", color: "#ef4444" }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>

              {/* Dates */}
              <Box className="flex gap-4">
                <Box className="w-full">
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 500,
                      mb: 0.5,
                      color: "black"
                    }}
                  >
                    Start Date
                  </Typography>
                  <TextField
                    fullWidth
                    type="date"
                    size="small"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        fontSize: "14px",
                        color: "black"
                      },
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                    }}
                  />
                </Box>

                <Box className="w-full">
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 500,
                      mb: 0.5,
                      color: "black"
                    }}
                  >
                    End Date
                  </Typography>
                  <TextField
                    fullWidth
                    type="date"
                    size="small"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    error={!!dateError}
                    helperText={dateError}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        fontSize: "14px",
                        color: "black"
                      },
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                    }}
                  />
                </Box>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    mb: 0.5,
                    color: "black"
                  }}
                >
                  Assign To
                </Typography>

                <Select
                  fullWidth
                  size="small"
                  displayEmpty
                  disabled={!projectId && !currentProject}
                  multiple
                  onChange={(e) => setAssignedTo(e.target.value as number[])}
                  value={assignedTo}
                  renderValue={(selected) =>
                    selected.length === 0
                      ? "Choose members"
                      : selected.map((id: any) => {
                        const m = users.find((u) => u._id === id);
                        return `${m?.firstName} ${m?.lastName}`;
                      }).join(", ")
                  }
                  sx={{
                    fontSize: "14px",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    color: "black"
                  }}
                >
                  {projectMembers.length === 0 ? (
                    <MenuItem disabled>No members in project</MenuItem>
                  ) : (
                    projectMembers.map((m: any) => (
                      <MenuItem key={m._id} value={m._id}>
                        {m.firstName} {m.lastName}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </Box>

              {/* Priority */}
              <Box>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    mb: 0.5,
                    color: "black",
                  }}
                >
                  Priority
                </Typography>
                <Select
                  fullWidth
                  displayEmpty
                  size="small"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  sx={{
                    fontSize: "14px",
                    color: priority === "" ? "#9ca3af" : "#111827",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                  }}
                >
                  <MenuItem value="" disabled>
                    Choose priority
                  </MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </Box>
            </>
          )}

          {/* Status */}
          <Box>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                mb: 0.5,
                color: "black",
              }}
            >
              Status
            </Typography>
            <Select
              fullWidth
              displayEmpty
              size="small"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              sx={{
                fontSize: "14px",
                color: status === "" ? "#9ca3af" : "#111827",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
              }}
            >
              <MenuItem value="to-do">To Do</MenuItem>
              <MenuItem value="in-progress">In progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5, pt: 2 }}>
            <Button fullWidth variant="outlined" onClick={onClose}>
              Cancel
            </Button>
            <Button
              fullWidth
              // variant="contained"
              type="submit"
              loading={loading}
              loadingPosition="end"
              sx={{ bgcolor: "#9333ea", color: "white" }}
            >
             {isUpdate ? "Update" : "Save"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

export default CreateTaskModal;
