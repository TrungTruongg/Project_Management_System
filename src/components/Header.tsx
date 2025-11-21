import { Avatar, Box, IconButton, Typography } from "@mui/material";
import SearchInput from "./SearchInput";
import { Info, Notifications } from "@mui/icons-material";
import { users } from "../constants/constants";

function Header() {
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
          {users.map((user) => (
            <Avatar
              key={user.id}
              sx={{
                width: 35,
                height: 35,
                fontSize: 18,
                ml: user.id > 0 ? -1 : 0,
                border: "2px solid white",
              }}
            >
              {user.avatar}
            </Avatar>
          ))}
        </Box>
        <IconButton sx={{ bgcolor: "white" }}>
          <Notifications />
        </IconButton>
        <Box sx={{ textAlign: "right" }}>
          <Typography variant="body2" fontWeight="bold">
            Trung
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Admin Profile
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: "#FF6B6B", width: 45, height: 45 }}>👨‍💼</Avatar>
      </Box>
    </Box>
  );
}

export default Header;
