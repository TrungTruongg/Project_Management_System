import {
  Avatar,
  Badge,
  Box,
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
import { CalendarToday, Assignment, ContactSupport as SupportIcon, Delete } from "@mui/icons-material";
import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "./context/UserContext";
import { useNavigate } from "react-router-dom";

const API_KEY = import.meta.env.VITE_API_KEY;

function NotificationModal({ open, onClose, currentUser }: any) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    if (!currentUser || !user?.id) return;

    setLoading(true);
    try {
      const [responseNotification, responseUser] = await Promise.all([
        axios.get(
          `https://mindx-mockup-server.vercel.app/api/resources/notifications?apiKey=${API_KEY}`
        ),
        axios.get(
          `https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=${API_KEY}`
        )
      ]);

      // Filter notifications for current user only
      const allNotifications = responseNotification.data.data.data || [];
      const userNotifications = allNotifications.filter((notification: any) => {
        return Array.isArray(notification.userId)
          ? notification.userId.includes(user.id)
          : notification.userId === user.id;
      });

      userNotifications.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setNotifications(userNotifications);
      setUsers(responseUser.data.data.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && user?.id) {
      fetchNotifications();
    }
  }, [open, currentUser, user?.id]);

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);

    if (isNaN(time.getTime())) {
      return "Just now";
    }

    const diffInMs = now.getTime() - time.getTime();

    if (diffInMs < 0) {
      return "Just now";
    }

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hr ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      const months = Math.floor(diffInDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
  }

  const handleDeleteAllNotifications = async () => {
    if (notifications.length === 0) return;

    setDeleteLoading(true);
    let successCount = 0;
    let failureCount = 0;

    try {
      for (const notification of notifications) {
        try {
          if (!notification._id) {
            console.warn("Notification missing _id:", notification);
            failureCount++;
            continue;
          }

          await axios.delete(
            `https://mindx-mockup-server.vercel.app/api/resources/notifications/${notification._id}?apiKey=${API_KEY}`
          );
          successCount++;

          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error deleting notification ${notification.id}:`, error);
          failureCount++;
        }
      }

      // Clear notifications từ state nếu xóa thành công
      setNotifications([]);

      if (failureCount > 0) {
        alert(`Deleted ${successCount} notifications. Failed to delete ${failureCount}.`);
      }
    } catch (error) {
      console.error("Error in delete process:", error);
      alert("Error deleting notifications");
    } finally {
      setDeleteLoading(false);
    }
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              size="small"
              onClick={handleDeleteAllNotifications}
              disabled={deleteLoading || notifications.length === 0}
              sx={{
                color: "white",
                textTransform: "none",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                },
              }}>
              <Delete />
            </IconButton>
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
              {notifications.map((notification, index) => {
                const assignedBy = users.find(u => u.id === notification.createdBy);
                return (
                  <Box key={notification.id}>
                    <ListItem
                      onClick={notification.type === "project"
                        ? () => navigate("/project")
                        : notification.type === "task"
                          ? () => navigate("/task")
                          : () => navigate("/supports-view")
                      }
                      sx={{
                        alignItems: "flex-start",
                        py: 2,
                        px: 2,
                        bgcolor:
                          notification.status === "new" ? "#f3f4f6" : "transparent",
                        "&:hover": { bgcolor: 'action.hover' },
                        transition: "all 0.2s",
                        cursor: "pointer"
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor:
                              notification.type === "project"
                                ? "#2196F3"
                                : user?.role === "leader" && notification.type === "support"
                                  ? "#9C27B0"
                                  : "#FF9800",
                            width: 48,
                            height: 48,
                          }}
                        >
                          {notification.type === "project" ? (
                            <Assignment />
                          ) : user?.role === "leader" && notification.type === "support" ? (
                            <SupportIcon />
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
                              {notification.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ whiteSpace: "nowrap" }}
                            >
                              {getTimeAgo(notification.createdAt)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{ mt: 0.5 }}
                          >
                            {assignedBy?.firstName} {assignedBy?.lastName} {notification?.description}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </Box>
                )
              })}
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
