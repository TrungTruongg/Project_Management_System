import { useState } from "react";
import { FaBriefcase as ProjectIcon } from "react-icons/fa";
import { FaHome as DashboardIcon } from "react-icons/fa";
import { FaUsers as EmployeesIcon } from "react-icons/fa";
import { MdLogout as LogoutIcon } from "react-icons/md";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import TaskIcon from "./icons/TaskIcon";

const drawerWidth = 240;

function Dashboard() {
  const [activeTab, setActiveTab] = useState<number>(0);

  const menuItems = [
    { id: "dashboard", text: "Dashboard", icon: <DashboardIcon /> },
    {
      id: "projects",
      text: "Projects",
      icon: <ProjectIcon />,
      submenu: ["Projects", "Tasks", "Timesheet"],
    },
    {
      id: "employees",
      text: "Employees",
      icon: <EmployeesIcon />,
      submenu: ["Staff", "Staff Profile", "Attendace Staff"],
    },
  ];

  const navigate = useNavigate();
  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#1e293b",
            color: "white",
          },
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 2,
            paddingTop: "10px",
          }}
        >
          <Box
            sx={{
              aligItems: "center",
              backgroundColor: "white",
              display: "flex",
              height: "60px",
              justifyContent: "center",
              lineHeight: "60px",
              width: "60px",
              borderRadius: "50%",
              margin: "inherit",
            }}
          >
            <TaskIcon />
          </Box>

          <Typography variant="h6" noWrap>
            My-Task
          </Typography>
        </Toolbar>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />
        <List>
          {menuItems.map((item, index) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                selected={activeTab === index}
                onClick={() => setActiveTab(index)}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "#3b82f6",
                    "&:hover": {
                      backgroundColor: "#2563eb",
                    },
                  },
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.08)",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "inherit" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate("/")}>
              <ListItemIcon sx={{ color: "inherit" }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Back to Home" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </Box>
  );
}

export default Dashboard;
