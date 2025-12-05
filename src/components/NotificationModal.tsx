import {
  Avatar,
  Badge,
  Box,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Modal,
  Typography,
} from "@mui/material";
import { IoMdClose as CloseIcon } from "react-icons/io";
import { CalendarToday, Assignment } from "@mui/icons-material";
import { useEffect, useState } from "react";
import axios from "axios";

function NotificationModal({ open, onClose, currentUser }: any) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const [projectsRes, tasksRes, usersRes] = await Promise.all([
        axios.get(
          "https://mindx-mockup-server.vercel.app/api/resources/projects?apiKey=69205e8dbf3939eacf2e89f2"
        ),
        axios.get(
          "https://mindx-mockup-server.vercel.app/api/resources/tasks?apiKey=69205e8dbf3939eacf2e89f2"
        ),
        axios.get(
          "https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=69205e8dbf3939eacf2e89f2"
        ),
      ]);

      const projects = projectsRes.data.data.data;
      const tasks = tasksRes.data.data.data;
      const users = usersRes.data.data.data;

      const notificationList: any[] = [];

      // Nếu là staff, lấy projects được giao
      if (currentUser.role === "member") {
        // Projects mà user là member
        const assignedProjects = projects.filter((p: any) =>
          p.member?.includes(currentUser.id)
        );

        assignedProjects.forEach((project: any) => {
          const leader = users.find(
            (user: any) => user.id === project.leaderId
          );
          notificationList.push({
            id: `project-${project.id}`,
            type: "project",
            title: `Added to project: ${project.title}`,
            description: project.description || "No description",
            assignedBy: leader,
            timestamp: project.startDate,
            status: "new",
          });
        });

        // Tasks for user
        const assignedTasks = tasks.filter((task: any) =>
          task.assignedTo?.includes(currentUser.id)
        );

        assignedTasks.forEach((task: any) => {
          const project = projects.find((p: any) => p.id === task.projectId);
          const leader = users.find((u: any) => u.id === project?.leaderId);

          notificationList.push({
            id: `task-${task.id}`,
            type: "task",
            title: `Task assigned: ${task.title}`,
            description: task.description || "No description",
            assignedBy: leader,
            timestamp: task.startDate,
            status: task.status,
            priority: task.priority,
            project: project?.title,
          });
        });
      }

      notificationList.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setNotifications(notificationList);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, currentUser]);

//   const getTimeAgo = (timestamp: string) => {
//     const now = new Date();
//     const time = new Date(timestamp);
//     const diffInMs = now.getTime() - time.getTime();
//     const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
//     const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
//     const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

//     if (diffInMinutes < 60) {
//       return `${diffInMinutes}MIN`;
//     } else if (diffInHours < 24) {
//       return `${diffInHours}HR`;
//     } else {
//       return `${diffInDays}D`;
//     }
//   };

  const getStatusChip = (status: string) => {
    const config: any = {
      new: { label: "New", color: "#4CAF50" },
      "in-progress": { label: "In Progress", color: "#2196F3" },
      completed: { label: "Completed", color: "#9E9E9E" },
      todo: { label: "To Do", color: "#FF9800" },
    };

    const statusConfig = config[status] || config.new;

    return (
      <Chip
        label={statusConfig.label}
        size="small"
        sx={{
          bgcolor: statusConfig.color,
          color: "white",
          fontSize: "0.7rem",
          height: 20,
          fontWeight: 600,
        }}
      />
    );
  };

  const getPriorityColor = (priority: string) => {
    const colors: any = {
      high: "#EF5350",
      medium: "#FF9800",
      low: "#4CAF50",
    };
    return colors[priority] || "#9E9E9E";
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="notification-modal-title"
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        pt: 8,
        pr: 2,
      }}
    >
      <Box
        sx={{
          width: 450,
          maxHeight: "85vh",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            bgcolor: "#484c7f",
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h6" fontWeight="600">
              Notifications
            </Typography>
            <Badge
              badgeContent={notifications.length}
              color="error"
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "0.75rem",
                  height: 20,
                  minWidth: 20,
                },
              }}
            />
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "white",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Notification List */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              bgcolor: "#f1f1f1",
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "#888",
              borderRadius: "4px",
              "&:hover": {
                bgcolor: "#555",
              },
            },
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 10,
              }}
            >
              <Typography color="text.secondary">Loading...</Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 10,
              }}
            >
              <Typography color="text.secondary">
                No notifications yet
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification, index) => (
                <>
                  <ListItem
                    key={notification.id}
                    sx={{
                      alignItems: "flex-start",
                      py: 2,
                      px: 2,
                      bgcolor:
                        notification.status === "new" ? "#f3f4f6" : "transparent",
                      "&:hover": {
                        bgcolor: "#f9fafb",
                      },
                      transition: "all 0.2s",
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor:
                            notification.type === "project"
                              ? "#2196F3"
                              : "#FF9800",
                          width: 48,
                          height: 48,
                        }}
                      >
                        {notification.type === "project" ? (
                          <Assignment />
                        ) : (
                          <CalendarToday />
                        )}
                      </Avatar>
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="body1"
                            fontWeight="600"
                            sx={{ flex: 1, pr: 1 }}
                          >
                            {notification.assignedBy &&
                              `${notification.assignedBy.firstName} ${notification.assignedBy.lastName}`}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            {/* {getTimeAgo(notification.timestamp)} */}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{ mb: 1 }}
                          >
                            {notification.title}
                          </Typography>

                          {notification.project && (
                            <Chip
                              label={notification.project}
                              size="small"
                              sx={{
                                bgcolor: "#F3E5F5",
                                color: "#7B1FA2",
                                fontSize: "0.7rem",
                                height: 20,
                                mr: 1,
                                textTransform: "capitalize",
                              }}
                            />
                          )}

                          {notification.status &&
                            getStatusChip(notification.status)}

                          {notification.priority && (
                            <Box
                              component="span"
                              sx={{
                                ml: 1,
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                bgcolor: getPriorityColor(notification.priority),
                                color: "white",
                                fontSize: "0.7rem",
                                fontWeight: 600,
                              }}
                            >
                              {notification.priority.toUpperCase()}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </>
              ))}
            </List>
          )}
        </Box>

        {/* Footer */}
        {notifications.length > 0 && (
          <Box
            sx={{
              p: 2,
              textAlign: "center",
              borderTop: "1px solid #e0e0e0",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "#484c7f",
                fontWeight: 600,
                cursor: "pointer",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              View all notifications
            </Typography>
          </Box>
        )}
      </Box>
    </Modal>
  );
}

export default NotificationModal;
