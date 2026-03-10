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
  useColorScheme,
} from '@mui/material';
import TaskIcon from './icons/TaskIcon';
import { ArrowBack, ArrowForward, ExpandLess, ExpandMore } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { menuItems } from '../constants/constants';
import { useState } from 'react';

const routeMapping: Record<string, string> = {
  Dashboard: '/',
  'Project Dashboard': '/',
  Board: '/board',
  Members: '/member',
  'Members Profile': '/member-profile',
  Supports: '/supports',
  Attachments: '/attachments',
};

function Sidebar({ openMenus }: any) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { mode, setMode } = useColorScheme();
  if (!mode) {
    return null;
  }

  const handleModeToggle = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

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
    <>
      <Box
        sx={{
          width: isCollapsed ? 100 : 260,
          backgroundColor: '#484c7f',
          color: 'white',
          overflowY: 'auto',
          p: 3,
          borderRadius: '1.1rem',
          height: 'calc(100vh - 50px)',
          margin: '25px',
          order: 1,
          zIndex: 1,
          transition: 'width 0.3s ease',
        }}
      >
        <Box
          sx={{
            pt: isCollapsed ? 0 : 2,
            pb: 2,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              pb: 5,
            }}
          >
            <Box
              sx={{
                aligItems: 'center',
                backgroundColor: 'white',
                display: 'flex',
                height: '60px',
                justifyContent: 'center',
                lineHeight: '60px',
                minWidth: '60px',
                borderRadius: '50%',
                margin: 'inherit',
                alignItems: 'center',
              }}
            >
              <TaskIcon />
            </Box>
            {!isCollapsed && (
              <Box
                sx={{
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                <Typography variant="h5" fontWeight="bold">
                  My-Task
                </Typography>
                <Typography fontSize="0.8rem">Project Management</Typography>
              </Box>
            )}
          </Box>

          {/* Menu Items */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <List sx={{ py: 2, flexGrow: 1 }}>
              {menuItems.map((item: any) => {
                const isActive = isMenuActive(item);

                return (
                  <Box key={item.id}>
                    <ListItem disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => {handleMenuClick(item?.text)}}
                        sx={{
                          borderRadius: 1,
                          fontSize: '20px',
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            color: isActive ? '#FFA726' : 'white',
                            minWidth: 40,
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <span>{isCollapsed ? '' : item.text}</span>
                            </Box>
                          }
                          slotProps={{
                            primary: {
                              color: isActive ? '#FFA726' : 'white',
                              fontSize: '18px',
                              fontWeight: 400,
                            },
                          }}
                        />
                        {item.submenu &&
                          (openMenus[item.id] ? (
                            <ExpandLess />
                          ) : isCollapsed ? null : (
                            <ExpandMore />
                          ))}
                      </ListItemButton>
                    </ListItem>
                    {item.submenu && !isCollapsed && (
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
                                    color: isSubActive ? '#FFA726' : 'rgba(255,255,255,0.7)',
                                  }}
                                >
                                  <ListItemText
                                    primary={
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 1,
                                        }}
                                      >
                                        <span>{subitem}</span>
                                      </Box>
                                    }
                                    slotProps={{
                                      primary: {
                                        textAlign: 'left',
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
                  </Box>
                );
              })}
            </List>
          </Box>

          {/* Bottom Section - Dark Mode và RTL */}
          <Box
            sx={{
              py: 2.5,
              borderTop: '1px solid rgba(255,255,255,0.1)',
              flexShrink: 0,
              mt: 'auto',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Switch
                checked={mode === 'dark'}
                onChange={handleModeToggle}
                size="small"
                sx={{ mr: 1 }}
              />
              {!isCollapsed && (
                <Typography variant="body2">
                  {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              {!isCollapsed ? (
                <ArrowBack
                  sx={{ color: 'white', opacity: 0.7, cursor: 'pointer' }}
                  onClick={() => setIsCollapsed(!isCollapsed)}
                />
              ) : (
                <ArrowForward
                  sx={{ color: 'white', opacity: 0.7, cursor: 'pointer' }}
                  onClick={() => setIsCollapsed(!isCollapsed)}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default Sidebar;
