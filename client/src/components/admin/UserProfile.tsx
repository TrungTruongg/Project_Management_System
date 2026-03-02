import {
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import {
  ArrowBack,
  CheckCircleOutline,
  LocationCityOutlined,
  MailOutline,
  MoreHoriz,
  PhoneOutlined,
} from '@mui/icons-material';

function UserProfile() {
  const [profileUser, setProfileUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;

  useEffect(() => {
    if (userId) {
      fetchAllData();
    }
  }, [userId]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [usersRes, projectsRes] = await Promise.all([api.get('/users'), api.get('/projects')]);

      const usersList = usersRes.data;
      const foundUser = usersList.find((u: any) => u._id === userId);

      setProfileUser(foundUser);

      // Lọc các project mà user này là member
      const allProjects = projectsRes.data;
      const filteredProjects = allProjects.filter(
        (project: any) => project.members.includes(userId) || project.leaderId === userId
      );

      setProjects(filteredProjects);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProject = (project: any) => {
    navigate('/admin/project', { state: { projectId: project._id } });
  };

  const handleOpenAction = (event: React.MouseEvent<HTMLElement>) => {
    setActionAnchorEl(event.currentTarget);
  };

  const calculateLastActiveDays = (lastActive: string) => {
    const diffTime = new Date().getTime() - new Date(lastActive).getTime();
    const diffDays = Math.ceil(Math.abs(diffTime) / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  return (
    <Box sx={{ p: 2 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : !profileUser ? (
        <Typography>User not found</Typography>
      ) : (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <IconButton onClick={() => navigate(-1)}>
              <ArrowBack />
            </IconButton>
            <Typography
              variant="h4"
              sx={{ fontWeight: 600, color: '#172B4D', textTransform: 'capitalize' }}
            >
              {profileUser?.firstName} {profileUser?.lastName}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  mb: 2,
                  border: '1px solid',
                  borderRadius: 2,
                  borderColor: '#0B120E24',
                }}
              >
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
                >
                  <Avatar
                    src={profileUser?.avatar}
                    sx={{
                      width: 96,
                      height: 96,
                      fontSize: 16,
                      color: 'white',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    {profileUser?.firstName?.[0]}
                    {profileUser?.lastName?.[0]}
                  </Avatar>

                  <Box
                    sx={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        flexWrap: 'wrap',
                      }}
                    >
                      <MailOutline sx={{ width: 20, height: 20, color: 'text.secondary' }} />
                      {profileUser?.email ? (
                        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                          {profileUser?.email}
                        </Typography>
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            fontStyle: 'italic',
                          }}
                        >
                          No email
                        </Typography>
                      )}
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        justifyContent: 'flex-start',
                      }}
                    >
                      <PhoneOutlined sx={{ width: 20, height: 20, color: 'text.secondary' }} />
                      {profileUser?.phone ? (
                        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                          +84 {profileUser?.phone}
                        </Typography>
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            fontStyle: 'italic',
                          }}
                        >
                          No phone number
                        </Typography>
                      )}
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        justifyContent: 'flex-start',
                      }}
                    >
                      <LocationCityOutlined
                        sx={{ width: 20, height: 20, color: 'text.secondary' }}
                      />
                      {profileUser?.location ? (
                        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                          +84 {profileUser?.location}
                        </Typography>
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            fontStyle: 'italic',
                          }}
                        >
                          No location
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 9 }}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  width: '100%',
                  border: '1px solid',
                  borderRadius: 2,
                  borderColor: '#0B120E24',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: '#EFFFD6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircleOutline sx={{ width: 16, height: 16, color: '#6A9A23' }} />
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#000' }}>
                      Activity
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                      Lastest active is 3 days ago
                    </Typography>
                  </Box>
                </Box>
              </Card>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                          color: 'text.secondary',
                          textTransform: 'uppercase',
                          borderBottom: '2px solid #f0f0f0',
                        }}
                      >
                        Project
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                          color: 'text.secondary',
                          textTransform: 'uppercase',
                          borderBottom: '2px solid #f0f0f0',
                        }}
                      >
                        Last active
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                          color: 'text.secondary',
                          textTransform: 'uppercase',
                          borderBottom: '2px solid #f0f0f0',
                        }}
                      >
                        Role
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                          color: 'text.secondary',
                          textTransform: 'uppercase',
                          borderBottom: '2px solid #f0f0f0',
                        }}
                      >
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                        <CircularProgress />
                      </TableCell>
                    ) : projects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography fontStyle="italic" color="text.secondary">
                            No projects available!
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      projects.map((project: any) => {
                        return (
                          <TableRow
                            key={project._id}
                            onClick={() => handleViewProject(project)}
                            sx={{
                              '&:hover': { bgcolor: 'action.hover' },
                              '& td': {
                                borderBottom: (theme) =>
                                  `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`,
                              },
                              transition: 'all 0.2s',
                              cursor: 'pointer',
                            }}
                          >
                            <TableCell>
                              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                                {project.name}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography sx={{ fontSize: 14 }}>
                                {calculateLastActiveDays(profileUser.lastLogin)} days ago
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography sx={{ fontSize: 14 }}>
                                {project.leaderId === userId ? 'Leader' : 'Member'}
                              </Typography>
                            </TableCell>

                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <IconButton onClick={handleOpenAction}>
                                <MoreHoriz />
                              </IconButton>

                              <Menu
                                elevation={0}
                                open={Boolean(actionAnchorEl)}
                                onClose={() => setActionAnchorEl(null)}
                                anchorEl={actionAnchorEl}
                              >
                                <MenuItem>
                                  <Typography fontSize="14px">View project detail</Typography>
                                </MenuItem>                               

                                <MenuItem>
                                  <Typography fontSize="14px" color="warning">
                                    Delete Access
                                  </Typography>
                                </MenuItem>
                              </Menu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}

export default UserProfile;
