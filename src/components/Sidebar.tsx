import {
  Box,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Switch,
  Typography,
} from "@mui/material";
import TaskIcon from "./icons/TaskIcon";
import { FaBriefcase as ProjectIcon } from "react-icons/fa";
import { FaHome as DashboardIcon } from "react-icons/fa";
import { FaUsers as EmployeesIcon } from "react-icons/fa";
import { Fragment, useEffect, useState } from "react";
import { ArrowBack, ExpandLess, ExpandMore } from "@mui/icons-material";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const iconMapping: any = {
  DashboardIcon: DashboardIcon,
  ProjectIcon: ProjectIcon,
  EmployeesIcon: EmployeesIcon,
};

const routeMapping: Record<string, string> = {
  Dashboard: "/",
  "Project Dashboard": "/",
  Projects: "/project",
  "Create Project": "/project",
  Tasks: "/task",
  Members: "/member",
  "Members Profile": "/member-profile",
};

function Sidebar({ openMenus, toggleMenu }: any) {
  const [menuItems, setMenuItems] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchSidebar = async () => {
    try {
      const response = await axios.get(
        "https://mindx-mockup-server.vercel.app/api/resources/menuItems?apiKey=69205e8dbf3939eacf2e89f2"
      );
      setMenuItems(response.data.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSidebar();
  }, []);

  const isMenuActive = (item: any) => {
    if (!item.submenu) {
      const route = routeMapping[item.text];
      return location.pathname === route;
    }

    return item.submenu.some((subitem: string) => {
      const route = routeMapping[subitem];
      return location.pathname === route;
    });
  };

  const handleMenuClick = (menuText: string) => {
    const route = routeMapping[menuText];
    if (route) {
      navigate(route);
    }
  };
  return (
    <Box
      sx={{
        width: 260,
        backgroundColor: "#484c7f",
        color: "white",
        overflowY: "auto",
        p: 3,
        borderRadius: "1.1rem",
        height: "calc(100vh - 50px)",
        margin: "25px",
        order: 1,
        zIndex: 99999,
      }}
    >
      <Box
        sx={{
          pt: 3,
          pb: 2,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
              alignItems: "center",
            }}
          >
            <TaskIcon />
          </Box>
          <Typography variant="h5" fontWeight="bold">
            My-Task
          </Typography>
        </Box>

        {/* Menu Items */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              display: "none",
            },
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <List sx={{ py: 5, flexGrow: 1 }}>
            {menuItems?.map((item: any, index) => {
              const isActive = isMenuActive(item);
              const IconComponent = iconMapping[item.icon];

              return (
                <Fragment key={index}>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => {
                        if (item?.submenu) {
                          toggleMenu(item?.id);
                        } else {
                          handleMenuClick(item?.text);
                        }
                      }}
                      sx={{
                        borderRadius: 1,
                        fontSize: "20px",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: isActive ? "#FFA726" : "white",
                          minWidth: 40,
                        }}
                      >
                        {IconComponent && <IconComponent />}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        slotProps={{
                          primary: {
                            color: isActive ? "#FFA726" : "white",
                            fontSize: "18px",
                            fontWeight: 400,
                          },
                        }}
                      />
                      {item.submenu &&
                        (openMenus[item.id] ? <ExpandLess /> : <ExpandMore />)}
                    </ListItemButton>
                  </ListItem>
                  {item.submenu && (
                    <Collapse in={openMenus[item.id]} timeout={0} unmountOnExit>
                      <List component="div" disablePadding>
                        {item.submenu.map((subitem: any, subindex: any) => {
                          const subRoute = routeMapping[subitem];
                          const isSubActive = location.pathname === subRoute;

                          return (
                            <ListItem disablePadding key={subindex}>
                              <ListItemButton
                                onClick={() => handleMenuClick(subitem)}
                                sx={{
                                  pl: 6,
                                  borderRadius: 1,
                                  color: isSubActive
                                    ? "#FFA726"
                                    : "rgba(255,255,255,0.7)",
                                }}
                              >
                                <ListItemText
                                  primary={subitem}
                                  slotProps={{
                                    primary: {
                                      textAlign: "left",
                                      fontWeight: 400,
                                    },
                                  }}
                                />
                              </ListItemButton>
                            </ListItem>
                          );
                        })}
                      </List>
                    </Collapse>
                  )}
                </Fragment>
              );
            })}
          </List>
        </Box>

        {/* Bottom Section - Dark Mode và RTL */}
        <Box
          sx={{
            py: 2.5,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            flexShrink: 0,
            mt: "auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Switch size="small" sx={{ mr: 1 }} />
            <Typography variant="body2">Enable Dark Mode!</Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Switch size="small" sx={{ mr: 1 }} />
            <Typography variant="body2">Enable RTL Mode!</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <ArrowBack sx={{ color: "white", opacity: 0.7 }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Sidebar;
