import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  Person as PersonIcon,
  Loop as StatusIcon,
  AttachFile as AttachmentIcon,
} from "@mui/icons-material";
import CommentSection from "../comment/CommentSection";
import api from "../api/axiosConfig";

function TaskDetail() {
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get("id");

  const [task, setTask] = useState<any>(null);
  const [assignedUsers, setAssignedUsers] = useState<any[]>([]);
  const [project, setProject] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  const fetchTaskDetail = async () => {
    if (!taskId) return;

    setLoading(true);
    try {
      const [tasksRes, usersRes, projectsRes, commentsRes, repliesRes, attachmentsRes] =
        await Promise.all([
          api.get("/tasks"),
          api.get("/users"),
          api.get("/projects"),
          api.get("/comments"),
          api.get("/replies"),
          api.get("/attachments"),
        ]);

      const tasks = tasksRes.data;
      const users = usersRes.data;
      const projects = projectsRes.data;
      const allComments = commentsRes.data || [];
      const allReplies = repliesRes.data || [];
      const attachments = attachmentsRes.data;

      setAllUsers(users);

      const foundTask = tasks.find((task: any) => task._id === taskId);

      if (foundTask) {
        setTask(foundTask);

        const assignedUserIds = Array.isArray(foundTask.assignedTo)
          ? foundTask.assignedTo
          : foundTask.assignedTo
            ? [foundTask.assignedTo]
            : [];

        const assigned = users.filter((u: any) =>
          assignedUserIds.includes(u._id)
        );
        setAssignedUsers(assigned);

        const taskProject = projects.find(
          (p: any) => p._id === foundTask.projectId
        );
        setProject(taskProject);

        const taskComments = allComments.filter(
          (c: any) => c.taskId === foundTask._id
        );

        const taskReplies = allReplies.filter(
          (r: any) => r.taskId === foundTask._id
        );
      
        const mergedComments = [
          ...taskComments,
          ...taskReplies
        ];
        setComments(mergedComments);

        setAttachments(
          attachments.filter((att: any) => att.taskId === foundTask._id)
        );
      }
    } catch (error) {
      console.error("Error fetching task detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetail();
  }, [taskId]);

  const handleSubmitComment = (newComment: any) => {
    setComments([...comments, newComment]);
  };

  const handleUpdateComment = (commentId: string, newContent: string) => {
    setComments(comments.map((c: any) => 
      c._id === commentId 
        ? { ...c, content: newContent, updatedAt: new Date().toISOString() } 
        : c
    ));
  };

  const handleDeleteComment = (commentId: number) => {
    setComments(comments.filter((c) => c._id !== commentId));
  };

  const getStatusChip = (status: string) => {
    const config: any = {
      completed: { label: "Completed", bgcolor: "#4CAF50" },
      "in-progress": { label: "In Progress", bgcolor: "#FF9800" },
      "to-do": { label: "To Do", bgcolor: "#F44336" },
    };

    const statusConfig = config[status] || config.pending;

    return (
      <Chip
        label={statusConfig.label}
        size="small"
        sx={{
          bgcolor: statusConfig.bgcolor,
          color: "white",
          fontWeight: 600,
          fontSize: "0.85rem",
          height: 28,
          px: 1,
        }}
      />
    );
  };

  const getPriorityChip = (priority: string) => {
    const config: any = {
      high: { label: "High", bgcolor: "#EF5350" },
      medium: { label: "Medium", bgcolor: "#FF9800" },
      low: { label: "Low", bgcolor: "#66BB6A" },
    };

    const priorityConfig = config[priority] || config.medium;

    return (
      <Chip
        label={priorityConfig.label}
        size="small"
        sx={{
          bgcolor: priorityConfig.bgcolor,
          color: "white",
          fontWeight: 600,
          fontSize: "0.85rem",
          height: 28,
          px: 1,
        }}
      />
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!task) {
    return (
      <Box sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="h5" color="text.secondary">
          Task not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="700" sx={{ mb: 4 }}>
        Task Detail
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 3,
          mb: 4,
        }}
      >
        {/* Status Card */}
        <Card
          sx={{
            boxShadow: 2,
            borderRadius: 2,
            transition: "all 0.3s",
          }}
        >
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: "#FFF9C4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <StatusIcon sx={{ fontSize: 32, color: "#F57F17" }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>{getStatusChip(task.status)}</Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Assigned Users Card */}
        <Card
          sx={{
            boxShadow: 2,
            borderRadius: 2,
            transition: "all 0.3s",
          }}
        >
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: "#B3E5FC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PersonIcon sx={{ fontSize: 32, color: "#0277BD" }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Assigned To
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mt: 0.5,
                  }}
                >
                  {assignedUsers.length > 0 ? (
                    assignedUsers.map((assignedUser) => (
                      <Box
                        key={assignedUser._id}
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <Avatar
                          src={assignedUser?.avatar}
                          sx={{
                            width: 28,
                            height: 28,
                            fontSize: "0.75rem",
                            bgcolor: "#E0E0E0",
                            textTransform: "uppercase",
                          }}
                        >
                          {assignedUser?.firstName?.[0]}
                          {assignedUser?.lastName?.[0]}
                        </Avatar>
                        <Typography fontSize="13px">
                          {assignedUser.firstName} {assignedUser.lastName}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Unassigned
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Task Content */}
      <Card
        sx={{
          boxShadow: 2,
          borderRadius: 2,
          mb: 4,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              pb: 2,
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <Box>
              {project && (
                <Chip
                  label={project.name}
                  size="small"
                  sx={{
                    bgcolor: "#F3E5F5",
                    color: "#7B1FA2",
                    fontSize: "0.75rem",
                    mb: 1,
                    textTransform: "capitalize",
                  }}
                />
              )}
              {
                task.startDate && task.endDate ?
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.85rem" }}
                  >
                    {new Date(task.startDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    -{" "}
                    {new Date(task.endDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Typography>
                  : <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.85rem" }}
                  >No deadline</Typography>
              }

            </Box>
          </Box>

          {/* Title */}
          <Typography variant="h5" fontWeight="700">
            {task.name.toUpperCase()}
          </Typography>

          {/* Description */}
          <Box>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                lineHeight: 1.8,
                whiteSpace: "pre-wrap",
              }}
            >
              {task.description || "No description provided"}
            </Typography>
          </Box>

          {/* Additional Info */}
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: "1px solid #e0e0e0",
              display: "flex",
              gap: 4,
              flexWrap: "wrap",
            }}
          >
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
              >
                Priority
              </Typography>
              {getPriorityChip(task.priority)}
            </Box>
          </Box>

          {attachments && attachments.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography fontSize="12">
                Attachments
              </Typography>
              <List>
                {attachments.map((att: any, index: number) => {
                  let processedUrl = att.url;
                  if (processedUrl.startsWith('/uploads/')) {
                    const baseURL = 'http://localhost:6969';
                    processedUrl = baseURL + processedUrl;
                  }
                  
                  return (
                    <ListItem
                      key={att._id || index}
                      component="a"
                      href={processedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        border: (theme) =>
                          `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`,
                        borderRadius: 1,
                        mb: 1,
                        textDecoration: "none",
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <ListItemIcon>
                        <AttachmentIcon sx={{ color: "#2196F3" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            sx={{
                              color: "#2196F3",
                              wordBreak: "break-all",
                            }}
                          >
                            {att.url.split("/").pop()}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            Uploaded at:{" "}
                            {new Date(att.uploadedAt).toLocaleString()}
                          </Typography>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Comments Section */}
      <CommentSection
        taskId={task._id}
        comments={comments}
        onSubmit={handleSubmitComment}
        onDelete={handleDeleteComment}
        onUpdate={handleUpdateComment}
        assignedUsers={allUsers}
      />
    </Box>
  );
}

export default TaskDetail;
