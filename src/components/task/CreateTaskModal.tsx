import { useEffect, useState } from "react";
import { IoMdClose as CloseIcon } from "react-icons/io";
import {
  AttachFile as AttachmentIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon
} from "@mui/icons-material";

import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Modal,
  Select,
  TextareaAutosize,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";

function CreateTaskModal({
  open,
  onClose,
  onSave,
  onUpdate,
  taskList = [],
  selectedTask = null,
}: any) {
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState("");
  const [assignedTo, setAssignedTo] = useState<number[]>([]);
  const [status, setStatus] = useState("in-process");
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const isUpdate = selectedTask !== null;

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [responseProject, responseUser] = await Promise.all([
        axios.get(
          "https://mindx-mockup-server.vercel.app/api/resources/projects?apiKey=69205e8dbf3939eacf2e89f2"
        ),
        axios.get(
          "https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=69205e8dbf3939eacf2e89f2"
        )
      ]);

      setProjects(responseProject.data.data.data);
      setUsers(responseUser.data.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const convertFileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
    };

    // Convert files to base64
    const filePromises = Array.from(files).map(async (file) => {
      const base64 = await convertFileToBase64(file);

      return {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: base64, // ✅ Lưu base64 thay vì blob URL
        uploadedAt: new Date().toISOString(),
      };
    });

    const newAttachments = await Promise.all(filePromises);
    setAttachments([...attachments, ...newAttachments]);
  };

  // Remove attachment
  const handleRemoveAttachment = (attachmentId: number) => {
    setAttachments(attachments.filter((att) => att.id !== attachmentId));
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getProjectMembers = () => {
    if (!projectId) return [];

    const selectedProject = projects.find((p) => p.id === projectId);

    if (
      !selectedProject ||
      !selectedProject.member ||
      !Array.isArray(selectedProject.member)
    ) {
      return [];
    }

    return users.filter((user) => selectedProject.member.includes(user.id));
  };

  const handleProjectChange = (newProjectId: number) => {
    setProjectId(newProjectId);
    setAssignedTo([]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setShowError(true);
      return;
    }

    setLoading(true);

    try {
      const attachmentsData = attachments.map(({ file, ...rest }) => rest);

      if (isUpdate) {
        const updatedTask = {
          id: selectedTask.id,
          projectId: selectedTask.projectId,
          title: title,
          description: description,
          attachments: attachmentsData,
          startDate: startDate,
          endDate: endDate,
          assignedTo: assignedTo,
          priority: priority.toLowerCase(),
          status: status,
          completion: selectedTask.completion || 0,
        };

        const response = await axios.put(
          `https://mindx-mockup-server.vercel.app/api/resources/tasks/${selectedTask._id}?apiKey=69205e8dbf3939eacf2e89f2`,
          updatedTask
        );

        onUpdate(response.data.data);
        onClose();
      } else {
        const maxId =
          taskList.length > 0 ? Math.max(...taskList.map((p: any) => p.id)) : 0;

        const newTask = {
          id: maxId + 1,
          projectId: projectId,
          title: title,
          description: description,
          attachments: attachmentsData,
          startDate: startDate,
          endDate: endDate,
          assignedTo: assignedTo,
          priority: priority.toLowerCase(),
          status: status,
          completion: 0,
        };

        const response = await axios.post(
          "https://mindx-mockup-server.vercel.app/api/resources/tasks?apiKey=69205e8dbf3939eacf2e89f2",
          newTask
        );

        onSave(response.data.data);
        onClose();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (selectedTask) {
        // Edit
        setTitle(selectedTask.title || "");
        setProjectId(selectedTask.projectId || "");
        setDescription(selectedTask.description || "");
        setAttachments(selectedTask.attachments || []);
        setStartDate(selectedTask.startDate || "");
        setEndDate(selectedTask.endDate || "");
        setPriority(selectedTask.priority || "");
        setAssignedTo(
          Array.isArray(selectedTask.assignedTo)
            ? selectedTask.assignedTo
            : selectedTask.assignedTo
              ? [selectedTask.assignedTo]
              : []
        );
        setStatus(selectedTask.status || "");
      } else {
        // Create
        setTitle("");
        setProjectId("");
        setDescription("");
        setAttachments([]);
        setStartDate("");
        setEndDate("");
        setPriority("");
        setAssignedTo([]);
        setStatus("in-progress");
      }
      setShowError(false);
      setLoading(false);
    }
    fetchAllData();
  }, [open, selectedTask]);

  const projectMembers = getProjectMembers();

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      className="flex items-center justify-center"
    >
      <Box className="relative bg-white rounded-xl w-[500px] max-h-screen overflow-scroll overflow-y-auto shadow-xl mx-auto p-6">
        <Box className="flex items-center justify-between mb-6">
          <Typography
            sx={{
              fontSize: "18px",
              lineHeight: "28px",
              fontWeight: 600,
            }}
          >
            {isUpdate ? "Update Task" : "Create Task"}
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
          <Box className=" gap-4">
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                mb: 0.5,
                color: "#374151",
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
              placeholder="Type title of task"
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "14px",
                },
              }}
            />
            {showError && !title.trim() && (
              <Typography sx={{ fontSize: "12px", color: "#ef4444", mt: 0.5 }}>
                Title is required
              </Typography>
            )}
          </Box>

          <Box className="gap-4">
            <Typography
              sx={{
                fontWeight: 500,
                mb: 0.5,
                color: "#374151",
              }}
              className="text-[14px]"
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
            >
              <MenuItem value="" disabled>
                Choose Project
              </MenuItem>

              {projects.map((project) => {
                return (
                  <MenuItem key={project.id} value={project.id}>
                    {project.title}
                  </MenuItem>
                );
              })}
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
              minRows={4}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "none",
                outline: "none",
              }}
            />
          </Box>

          {/* ✅ Attachments Section */}
          <Box>
            <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 1 }}>
              Attachments
            </Typography>

            {/* Upload Button */}
            <Button
              component="label"
              variant="outlined"
              startIcon={<AttachmentIcon />}
              sx={{ textTransform: "none", mb: 2 }}
            >
              Upload files
              <input
                type="file"
                hidden
                multiple
                onChange={handleFileChange}
              />
            </Button>

            {/* Attachments List */}
            {attachments.length > 0 && (
              <List sx={{ bgcolor: "#f9fafb", borderRadius: 1, p: 1 }}>
                {attachments.map((attachment) => (
                  <ListItem
                    key={attachment.id}
                    sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: "white",
                    }}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleRemoveAttachment(attachment.id)}
                        sx={{ color: "#EF5350" }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      <FileIcon sx={{ color: "#2196F3" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, fontSize: "0.9rem" }}
                        >
                          {attachment.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(attachment.size)}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          <Box className="flex gap-4">
            <Box className="w-full">
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  mb: 0.5,
                  color: "#374151",
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
                  color: "#374151",
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontSize: "14px",
                  },
                }}
              />
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                mb: 0.5,
                color: "#374151",
              }}
            >
              Task Assign Person
            </Typography>

            <Select
              fullWidth
              size="small"
              displayEmpty
              disabled={!projectId}
              multiple
              onChange={(e) => {
                const value = e.target.value;
                setAssignedTo(typeof value === "string" ? [] : value);
              }}
              value={assignedTo}
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return (
                    <span style={{ color: "#9ca3af" }}>
                      {!projectId
                        ? "Please select a project first"
                        : projectMembers.length === 0
                          ? "No members in this project"
                          : "Choose members"}
                    </span>
                  );
                }

                const selectedNames = selected.map((userId: number) => {
                  const member = users.find((m: any) => m.id === userId);
                  return (
                    `${member?.firstName} ${member?.lastName}` || "Unknown"
                  );
                });

                return selectedNames.join(", ");
              }}
              sx={{
                fontSize: "14px",
                color: assignedTo.length === 0 ? "#9ca3af" : "#111827",
                textTransform: "capitalize"
              }}
            >
              {projectMembers.length === 0 ? (
                <MenuItem disabled>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontStyle: "italic",
                      color: "#9ca3af",
                    }}
                  >
                    No members available in this project
                  </Typography>
                </MenuItem>
              ) : (
                projectMembers.map((member: any) => (
                  <MenuItem
                    value={member.id}
                    key={member.id}
                    sx={{
                      fontSize: "14px",
                      textTransform: "capitalize"
                    }}
                  >
                    {member.firstName} {member.lastName}
                  </MenuItem>
                ))
              )}
            </Select>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontWeight: 500,
                mb: 0.5,
                color: "#374151",
              }}
              className="text-[14px]"
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

          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontWeight: 500,
                mb: 0.5,
                color: "#374151",
              }}
              className="text-[14px]"
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
              <MenuItem value="" disabled>
                Choose status
              </MenuItem>
              <MenuItem value="in-progress">In progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={onClose}
              sx={{
                textTransform: "none",
                color: "#374151",
                borderColor: "#d1d5db",
                fontSize: "14px",
                fontWeight: 500,
                py: 1,
                "&:hover": {
                  borderColor: "#9ca3af",
                  backgroundColor: "#f9fafb",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              type="submit"
              loading={loading}
              loadingPosition="end"
              sx={{
                textTransform: "none",
                backgroundColor: "#9333ea",
                fontSize: "14px",
                fontWeight: 500,
                py: 1,
                "&:hover": {
                  backgroundColor: "#7e22ce",
                },
              }}
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
