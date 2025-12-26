import { useEffect, useState } from "react";
import { IoMdClose as CloseIcon } from "react-icons/io";

import {
  Box,
  Button,
  Chip,
  MenuItem,
  Modal,
  Select,
  TextareaAutosize,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { createNotification } from "../utils/createNotification";
import { useUser } from "../context/UserContext";

const API_KEY = import.meta.env.VITE_API_KEY;

function CreateTaskModal({
  open,
  onClose,
  onSave,
  onUpdate,
  // taskList = [],
  selectedTask = null,
  currentProject,
}: any) {
  // Check if this is a status-only update (member updating assigned task)
  const [isStatusOnly, setIsStatusOnly] = useState(false);
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]); // Array of URLs
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

  const isUpdate = selectedTask !== null;

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [responseProject, responseUser, responseAttachment] =
        await Promise.all([
          axios.get(
            `https://mindx-mockup-server.vercel.app/api/resources/projects?apiKey=${API_KEY}`
          ),
          axios.get(
            `https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=${API_KEY}`
          ),
          axios.get(
            `https://mindx-mockup-server.vercel.app/api/resources/attachments?apiKey=${API_KEY}`
          ),
        ]);

      setProjects(responseProject.data.data.data);
      setUsers(responseUser.data.data.data);

      if (selectedTask) {
        const taskAttachments = responseAttachment.data.data.data
          .filter((att: any) => att.taskId === selectedTask.id)
          .map((att: any) => att.url);
        setAttachments(taskAttachments);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttachment = () => {
    const url = attachmentInput.trim();
    if (!url) return;

    if (url.startsWith('data:')) {
      setShowError(true);
      return;
    }

    // Validate URL 
    try {
      new URL(url);
    } catch (error) {
      alert('Please enter a valid URL');
      return;
    }

    setAttachments([...attachments, url]);
    setAttachmentInput("");
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const getShortenedUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split('/').filter(Boolean).pop() || urlObj.hostname.replace('www.', '');
      return fileName.length > 40 ? fileName.substring(0, 37) + '...' : fileName;
    } catch {
      return url.length > 40 ? url.substring(0, 37) + '...' : url;
    }
  };

  const getProjectMembers = () => {
    const selectedProjectId = currentProject?.id || projectId;
    if (!selectedProjectId) return [];

    const project = projects.find((p) => p.id === selectedProjectId);
    if (!project?.members) return [];

    return users.filter((u) => project.members.includes(u.id));
  };

  const handleProjectChange = (newProjectId: number) => {
    setProjectId(newProjectId);
    setAssignedTo([]);

    const selectedProject = projects.find((p) => p.id === newProjectId);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('selectedTask:', selectedTask);
    console.log('selectedTask._id:', selectedTask?._id);
    console.log('isUpdate:', isUpdate);

    if (!title.trim()) {
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
      const taskRes = await axios.get(
        `https://mindx-mockup-server.vercel.app/api/resources/tasks?apiKey=${API_KEY}`
      );
      let maxId = taskRes.data.data.data.length > 0
        ? Math.max(...taskRes.data.data.data.map((a: any) => a.id))
        : 0;


      // Tính completion dựa vào status
      let completion = 0;
      if (status === "to-do") {
        completion = 0;
      } else if (status === "in-progress") {
        completion = 50; 
      } else if (status === "completed") {
        completion = 100;
      }

      const taskData = {
        id: isUpdate ? selectedTask.id : maxId + 1,
        projectId: isUpdate ? selectedTask.projectId : (currentProject?.id || projectId),
        title,
        description,
        startDate,
        endDate,
        assignedTo,
        priority: priority.toLowerCase(),
        status,
        completion,
      };

      if (isUpdate) {
        const taskToUpdate = taskRes.data.data.data.find(
          (t: any) => t.id === selectedTask.id
        );
        
        if (!taskToUpdate || !taskToUpdate._id) {
          console.error("Cannot find task to update:", selectedTask.id);
          alert("Error: Cannot find task to update");
          setLoading(false);
          return;
        }

        await axios.put(
          `https://mindx-mockup-server.vercel.app/api/resources/tasks/${taskToUpdate._id}?apiKey=${API_KEY}`,
          taskData
        );

        // Delete old attachments tuần tự
        try {
          const attachmentsRes = await axios.get(
            `https://mindx-mockup-server.vercel.app/api/resources/attachments?apiKey=${API_KEY}`
          );
          const oldAttachments = attachmentsRes.data.data.data.filter(
            (att: any) => att.taskId === selectedTask.id
          );

          // Xóa từng attachment một
          for (const att of oldAttachments) {
            try {
              await axios.delete(
                `https://mindx-mockup-server.vercel.app/api/resources/attachments/${att._id}?apiKey=${API_KEY}`
              );
              // Delay 100ms giữa các request
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
              console.error(`Error deleting attachment ${att._id}:`, error);
            }
          }
        } catch (error) {
          console.error("Error deleting attachments:", error);
        }
      } else {
        const response = await axios.post(
          `https://mindx-mockup-server.vercel.app/api/resources/tasks?apiKey=${API_KEY}`,
          taskData
        );
        taskData.id = response.data.data.id;
      }

      // Save new attachments
      if (attachments.length > 0) {
        const attachmentsRes = await axios.get(
          `https://mindx-mockup-server.vercel.app/api/resources/attachments?apiKey=${API_KEY}`
        );
        let maxId = attachmentsRes.data.data.data.length > 0
          ? Math.max(...attachmentsRes.data.data.data.map((a: any) => a.id))
          : 0;

        for (const url of attachments) {
          maxId++;
          await axios.post(
            `https://mindx-mockup-server.vercel.app/api/resources/attachments?apiKey=${API_KEY}`,
            {
              id: maxId,
              taskId: taskData.id,
              url,
              name: url.split('/').pop() || 'Link',
              type: 'link',
              uploadedAt: new Date().toISOString(),
            }
          );
        }
      }

      // Send notification
      if (assignedTo.length > 0) {
        await createNotification({
          userId: assignedTo,
          type: "task",
          title: isUpdate ? `Task Updated` : `New Task Assignment`,
          description: isUpdate ? `updated task: ${title}` : `assigned you to task: ${title}`,
          createdBy: user?.id,
        });
      }

      isUpdate ? onUpdate(taskData) : onSave(taskData);
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
        // Check if current user is project owner
        const project = projects.find((p) => p.id === selectedTask.projectId);
        const isOwner = project?.ownerId === user?.id;
        const isAssigned = Array.isArray(selectedTask.assignedTo)
          ? selectedTask.assignedTo.includes(user?.id)
          : selectedTask.assignedTo === user?.id;
        
        // Status-only mode if not owner but assigned to task
        setIsStatusOnly(!isOwner && isAssigned);
        
        setTitle(selectedTask.title || "");
        setProjectId(selectedTask.projectId || "");
        setDescription(selectedTask.description || "");
        setStartDate(selectedTask.startDate || "");
        setEndDate(selectedTask.endDate || "");
        setPriority(selectedTask.priority || "");
        setAssignedTo(Array.isArray(selectedTask.assignedTo) ? selectedTask.assignedTo : []);
        setStatus(selectedTask.status || "");
      } else {
        setIsStatusOnly(false);
        setTitle("");
        setProjectId(currentProject?.id || "");
        setDescription("");
        setAttachments([]);
        setStartDate(currentProject?.startDate || "");
        setEndDate(currentProject?.endDate || "");
        setPriority("");
        setAssignedTo([]);
        setStatus("to-do");
      }
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
      <Box className="relative bg-white rounded-xl w-[500px] max-h-[90vh] overflow-y-auto no-scrollbar shadow-xl mx-auto p-6">
        <Box className="flex items-center justify-between mb-6">
          <Typography
            sx={{
              fontSize: "18px",
              lineHeight: "28px",
              fontWeight: 600,
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
              {/* Title */}
              <Box>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    mb: 0.5
                  }}
                >
                  Title <span className="text-red-500">*</span>
                </Typography>
                <TextField
                  fullWidth
                  type="text"
                  size="small"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Type task title"
                  error={showError && !title.trim()}
                  helperText={showError && !title.trim() ? "Title is required" : ""}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "14px",
                    },
                  }}
                />
              </Box>

              {/* Project */}
              <Box>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    mb: 0.5,
                  }}
                >
                  Project
                </Typography>
                <Select
                  fullWidth
                  displayEmpty
                  size="small"
                  value={projectId}
                  onChange={(e) => handleProjectChange(Number(e.target.value))}
                  sx={{
                    fontSize: "14px",
                    color: projectId === "" ? "#9ca3af" : "#111827",
                  }}
                  disabled={!!currentProject}
                >
                  <MenuItem value="" disabled>
                    Choose Project
                  </MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.title}
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
                  }}
                />
              </Box>

              {/* Attachments Section */}
              <Box>
                <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 1 }}>
                  Attachments
                </Typography>

                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Paste link"
                    value={attachmentInput}
                    onChange={(e) => setAttachmentInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAttachment();
                      }
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        fontSize: "14px",
                      },
                    }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddAttachment}
                  >
                    Add
                  </Button>
                </Box>

                {attachments.length > 0 && (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {attachments.map((url, i) => (
                      <Chip
                        key={i}
                        // icon={<Typography>{getDomainIcon(url)}</Typography>}
                        label={getShortenedUrl(url)}
                        onClick={() => window.open(url, '_blank')}
                        onDelete={() => handleRemoveAttachment(i)}
                        sx={{ maxWidth: "200px", cursor: "pointer" }}
                      />
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
                      mb: 0.5
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
                      },
                    }}
                  />
                </Box>

                <Box className="w-full">
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 500,
                      mb: 0.5,
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
                      },
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
                      : selected.map((id: number) => {
                        const m = users.find((u) => u.id === id);
                        return `${m?.firstName} ${m?.lastName}`;
                      }).join(", ")
                  }
                  sx={{
                    fontSize: "14px",
                  }}
                >
                  {projectMembers.length === 0 ? (
                    <MenuItem disabled>No members in project</MenuItem>
                  ) : (
                    projectMembers.map((m: any) => (
                      <MenuItem key={m.id} value={m.id}>
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
                    color: "#374151",
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

          {/* Status - Always visible */}
          <Box>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                mb: 0.5,
                color: "#374151",
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
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{ bgcolor: "#9333ea", "&:hover": { bgcolor: "#7e22ce" } }}
            >
              {loading ? "Saving..." : isUpdate ? "Update" : "Create"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

export default CreateTaskModal;
