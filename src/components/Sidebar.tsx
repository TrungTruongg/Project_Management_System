import { Box, Collapse, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material"
import TaskIcon from "./icons/TaskIcon"
import { menuItems } from "../constants/constants"
import { Fragment } from "react";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

function Sidebar({openMenus, toggleMenu}: any) {
  return (
    <Box
        sx={{
          width: 280,
          bgcolor: "#484c7f",
          color: "white",
          p: 3,
          overflowY: "auto",
          borderRadius: "1.1rem",
          margin: "25px"
        }}
      >
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
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
              alignItems: "center"
            }}
          >
            <TaskIcon />
          </Box>
          <Typography variant="h5" fontWeight="bold">
            My-Task
          </Typography>
        </Box>

        {/* Menu Items */}
        <List>
          {menuItems.map((item, index) => (
            <Fragment key={index}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => item.submenu && toggleMenu(item.id)}
                  sx={{
                    borderRadius: 1,
                    bgcolor:
                      item.id === "dashboard" && openMenus[item.id]
                        ? "rgba(255,255,255,0.1)"
                        : "transparent",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: item.id === "dashboard" ? "#FFA726" : "white",
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    slotProps={{
                      primary: {
                        color: item.id === "dashboard" ? "#FFA726" : "white",
                      },
                    }}
                  />
                  {item.submenu &&
                    (openMenus[item.id] ? <ExpandLess /> : <ExpandMore />)}
                </ListItemButton>
              </ListItem>
              {item.submenu && (
                <Collapse in={openMenus[item.id]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.submenu.map((subitem, subindex) => (
                      <ListItem disablePadding key={subindex}>
                        <ListItemButton
                          sx={{
                            pl: 6,
                            borderRadius: 1,
                            color:
                              subitem === "Project Dashboard"
                                ? "#FFA726"
                                : "rgba(255,255,255,0.7)",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                          }}
                        >
                          <ListItemText primary={subitem} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </Fragment>
          ))}
        </List>
      </Box>
  )
}

export default Sidebar
