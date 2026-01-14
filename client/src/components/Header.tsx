import {
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchInput from "./SearchInput";
import { Info, Notifications, Settings as SettingsIcon } from "@mui/icons-material";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { useUser } from "./context/UserContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationModal from "./NotificationModal";
import api from "./api/axiosConfig";

function Header() {
  const [open, setOpen] = useState(false);
  const { setUser, user } = useUser();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const [hasNotification, setHasNotification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [responseProject, responseUser] = await Promise.all([
        api.get("/projects"),
        api.get("/users"),
      ]);

      setProject(responseProject.data);
      setUsers(responseUser.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const checkHasNotification = async () => {
    if (!user) {
      setHasNotification(false);
      return;
    }

    try {
      const response = await api.get("/notifications");
      const notifications = response.data;

      const hasUnread = notifications.some(
        (notif: any) =>
          notif.userId?.includes(user._id) &&
          !notif.isRead &&
          notif.createdBy !== user._id
      );

      setHasNotification(hasUnread);
    } catch (error) {
      console.error("Error checking notification:", error);
    }
  };

  useEffect(() => {
    if (user) checkHasNotification();
    else if (!user) fetchAllData();
    else setHasNotification(false);
  }, [user]);

  const handleLogout = async () => {

    localStorage.removeItem("auth");
    localStorage.removeItem("user");

    setUser(null);
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenNotification = () => {
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
    setHasNotification(false);
  }

  const handleProfileSetting = () => {
    setAnchorElUser(null)
    navigate("/profile-settings");
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 4,
      }}
    >
      <SearchInput />

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton sx={{ bgcolor: "white" }}>
          <Info color="primary" />
        </IconButton>
        <AvatarGroup
          max={5}
          sx={{
            '& .MuiAvatar-root': {
              width: 35,
              height: 35,
              fontSize: 15,
              border: "2px solid white",
            }
          }}
        >
          {loading ? (
            [1, 2, 3, 4, 5].map((index) => (
              <Skeleton
                key={index}
                variant="circular"
                animation="wave"
                width={35}
                height={35}
                sx={{ border: "2px solid white", ml: index > 0 ? -1 : 0 }}
              />
            ))
          ) : (
            project.map((project) => {
              const projectMembers = users.filter((user) => project.members.includes(user._id));
              return (

                projectMembers.map((member) => (
                  <Avatar
                    key={member._id}
                    src={member.avatar}
                    sx={{ textTransform: "uppercase", ml: member._id > 0 ? -1 : 0, }}
                  >
                    {member.firstName?.[0]}
                    {member.lastName?.[0]}
                  </Avatar>
                ))
              )
            }))}
        </AvatarGroup>
        <IconButton onClick={handleOpenNotification}>
          <Badge
            variant="dot"
            color="error"
            invisible={!hasNotification}
          >
            <Notifications />
          </Badge>
        </IconButton>
        <Box sx={{ textAlign: "right" }}>
          <Typography variant="body2" fontWeight="bold" sx={{ textTransform: "capitalize" }}>
            {user ? `${user.firstName} ${user.lastName}` : "Guest User"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user ? user.role : "Visitor"}
          </Typography>
        </Box>
        <Box sx={{ flexShrink: 0 }}>
          {user ? (
            <Tooltip
              title={`${user.firstName} ${user.lastName}`}
              sx={{ textTransform: "capitalize" }}
            >
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0.5 }}>
                <Avatar
                  src={user?.avatar || "/images/user_avatar.jpg"}
                  sx={{
                    width: { xs: 10, sm: 36, md: 40 },
                    height: { xs: 10, sm: 36, md: 40 },
                    fontSize: "15px",
                    textTransform: "uppercase"
                  }}
                >
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </Avatar>
              </IconButton>
            </Tooltip>
          ) : (
            <Button
              onClick={handleLogin}
              variant="contained"
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.85rem" },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.6, sm: 0.8 },
                backgroundColor: "#00ed64",
                color: "#001e2b",
                fontWeight: 700,
                textTransform: "none",
                border: "1px solid #001e2b",
                borderRadius: "6px",
                whiteSpace: "nowrap",
                "&:hover": {
                  backgroundColor: "#00d957",
                },
              }}
            >
              Sign In
            </Button>
          )}
          {anchorElUser && (
            <Menu
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              sx={{
                mt: 2,
                "& .MuiList-root": {
                  pb: 0
                },
              }}
              disableScrollLock={true}
            >
              <MenuItem key="profile" sx={{ display: "block", gap: 2 }} divider>
                <Typography
                  sx={{
                    fontWeight: "bold",
                    alignItems: "center",
                    textTransform: "none",
                    color: "#001e2b",
                  }}
                >
                  Signed in as:
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <PersonIcon sx={{ mr: "8px" }} />
                  <Typography sx={{ textTransform: "capitalize" }}>
                    {user?.firstName} {user?.lastName}
                  </Typography>
                </Box>
              </MenuItem>

              <MenuItem
                key="settings"
                sx={{ gap: 2, alignItems: "center", color: "#001e2b" }}
                onClick={handleProfileSetting}
                divider
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <SettingsIcon sx={{ mr: "8px" }} />
                  <Typography>Profile Settings</Typography>
                </Box>
              </MenuItem>
              <MenuItem
                key="logout"
                sx={{ gap: 2, alignItems: "center", color: "#d32f2f" }}
                onClick={handleLogout}
              >
                <Box sx={{ display: "flex", alignItems: "center", }}>
                  <LogoutIcon sx={{ mr: "8px" }} />
                  <Typography>Logout</Typography>
                </Box>
              </MenuItem>
            </Menu>
          )}
        </Box>
      </Box>
      <NotificationModal open={open} onClose={handleClose} currentUser={user} />
    </Box>
  );
}

export default Header;
