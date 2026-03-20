import React, { useState } from 'react';
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
  Avatar,
  Collapse,
  Tooltip,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import { ExpandLess, ExpandMore, Home } from '@mui/icons-material';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { menuSections } from './constant/constants';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import TaskIcon from '../icons/TaskIcon';
import { useUser } from '../context/UserContext';
import SearchInput from '../SearchInput';

const DRAWER_WIDTH = 240;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const { user, setUser } = useUser();
  const [openSections, setOpenSections] = React.useState({
    users: false,
  });

  const handleLogout = () => {
      localStorage.removeItem('auth');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setUser(null);
      navigate('/login'); 
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleToggleSection = (section: string) => {
    setOpenSections((prev) => ({
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
            <IconButton onClick={() => navigate('/')}>
              <Home />
            </IconButton>
            <Typography variant="body2" sx={{ fontWeight: 600, ml: 1 }}>
              ⚙️ Administration
            </Typography>
          </Box>

          {/* Search bar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              borderRadius: 1,
              px: 2,
              py: 0.5,
              width: '40%',
            }}
          >
            <SearchInput />
          </Box>

          {/* Right side - Icons */}
          <Box sx={{ display: "flex", alignItem: "center", gap: 2 }}>
            <Box sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="body2" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
              {`${user?.firstName} ${user?.lastName}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <Box sx={{ flexShrink: 0 }}>
            {user ? (
              <Tooltip
                title={`${user.firstName} ${user.lastName}`}
                sx={{ textTransform: 'capitalize' }}
              >
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0.5 }}>
                  <Avatar
                    src={user?.avatar || '/images/user_avatar.jpg'}
                    sx={{
                      width: { xs: 10, sm: 36, md: 40 },
                      height: { xs: 10, sm: 36, md: 40 },
                      fontSize: '15px',
                      textTransform: 'uppercase',
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
                  fontSize: { xs: '0.75rem', sm: '0.85rem' },
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: 0.6, sm: 0.8 },
                  backgroundColor: '#00ed64',
                  color: '#001e2b',
                  fontWeight: 700,
                  textTransform: 'none',
                  border: '1px solid #001e2b',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    backgroundColor: '#00d957',
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
                  '& .MuiList-root': {
                    pb: 0,
                  },
                }}
                disableScrollLock={true}
              >
                <MenuItem key="profile" sx={{ display: 'block', gap: 2 }} divider>
                  <Typography
                    sx={{
                      fontWeight: 'bold',
                      alignItems: 'center',
                      textTransform: 'none',
                      color: '#001e2b',
                    }}
                  >
                    Signed in as:
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <PersonIcon sx={{ mr: '8px' }} />
                    <Typography sx={{ textTransform: 'capitalize' }}>
                      {user?.firstName} {user?.lastName}
                    </Typography>
                  </Box>
                </MenuItem>

                <MenuItem
                  key="logout"
                  sx={{ gap: 2, alignItems: 'center', color: '#d32f2f' }}
                  onClick={handleLogout}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LogoutIcon sx={{ mr: '8px' }} />
                    <Typography>Logout</Typography>
                  </Box>
                </MenuItem>
              </Menu>
            )}
          </Box>
          </Box>
          
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
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
        {/* Header */}
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
              width: 23,
              height: 23,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TaskIcon />
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            My-task
          </Typography>
        </Box>

        {/* Menu Items */}
        <List sx={{ pt: 2, px: 1 }}>
          {menuSections.map((section) => (
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
                      slotProps={{
                        primary: {
                          fontSize: 14,
                          fontWeight: isActive(item.path) ? 600 : 400,
                        },
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
                              slotProps={{
                                primary: {
                                  fontSize: 14,
                                },
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
