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
import { CalendarToday, Assignment, ContactSupport as SupportIcon } from "@mui/icons-material";
import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "./context/UserContext";
import { useNavigate } from "react-router-dom";

const API_KEY = import.meta.env.VITE_API_KEY;

function NotificationModal({ open, onClose, currentUser }: any) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    if (!currentUser) return;

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

      responseNotification.data.data.data.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setNotifications(responseNotification.data.data.data);
      setUsers(responseUser.data.data.data);
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
              {notifications.map((notification, index) => {
                const assignedBy = users.find(u => u.id === notification.createdBy);
                return (
                  <>
                    <ListItem
                      key={notification.id}
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
                        "&:hover": {
                          bgcolor: "#f9fafb",
                        },
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
                            <SupportIcon /> // Hoặc icon phù hợp
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
                          <Box sx={{ mt: 0.5 }}>
                            <Typography
                              variant="body2"
                              color="text.primary"
                              sx={{ mb: 1 }}
                            >
                              {assignedBy?.firstName} {assignedBy?.lastName} {notification?.description}
                            </Typography>

                          </Box>
                        }
                      />
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </>
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
