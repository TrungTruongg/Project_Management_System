import {
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchInput from "./SearchInput";
import { Info, Notifications } from "@mui/icons-material";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { useUser } from "./context/UserContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Header() {
  const { user } = useUser();
  const [users, setUsers] = useState<any[]>([]);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const response = await axios.get(
        "https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=69205e8dbf3939eacf2e89f2"
      );
      setUsers(response.data.data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = async () => {
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
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {user && users.map((user) => (
            <Avatar
              key={user.id}
              src={user.avatar || "/images/user_avatar.jpg"}
              sx={{
                width: 35,
                height: 35,
                fontSize: 18,
                ml: user.id > 0 ? -1 : 0,
                border: "2px solid white",
                textTransform: "uppercase"
              }}
            >
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </Avatar>
          ))}
        </Box>
        <IconButton sx={{ bgcolor: "white" }}>
          <Notifications />
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
                    width: { xs: 32, sm: 36, md: 40 },
                    height: { xs: 32, sm: 36, md: 40 },
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
              sx={{ mt: 2 }}
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
                  <PersonIcon sx={{ marginRight: "8px" }} />
                  <Typography sx={{ textTransform: "capitalize" }}>
                    {user?.firstName} {user?.lastName}
                  </Typography>
                </Box>
              </MenuItem>

              {/* <MenuItem
                key="settings"
                sx={{ gap: 2, alignItems: "center", color: "#001e2b" }}
                onClick={handleSetting}
                divider
              >
                <SettingsIcon />
                <Typography>Settings</Typography>
              </MenuItem> */}
              <MenuItem
                key="logout"
                sx={{ gap: 2, alignItems: "center", color: "#d32f2f" }}
                onClick={handleLogout}
              >
                <LogoutIcon />
                <Typography>Logout</Typography>
              </MenuItem>
            </Menu>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default Header;
