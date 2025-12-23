import { useEffect, useState } from "react";
import { IoMdClose as CloseIcon } from "react-icons/io";
import {
  AttachFile as AttachmentIcon,
  Delete as DeleteIcon,
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
import { createNotification } from "../utils/createNotification";
import { useUser } from "../context/UserContext";

const API_KEY = import.meta.env.VITE_API_KEY;

function CreateTaskModal({
  open,
  onClose,
  onSave,
  onUpdate,
  taskList = [],
  selectedTask = null,
  currentProject,
}: any) {
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
  const [allAttachments, setAllAttachments] = useState<any[]>([]);

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
      setAllAttachments(responseAttachment.data.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttachment = () => {
    const url = attachmentInput.trim();

    if (!url) return;

    // Validate URL (optional)
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
      const hostname = urlObj.hostname.replace('www.', '');
      const pathname = urlObj.pathname;

      // Lấy tên file hoặc path cuối
      const fileName = pathname.split('/').filter(Boolean).pop() || hostname;

      if (fileName.length > 40) {
        return fileName.substring(0, 37) + '...';
      }

      return fileName;
    } catch {
      return url.length > 40 ? url.substring(0, 37) + '...' : url;
    }
  };

  const getProjectMembers = () => {
    const selectedProjectId = currentProject?.id || projectId;

    if (!selectedProjectId) return [];

    const selectedProject = projects.find((p) => p.id === selectedProjectId);

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

    const selectedProject = projects.find((p) => p.id === newProjectId);
    if (selectedProject) {
      setStartDate(selectedProject.startDate || "");
      setEndDate(selectedProject.endDate || "");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setShowError(true);
      return;
    } if (new Date(startDate) >= new Date(endDate)) {
      setShowError(true);
      return
    } if (new Date(endDate) < new Date()) {
      setShowError(true);
      return
    } if (new Date(startDate) < new Date(currentProject?.startDate)) {
      setShowError(true);
      return
    } if (new Date(endDate) > new Date(currentProject?.endDate)) {
      setShowError(true);
      return
    }

    setLoading(true);

    try {
      if (isUpdate) {
        const updatedTask = {
          id: selectedTask.id,
          projectId: selectedTask.projectId,
          title: title,
          description: description,
          startDate: startDate,
          endDate: endDate,
          assignedTo: assignedTo,
          priority: priority.toLowerCase(),
          status: status,
          completion: selectedTask.completion || 0,
        };

        await axios.put(
          `https://mindx-mockup-server.vercel.app/api/resources/tasks/${selectedTask._id}?apiKey=${API_KEY}`,
          updatedTask
        );

        const existingAttachmentsRes = await axios.get(
          `https://mindx-mockup-server.vercel.app/api/resources/attachments?apiKey=${API_KEY}`
        );
        const existingAttachments = existingAttachmentsRes.data.data.data;
        const taskAttachments = existingAttachments.filter(
          (att: any) => att.taskId === selectedTask.id
        );

        // Xóa attachments cũ
        await Promise.all(
          taskAttachments.map((att: any) =>
            axios.delete(
              `https://mindx-mockup-server.vercel.app/api/resources/attachments/${att._id}?apiKey=${API_KEY}`
            )
          )
        );

        // TẠO ATTACHMENTS MỚI (từ links)
        let maxAttachmentId =
          existingAttachments.length > 0
            ? Math.max(...existingAttachments.map((a: any) => a.id))
            : 0;

        for (const url of attachments) {
          maxAttachmentId++;

          const attachmentData = {
            id: maxAttachmentId,
            taskId: selectedTask.id,
            url: url,
            name: url.split('/').pop() || 'Link', // Lấy tên từ URL
            type: 'link',
            uploadedAt: new Date().toISOString(),
          };

          await axios.post(
            `https://mindx-mockup-server.vercel.app/api/resources/attachments?apiKey=${API_KEY}`,
            attachmentData
          );
        }

        await createNotification({
          userId: assignedTo,
          type: "task",
          title: `Updated Task ${title}`,
          description: `Updated task: ${title}`,
          createdBy: user?.id,
        });

        onUpdate(updatedTask);
        onClose();
      } else {
        const maxId =
          taskList.length > 0 ? Math.max(...taskList.map((p: any) => p.id)) : 0;

        const newTask = {
          id: maxId + 1,
          projectId: currentProject ? currentProject.id : projectId,
          title: title,
          description: description,
          startDate: startDate,
          endDate: endDate,
          assignedTo: assignedTo,
          priority: priority.toLowerCase(),
          status: status,
          completion: status === "completed" ? 100 : 0,
        };

        const response = await axios.post(
          `https://mindx-mockup-server.vercel.app/api/resources/tasks?apiKey=${API_KEY}`,
          newTask
        );

        const createdTask = response.data.data;

        const existingAttachmentsRes = await axios.get(
          `https://mindx-mockup-server.vercel.app/api/resources/attachments?apiKey=${API_KEY}`
        );
        const existingAttachments = existingAttachmentsRes.data.data.data;
        let maxAttachmentId =
          existingAttachments.length > 0
            ? Math.max(...existingAttachments.map((a: any) => a.id))
            : 0;

        for (const url of attachments) {
          maxAttachmentId++;

          const attachmentData = {
            id: maxAttachmentId,
            taskId: createdTask.id,
            url: url,
            name: url.split('/').pop() || 'Link',
            type: 'link',
            uploadedAt: new Date().toISOString(),
          };

          await axios.post(
            `https://mindx-mockup-server.vercel.app/api/resources/attachments?apiKey=${API_KEY}`,
            attachmentData
          );
        }

        await createNotification({
          userId: assignedTo,
          type: "task",
          title: `Created Task ${title}`,
          description: `created task: ${title}`,
          createdBy: user?.id,
        });

        onSave(createdTask);
        onClose();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && users.length > 0) {
      if (selectedTask) {
        // Edit
        const taskAttachments = allAttachments.filter(
          (att: any) => att.taskId === selectedTask.id
        );

        setTitle(selectedTask.title || "");
        setProjectId(selectedTask.projectId || "");
        setDescription(selectedTask.description || "");
        setAttachments(taskAttachments.map((att: any) => att.url));
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
        setProjectId(currentProject ? currentProject.id : "");
        setDescription("");
        setAttachments([]);
        if (currentProject) {
          setStartDate(currentProject.startDate || "");
          setEndDate(currentProject.endDate || "");
        } else {
          setStartDate("");
          setEndDate("");
        }
        setPriority("");
        setAssignedTo([]);
        setStatus("in-progress");
      }
      setShowError(false);
      setLoading(false);
    }
  }, [open, selectedTask, currentProject, allAttachments]);

  useEffect(() => {
    if (open) {
      fetchAllData();
    }
  }, [open]);

  const projectMembers = getProjectMembers();

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
            // disabled={!!currentProject}
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

          {/* Attachments Section */}
          <Box>
            <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 1 }}>
              Attachments (Links)
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
                sx={{
                  textTransform: "none",
                  minWidth: "80px"
                }}
              >
                Add
              </Button>
            </Box>

            {attachments.length > 0 ? (
              <List sx={{ bgcolor: "#f9fafb", borderRadius: 1, p: 1 }}>
                {attachments.map((url, index) => {
                  const shortUrl = getShortenedUrl(url);
                  return (
                    <ListItem
                      key={index}
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
                          onClick={() => handleRemoveAttachment(index)}
                          sx={{ color: "#EF5350" }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <AttachmentIcon sx={{ color: "#2196F3" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            component="a"
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              fontWeight: 500,
                              fontSize: "0.9rem",
                              color: "#2196F3",
                              textDecoration: "none",
                              "&:hover": {
                                textDecoration: "underline",
                              },
                              wordBreak: "break-all",
                            }}
                          >
                            {shortUrl}
                          </Typography>
                        }
                      />
                    </ListItem>
                  )
                })}
              </List>
            ) : (
              <Typography
                sx={{
                  fontSize: "14px",
                  color: "#9ca3af",
                  fontStyle: "italic",
                  textAlign: "center",
                  py: 2,
                  bgcolor: "#f9fafb",
                  borderRadius: 1,
                }}
              >
                No attachments yet
              </Typography>
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
              {new Date(startDate) < new Date(currentProject?.startDate) && (
                <Typography sx={{ fontSize: 12, color: "#ef4444", mt: 0.5 }}>
                  Start Date cannot be before project Start Date
                </Typography>
              )}
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

              {showError && startDate >= endDate ? (
                <Typography sx={{ fontSize: "12px", color: "#ef4444", mt: 0.5 }}>
                  End Date cannot smaller or equal than Start Date
                </Typography>
              ) : new Date(endDate) < new Date() ? (
                <Typography sx={{ fontSize: 12, color: "#ef4444", mt: 0.5 }}>
                  End Date cannot be in the past
                </Typography>
              ) : new Date(endDate) > new Date(currentProject?.endDate) ? (
                <Typography sx={{ fontSize: 12, color: "#ef4444", mt: 0.5 }}>
                  End Date cannot be after project End Date
                </Typography>
              ) : null}

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
              disabled={!projectId && !currentProject}
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
                      {!projectId && !currentProject
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
                textTransform: "capitalize",
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
                      textTransform: "capitalize",
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
              <MenuItem value="to-do">To Do</MenuItem>
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
