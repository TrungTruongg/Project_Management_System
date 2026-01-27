import { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdDelete } from "react-icons/md";
import HighPriority from "../../assets/HighPriority";
import MediumPriority from "../../assets/MediumPriority";
import LowPriority from "../../assets/LowPriority";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  ListItemText,
  MenuItem,
  Modal,
  Select,
  Snackbar,
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
  const [isStatusOnly, setIsStatusOnly] = useState(false);
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState<string | "">("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<string[]>([]);
  const [attachmentInput, setAttachmentInput] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState("");
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [status, setStatus] = useState("to-do");
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUpdate = selectedTask !== null;

  const shortenFileName = (fileName: string, maxLength: number = 20) => {
    if (!fileName || fileName.length <= maxLength) return fileName;

    const ext = fileName.split('.').pop();
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    const availableLength = maxLength - (ext ? ext.length + 1 : 0) - 3; // -3 for "..."

    if (availableLength <= 0) return fileName;

    return `${nameWithoutExt.substring(0, availableLength)}...${ext ? '.' + ext : ''}`;
  };

  // Helper function to format upload date
  const formatUploadDate = (dateString: string) => {
    if (!dateString) return '';

    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

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
            isExisting: true,
            uploadedAt: att.uploadedAt
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
      setSnackbar({
        open: true,
        message: "Invalid url",
        type: "error",
      });
      return;
    }

    try {
      new URL(url);
      setSnackbar({
        open: true,
        message: "Add link successfully!",
        type: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Invalid url",
        type: "error",
      });
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

  const handleProjectChange = (newProjectId: string) => {
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

    if (start >= end) {
      setSnackbar({
        open: true,
        message: "End Date must be after Start Date",
        type: "error",
      });
      return;
    }
    if (end < now) {
      setSnackbar({
        open: true,
        message: "End Date cannot be in the past",
        type: "error",
      });
      return;
    }
    if (projectStart && start < projectStart) {
      setSnackbar({
        open: true,
        message: "Start Date cannot before Project Start Date",
        type: "error",
      });
      return;
    }
    if (projectEnd && end > projectEnd) {
      setSnackbar({
        open: true,
        message: "End Date cannot after Project End Date",
        type: "error",
      });
      return;
    }
    return true;
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

  const validateForm = () => {
    if (!name.trim() || !projectId || !priority || !status) {
      setShowError(true);
      return false;
    }
    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const dateError = validateDates();
    if (!dateError) return;

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
        setSnackbar({
          open: true,
          message: "Update task successfully!",
          type: "success",
        });
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
        setSnackbar({
          open: true,
          message: "Create task successfully!",
          type: "success",
        });
      }

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

        try {
          await api.post("/attachments/create", {
            taskId: taskId,
            url: finalUrl,
            name: att.name,
            type: att.type,
            createdBy: user?._id,
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
      setShowError(false);

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
    }
  }, [open, selectedTask, currentProject]);

  const projectMembers = getProjectMembers();

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
      >
        <Box
          component="form"
          onSubmit={handleSave}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95%", sm: "90%", md: "600px" },
            maxHeight: "90vh",
            bgcolor: "background.paper",
            borderRadius: "8px",
            boxShadow: 24,
            display: "flex",
            flexDirection: "column",
          }}>

          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid #e5e7eb",
              flexShrink: 0,
            }}>
            <Typography
              sx={{
                fontSize: "18px",
                lineHeight: "28px",
                fontWeight: 600,
              }}
            >
              {isStatusOnly ? "Update Task Status" : isUpdate ? "Update Task" : "Create Task"}
            </Typography>
          </Box>

          {/* Content */}
          <Box sx={{
            p: 2,
            overflow: "auto",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}>
            {!isStatusOnly && (
              <>
                {/* Name */}
                <Box>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 500,
                      mb: 0.5,
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
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        fontSize: "14px",
                      }
                    }}
                  />
                  {showError && !name.trim() && (
                    <Typography sx={{ fontSize: "12px", color: "#ef4444", mt: 0.5 }}>
                      Task name is required
                    </Typography>
                  )}
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
                    Project <span className="text-red-500">*</span>
                  </Typography>
                  <Select
                    fullWidth
                    displayEmpty
                    size="small"
                    defaultValue=""
                    value={projectId}
                    error={showError && !projectId}
                    onChange={(e) => handleProjectChange(String(e.target.value))}
                    sx={{
                      fontSize: "14px",
                      color: projectId === "" ? "#9ca3af" : "",
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

                  {showError && !projectId && (
                    <Typography sx={{ fontSize: "12px", color: "#ef4444", mt: 0.5 }}>
                      Project name is required
                    </Typography>
                  )}
                </Box>

                <Box className="gap-4">
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 500,
                      mb: 0.5,
                    }}
                  >
                    Description
                  </Typography>
                  <Box
                    sx={{
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      "&:focus-within": {
                        border: "2px solid #1976d2",
                      },
                      "& textarea": {
                        "&::placeholder": {
                          color: "#9ca3af",
                        },
                      },
                    }}
                  >
                    <TextareaAutosize
                      placeholder="Type description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      minRows={3}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "14px",
                        resize: "none",
                        fontFamily: "inherit",
                        outline: "none",
                      }}
                    />
                  </Box>
                </Box>

                {/* Attachments */}
                <Box>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
                    <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
                      Attachments
                    </Typography>

                    <Chip
                      label={attachments.length}
                      size="small"
                      sx={{
                        width: 23,
                        height: 23,
                        fontSize: "10px",
                        fontWeight: 500,
                      }}
                    />
                  </Box>

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
                        }
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
                      gap: 1,
                      overflowX: "auto",
                      overflowY: "hidden",
                      padding: "8px 4px",
                      borderRadius: "4px",

                    }}>
                      {attachments.map((att, i) => {
                        const ext = att.name?.split('.').pop()?.toLowerCase();

                        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
                        const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'];
                        const docExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];

                        const isImage = ext && imageExtensions.includes(ext);
                        const isVideo = ext && videoExtensions.includes(ext);
                        const isDoc = ext && docExtensions.includes(ext);

                        let processedUrl = att.url || '';
                        if (att.file && !processedUrl) {
                          processedUrl = URL.createObjectURL(att.file);
                        }

                        if (processedUrl && processedUrl.startsWith('/uploads/')) {
                          const baseURL = import.meta.env.VITE_SERVER_URL;
                          processedUrl = baseURL + processedUrl;
                        }

                        return (
                          <Box
                            key={i}
                            sx={{
                              position: "relative",
                              flexShrink: 0,
                              width: "140px",
                              border: "1px solid #e5e7eb",
                              borderRadius: "6px",
                              overflow: "hidden",
                              backgroundColor: "#ffffff",
                              transition: "all 0.2s",
                              "&:hover": {
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                borderColor: "#9333ea",
                              }
                            }}
                          >
                            {/* Thumbnail/Preview */}
                            <Box
                              sx={{
                                height: "90px",
                                backgroundColor: "#f9fafb",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: att.type === 'link' || att.url ? "pointer" : "default",
                                overflow: "hidden",
                              }}
                              onClick={() => {
                                if (processedUrl && att.isExisting) {
                                  window.open(processedUrl, '_blank');
                                }
                              }}
                            >
                              {isImage && processedUrl ? (
                                <img
                                  src={processedUrl}
                                  alt={att.name}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : isVideo && processedUrl ? (
                                <video
                                  src={processedUrl}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : isDoc ? (
                                <iframe
                                  src={processedUrl}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                    pointerEvents: 'none',
                                  }}
                                  title={att.name}
                                />
                              ) : (
                                <Box sx={{ textAlign: "center", color: "#6b7280" }}>
                                  <MdAttachFile style={{ fontSize: "40px" }} />
                                  <Typography sx={{ fontSize: "10px", fontWeight: 600, mt: 0.5 }}>
                                    {att.type === 'link' ? 'LINK' : 'FILE'}
                                  </Typography>
                                </Box>
                              )}
                            </Box>

                            {/* File Info */}
                            <Box sx={{ padding: "8px" }}>
                              <Typography
                                sx={{
                                  fontSize: "12px",
                                  fontWeight: 500,
                                  color: "#111827",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  lineHeight: "16px",
                                }}
                                title={att.name}
                              >
                                {shortenFileName(att.name, 18)}
                              </Typography>

                              {/* Upload date/time */}
                              {att.uploadedAt && (
                                <Typography
                                  sx={{
                                    fontSize: "10px",
                                    color: "#6b7280",
                                    lineHeight: "14px",
                                  }}
                                >
                                  {att.uploadedAt ? formatUploadDate(att.uploadedAt) : 'Uploaded'}
                                </Typography>
                              )}
                            </Box>

                            {/* Delete Button */}
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveAttachment(i)}
                              sx={{
                                position: "absolute",
                                top: "4px",
                                right: "4px",
                                padding: "4px",
                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                "&:hover": {
                                  backgroundColor: "#fee2e2",
                                }
                              }}
                            >
                              <MdDelete style={{ fontSize: "16px", color: "#ef4444" }} />
                            </IconButton>
                          </Box>
                        );
                      })}
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
                          color: startDate === "" ? "#9ca3af" : "",
                        }
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
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          fontSize: "14px",
                          color: endDate === "" ? "#9ca3af" : "",
                        }
                      }}
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 500,
                      mb: 0.5
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
                    onChange={(e) => setAssignedTo(e.target.value as [])}
                    value={assignedTo}
                    renderValue={(selected) => {
                      if (selected.length === 0) {
                        return (
                          <span style={{ color: "#9ca3af" }}>Choose members</span>
                        );
                      }
                      return (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {selected.map((userId: any) => {
                            const member = users.find((u: any) => u._id === userId);
                            return (
                              <Chip
                                key={userId}
                                label={`${member?.firstName} ${member?.lastName}`}
                                size="small"
  
                              />
                            );
                          })}
                        </Box>
                      );
                    }}
                    sx={{
                      fontSize: "14px",
                      color: "black",
                      textTransform: "capitalize"
                    }}
                  >
                    {projectMembers.length === 0 ? (
                      <MenuItem disabled>No members in project</MenuItem>
                    ) : (
                      projectMembers.map((member: any) => (
                        <MenuItem value={member._id} key={member._id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              src={member.avatar}
                              sx={{
                                width: 32,
                                height: 32,
                                fontSize: "12px",
                                bgcolor: "#E0E0E0",
                                color: "#484c7f",
                                fontWeight: 600,
                                textTransform: "uppercase",
                              }}
                              title={`${member.firstName} ${member.lastName}`}
                            >
                              {member.firstName?.[0]}
                              {member.lastName?.[0]}
                            </Avatar>
                            <ListItemText
                              primary={`${member.firstName} ${member.lastName}`}
                              secondary={member.email.toLowerCase()}
                            />
                          </Box>
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
                    }}
                  >
                    Priority <span className="text-red-500">*</span>
                  </Typography>
                  <Select
                    fullWidth
                    displayEmpty
                    size="small"
                    value={priority}
                    error={showError && !priority}
                    onChange={(e) => setPriority(e.target.value)}
                    sx={{
                      fontSize: "14px",
                      color: priority === "" ? "#9ca3af" : "",
                    }}
                  >
                    <MenuItem value="" disabled>
                      Choose priority
                    </MenuItem>
                    <MenuItem value="high">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HighPriority />
                        <span>High</span>
                      </Box>
                    </MenuItem>
                    <MenuItem value="medium">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MediumPriority />
                        <span>Medium</span>
                      </Box>
                    </MenuItem>
                    <MenuItem value="low">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LowPriority />
                        <span>Low</span>
                      </Box>
                    </MenuItem>
                  </Select>

                  {showError && !priority && (
                    <Typography sx={{ fontSize: "12px", color: "#ef4444", mt: 0.5 }}>
                      Priority is required
                    </Typography>
                  )}
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
                }}
              >
                Status <span className="text-red-500">*</span>
              </Typography>
              <Select
                fullWidth
                displayEmpty
                size="small"
                value={status}
                error={showError && !status}
                onChange={(e) => setStatus(e.target.value)}
                sx={{
                  fontSize: "14px",
                  color: status === "" ? "#9ca3af" : "",
                }}
              >
                <MenuItem value="" disabled>
                  Choose Status
                </MenuItem>
                <MenuItem value="to-do">To Do</MenuItem>
                <MenuItem value="in-progress">In progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
              {showError && !status && (
                <Typography sx={{ fontSize: "12px", color: "#ef4444", mt: 0.5 }}>
                  Status is required
                </Typography>
              )}
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        sx={{ mt: 10 }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.type}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default CreateTaskModal;
