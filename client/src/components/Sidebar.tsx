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
          width: {
            xs: isCollapsed ? 70 : 100,
            sm: isCollapsed ? 80 : 120,
            md: isCollapsed ? 100 : 260,
            lg: isCollapsed ? 100 : 260,
          },
          backgroundColor: '#484c7f',
          color: 'white',
          overflowY: 'auto',
          p: {
            xs: 1.5,
            sm: 2,
            md: 3,
          },
          borderRadius: {
            xs: '0.7rem',
            md: '1.1rem',
          },
          height: 'calc(100vh - 50px)',
          margin: {
            xs: '12px',
            sm: '15px',
            md: '25px',
          },
          order: 1,
          zIndex: 1,
          transition: 'width 0.3s ease',
          mr: {
            xs: '8px',
            sm: '12px',
            md: 0,
          },
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
              gap: {
                xs: 0.5,
                md: 2,
              },
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              pb: {
                xs: 2,
                md: 5,
              },
            }}
          >
            <Box
              sx={{
                aligItems: 'center',
                backgroundColor: 'white',
                display: 'flex',
                height: {
                  xs: '45px',
                  sm: '50px',
                  md: '60px',
                },
                justifyContent: 'center',
                lineHeight: {
                  xs: '45px',
                  sm: '50px',
                  md: '60px',
                },
                minWidth: {
                  xs: '45px',
                  sm: '50px',
                  md: '60px',
                },
                borderRadius: '50%',
                margin: 'inherit',
                alignItems: 'center',
                fontSize: {
                  xs: '1rem',
                  md: '1.2rem',
                },
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
                <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: '0.9rem', md: '1.25rem' } }}>
                  My-Task
                </Typography>
                <Typography fontSize={{ xs: '0.65rem', md: '0.8rem' }}>
                  Project Management
                </Typography>
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
            <List sx={{ py: { xs: 1, md: 2 }, flexGrow: 1 }}>
              {menuItems.map((item: any) => {
                const isActive = isMenuActive(item);

                return (
                  <Box key={item.id}>
                    <ListItem disablePadding sx={{ mb: { xs: 0.3, md: 0.5 } }}>
                      <ListItemButton
                        onClick={() => {handleMenuClick(item?.text)}}
                        sx={{
                          borderRadius: 1,
                          fontSize: {
                            xs: '14px',
                            md: '20px',
                          },
                          py: {
                            xs: 1,
                            md: 1.5,
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            color: isActive ? '#FFA726' : 'white',
                            minWidth: {
                              xs: 28,
                              md: 40,
                            },
                            fontSize: {
                              xs: '1.2rem',
                              md: '1.5rem',
                            },
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
                              <span>
                                {isCollapsed ? '' : item.text}
                              </span>
                            </Box>
                          }
                          slotProps={{
                            primary: {
                              color: isActive ? '#FFA726' : 'white',
                              fontSize: {
                                xs: '12px',
                                md: '18px',
                              },
                              fontWeight: 400,
                            },
                          }}
                        />
                        {item.submenu &&
                          (openMenus[item.id] ? (
                            <ExpandLess sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                          ) : isCollapsed ? null : (
                            <ExpandMore sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
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
                                    pl: {
                                      xs: 4,
                                      md: 6,
                                    },
                                    borderRadius: 1,
                                    color: isSubActive ? '#FFA726' : 'rgba(255,255,255,0.7)',
                                    py: {
                                      xs: 0.8,
                                      md: 1,
                                    },
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
                                        fontSize: {
                                          xs: '11px',
                                          md: '0.9rem',
                                        },
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
              py: {
                xs: 1.5,
                md: 2.5,
              },
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
                mb: {
                  xs: 1,
                  md: 2,
                },
                gap: 0.5,
              }}
            >
              <Switch
                checked={mode === 'dark'}
                onChange={handleModeToggle}
                size="small"
                sx={{ mr: { xs: 0, md: 1 } }}
              />
              {!isCollapsed && (
                <Typography
                  variant="body2"
                  sx={{
                    display: {
                      xs: 'none',
                      md: 'block',
                    },
                    fontSize: {
                      xs: '0.7rem',
                      md: '0.875rem',
                    },
                  }}
                >
                  {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 1, md: 2 } }}>
              {!isCollapsed ? (
                <ArrowBack
                  sx={{
                    color: 'white',
                    opacity: 0.7,
                    cursor: 'pointer',
                    fontSize: {
                      xs: '1.2rem',
                      md: '1.5rem',
                    },
                  }}
                  onClick={() => setIsCollapsed(!isCollapsed)}
                />
              ) : (
                <ArrowForward
                  sx={{
                    color: 'white',
                    opacity: 0.7,
                    cursor: 'pointer',
                    fontSize: {
                      xs: '1.2rem',
                      md: '1.5rem',
                    },
                  }}
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
