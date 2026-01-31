import React from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  InputBase,
  Avatar,
  Divider,
  Collapse,
} from '@mui/material';
import {
  HelpOutline,
  Search,
  Notifications,
  ExpandLess,
  ExpandMore,
  Home,
} from '@mui/icons-material';
import { menuSections } from './constant/constants';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';

const DRAWER_WIDTH = 240;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSections, setOpenSections] = React.useState({
    users: false,
  });

  const handleToggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }));
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f5f7' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          ml: `${DRAWER_WIDTH}px`,
          bgcolor: 'white',
          borderBottom: '1px solid #e0e0e0',
          color: '#172B4D',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Left side - Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton>
              <Home />
            </IconButton>
            <Typography variant="body2" sx={{ fontWeight: 600, ml: 1 }}>
              ⚙️ Administration
            </Typography>
          </Box>

          {/* Center - Search bar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#f4f5f7',
              borderRadius: 1,
              px: 2,
              py: 0.5,
              width: '40%',
            }}
          >
            <Search sx={{ color: '#5e6c84', mr: 1 }} />
            <InputBase
              placeholder="Tìm kiếm"
              fullWidth
              sx={{ fontSize: 14 }}
            />
          </Box>

          {/* Right side - Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton>
              <Notifications />
            </IconButton>
            <IconButton>
              <HelpOutline />
            </IconButton>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: '#6554c0',
                fontSize: 14,
              }}
            >
              T
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer - Giống Jira */}
      <Drawer
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#ffffff',
            borderRight: '1px solid #e0e0e0',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        {/* Organization Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              bgcolor: '#DFE1E6',
              borderRadius: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            🏢
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            my-task
          </Typography>
        </Box>

        {/* Menu Items */}
        <List sx={{ pt: 2, px: 1 }}>
          {menuSections.map((section, sectionIndex) => (
            <React.Fragment key={section.title}>
              {section.items.map((item: any) => (
                <React.Fragment key={item.id}>
                  <ListItemButton
                    onClick={() => {
                      if (item.subItems) {
                        handleToggleSection(item.id);
                      } else {
                        navigate(item.path);
                      }
                    }}
                    selected={isActive(item.path)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&.Mui-selected': {
                        bgcolor: '#E9F2FF',
                        color: '#0052CC',
                        '& .MuiListItemIcon-root': {
                          color: '#0052CC',
                        },
                      },
                      '&:hover': {
                        bgcolor: '#f4f5f7',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: '#5e6c84',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: 14,
                        fontWeight: isActive(item.path) ? 600 : 400,
                      }}
                    />
                    {item.badge && (
                      <Box
                        sx={{
                          px: 1,
                          py: 0.25,
                          bgcolor: '#DFE1E6',
                          borderRadius: 0.5,
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {item.badge}
                      </Box>
                    )}
                    {item.subItems &&
                      (openSections[item.id as keyof typeof openSections] ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      ))}
                  </ListItemButton>

                  {/* Sub-items */}
                  {item.subItems && (
                    <Collapse
                      in={openSections[item.id as keyof typeof openSections]}
                      timeout="auto"
                      unmountOnExit
                    >
                      <List component="div" disablePadding>
                        {item.subItems.map((subItem: any) => (
                          <ListItemButton
                            key={subItem.path}
                            onClick={() => navigate(subItem.path)}
                            selected={isActive(subItem.path)}
                            sx={{
                              pl: 7,
                              borderRadius: 1,
                              mb: 0.5,
                              '&.Mui-selected': {
                                bgcolor: '#E9F2FF',
                                color: '#0052CC',
                              },
                            }}
                          >
                            <ListItemText
                              primary={subItem.text}
                              primaryTypographyProps={{
                                fontSize: 14,
                              }}
                            />
                            {subItem.badge && (
                              <Box
                                sx={{
                                  px: 1,
                                  py: 0.25,
                                  bgcolor: '#DFE1E6',
                                  borderRadius: 0.5,
                                  fontSize: 10,
                                  fontWeight: 700,
                                }}
                              >
                                {subItem.badge}
                              </Box>
                            )}
                          </ListItemButton>
                        ))}
                      </List>
                    </Collapse>
                  )}
                </React.Fragment>
              ))}

              {/* {sectionIndex < menuSections.length - 1 && (
                <Divider sx={{ my: 2 }} />
              )} */}
            </React.Fragment>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#f4f5f7',
          p: 3,
          mt: 8,
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;