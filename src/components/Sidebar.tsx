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
import { menuItems } from "../constants/constants";
import { Fragment } from "react";
import { ArrowBack, ExpandLess, ExpandMore } from "@mui/icons-material";

function Sidebar({ openMenus, toggleMenu, activePage, onMenuClick }: any) {
  const isMenuActive = (item: any) => {
    if (!item.submenu) {
      return activePage === item.text;
    }
    return item.submenu.includes(activePage);
  };
  return (
    <Box
      sx={{
        width: 260,
        bgcolor: "#484c7f",
        color: "white",
        overflowY: "auto",
        p: 3,
        borderRadius: "1.1rem",
        height: "calc(100vh - 50px)",
        margin: "25px",
        order: 1,
        zIndex: 99999,
        overflow: "hidden",
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
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <List sx={{ py: 5, flexGrow: 1 }}>
            {menuItems.map((item, index) => {
              const isActive = isMenuActive(item);

              return (
                <Fragment key={index}>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => {
                        if (item.submenu) {
                          toggleMenu(item.id);
                        } else {
                          onMenuClick(item.text);
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
                        {item.icon}
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
                        {item.submenu.map((subitem, subindex) => (
                          <ListItem disablePadding key={subindex}>
                            <ListItemButton
                              onClick={() => onMenuClick(subitem)}
                              sx={{
                                pl: 6,
                                borderRadius: 1,

                                color:
                                  activePage === subitem
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
                        ))}
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
