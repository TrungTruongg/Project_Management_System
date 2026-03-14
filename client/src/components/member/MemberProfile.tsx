import {
  CalendarToday,
  Phone,
  Email,
  LocationOn,
  ArrowBack,
  Refresh as RefreshIcon,
  MoreHoriz,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Fade,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import UpdateMemberProfileModal from './UpdateMemberProfileModal';
import DeleteConfirmDialog from '../DeleteConfirmDialog';
import { useSearch } from '../context/SearchContext';
import api from '../api/axiosConfig';
import { formatDate } from '../helper/helper';
import { useUser } from '../context/UserContext';

function MemberProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const memberId = location.state?.memberId;

  const [profileUser, setProfileUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuOpenMemberId, setMenuOpenMemberId] = useState<string | null>(null);
  const { searchTerm } = useSearch();
  const { user } = useUser();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (memberId) {
      fetchAllData();
    }
  }, [memberId]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [usersRes, tasksRes] = await Promise.all([api.get('/users'), api.get('/tasks')]);

      // Process users
      const usersList = usersRes.data;
      const foundUser = usersList.find((u: any) => u._id === memberId);
      setProfileUser(foundUser);

      // user tasks - include tasks where user is leader OR assigned
      const userTasks = tasksRes.data.filter((task: any) => {
        const isLeader = task.leaderId === memberId;
        const isAssigned = Array.isArray(task.assignedTo)
          ? task?.assignedTo.includes(memberId)
          : task?.assignedTo === memberId;
        return isLeader || isAssigned;
      });

      setTasks(userTasks);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter((task: any) => {
    if (!searchTerm.trim()) return true;

    return (
      task.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const calculateDeadline = (dateStart: string, dateEnd: string) => {
    const startDate = new Date(dateStart);
    const endDate = new Date(dateEnd);

    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(Math.abs(diffTime) / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const getPriorityChip = (priority: 'high' | 'medium' | 'low') => {
    const config = {
      high: { label: 'HIGH PRIORITY', bgcolor: '#FFEBEE', color: '#C62828' },
      medium: { label: 'MEDIUM PRIORITY', bgcolor: '#FFF9C4', color: '#F57F17' },
      low: { label: 'LOW PRIORITY', bgcolor: '#C8E6C9', color: '#388E3C' },
    };
    return config[priority] || config.medium;
  };

  const handleUpdateUser = (updatedUser: any) => {
    setProfileUser(updatedUser);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEditMemberProfile = () => {
    setOpen(true);
  };

  const handleOpenRemoveFromTaskDialog = () => {
    setDeleteDialogOpen(true);
    setMenuOpenMemberId(null);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleOpenMenu = (memberId: string) => {
    setMenuOpenMemberId(memberId);
  };
  const handleCloseMenu = () => {
    setMenuOpenMemberId(null);
  };

  // Check if current user is a task leader
  const isCurrentUserTaskLeader = tasks.some((task: any) => task.leaderId === user?._id);

  // Check if profile user is a member (assignedTo) of tasks where current user is leader
  const isProfileUserTaskMember = tasks.some((task: any) => {
    const isCurrentUserLeader = task.leaderId === user?._id;
    const isProfileUserAssigned = Array.isArray(task.assignedTo)
      ? task.assignedTo.includes(memberId)
      : task.assignedTo === memberId;
    return isCurrentUserLeader && isProfileUserAssigned;
  });

  const handleRemoveFromTask = async () => {
    setLoading(true);
    try {
      // Remove profile user from all tasks where current user is leader
      for (const task of tasks) {
        const isCurrentUserLeader = task.leaderId === user?._id;
        const isProfileUserAssigned = Array.isArray(task.assignedTo)
          ? task.assignedTo.includes(memberId)
          : task.assignedTo === memberId;

        if (isCurrentUserLeader && isProfileUserAssigned) {
          const updatedMembers = Array.isArray(task.assignedTo)
            ? task.assignedTo.filter((id: string) => id !== memberId)
            : [];

          await api.put(`/tasks/update/${task._id}`, {
            name: task.name,
            description: task.description,
            startDate: task.startDate,
            endDate: task.endDate,
            priority: task.priority,
            leaderId: task.leaderId,
            status: task.status,
            assignedTo: updatedMembers,
          });
        }
      }

      handleCloseDeleteDialog();
      await fetchAllData();
    } catch (error) {
      console.error('Error removing member from tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!profileUser && !loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h5">Member not found</Typography>
        <Button onClick={() => navigate('/member')} sx={{ mt: 2 }}>
          Back to Members
        </Button>
      </Box>
    );
  }

  const handleViewTask = (taskId: any) => {
    navigate(`/task-detail?id=${taskId}`);
  };

  return (
    <>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={() => navigate('/member')}>
          <ArrowBack />
        </IconButton>
        <Typography fontSize="1.5rem" fontWeight="700">
          Member Profile
        </Typography>
        <IconButton
          onClick={fetchAllData}
          disabled={loading}
          sx={{ color: 'text.secondary' }}
          title="Refresh resources"
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid sx={{ xs: 12, width: '100%' }}>
            {/* Profile Card */}
            <Card
              sx={{
                mb: 3,
                border: (theme) =>
                  `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`,
                borderRadius: 2,
                transition: 'all 0.3s',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', gap: 4 }}>
                  <Avatar
                    src={profileUser?.avatar}
                    sx={{
                      width: 120,
                      height: 120,
                      fontSize: '48px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {profileUser?.firstName?.[0]}
                    {profileUser?.lastName?.[0]}
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        sx={{ textTransform: 'capitalize' }}
                        gutterBottom
                      >
                        {profileUser?.firstName} {profileUser?.lastName}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1 }} onClick={(e) => e.stopPropagation()}>
                        <IconButton
                          id={`fade-button-${memberId}`}
                          aria-controls={
                            menuOpenMemberId === memberId ? `fade-menu-${memberId}` : undefined
                          }
                          aria-haspopup="true"
                          aria-expanded={menuOpenMemberId === memberId ? 'true' : undefined}
                          onClick={() => handleOpenMenu(memberId)}
                        >
                          <MoreHoriz fontSize="small" />
                        </IconButton>
                        <Menu
                          id={`fade-menu-${memberId}`}
                          slotProps={{
                            list: {
                              'aria-labelledby': `fade-button-${memberId}`,
                            },
                          }}
                          slots={{ transition: Fade }}
                          anchorEl={
                            menuOpenMemberId === memberId
                              ? document.getElementById(`fade-button-${memberId}`)
                              : null
                          }
                          open={menuOpenMemberId === memberId}
                          onClose={handleCloseMenu}
                        >
                          {isCurrentUserTaskLeader && (
                            <MenuItem onClick={handleEditMemberProfile}>
                              <Typography>Edit</Typography>
                            </MenuItem>
                          )}

                          {isCurrentUserTaskLeader && isProfileUserTaskMember && (
                            <MenuItem onClick={handleOpenRemoveFromTaskDialog}>
                              <Typography color="error">Remove from task</Typography>
                            </MenuItem>
                          )}

                          {!isCurrentUserTaskLeader && (
                            <MenuItem disabled>
                              <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                No permission
                              </Typography>
                            </MenuItem>
                          )}
                        </Menu>
                      </Box>
                    </Box>

                    <Chip
                      label={profileUser?.role || 'Member'}
                      size="small"
                      sx={{ bgcolor: '#E1BEE7', color: '#6A1B9A', mb: 2 }}
                    />

                    <Grid container spacing={2} sx={{ mt: 4 }}>
                      <Grid size={{ xs: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Phone sx={{ fontSize: 18, color: 'text.secondary' }} />
                          {profileUser?.phone ? (
                            <Typography variant="body2">+84 {profileUser?.phone}</Typography>
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
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Email sx={{ fontSize: 18, color: 'text.secondary' }} />
                          {profileUser?.email ? (
                            <Typography variant="body2">{profileUser?.email}</Typography>
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'text.secondary',
                                fontStyle: 'italic',
                              }}
                            >
                              No Email Address
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday sx={{ fontSize: 18, color: 'text.secondary' }} />
                          {profileUser?.joinDate ? (
                            <Typography variant="body2">
                              {new Date(profileUser.joinDate).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                              })}
                            </Typography>
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'text.secondary',
                                fontStyle: 'italic',
                              }}
                            >
                              No Joined Date
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                          {profileUser?.location ? (
                            <Typography variant="body2">{profileUser?.location}</Typography>
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'text.secondary',
                                fontStyle: 'italic',
                              }}
                            >
                              No Location
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Tasks  */}
            <Grid container spacing={3}>
              {/* Tasks */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Current Tasks
                </Typography>

                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => {
                    const priorityConfig = getPriorityChip(task.priority);
                    const calculateTaskDays = calculateDeadline(task.startDate, task.endDate);

                    return (
                      <Card
                        key={task._id}
                        sx={{
                          mb: 2,
                          cursor: 'pointer',
                          boxShadow: 1,
                          borderRadius: 2,
                          border: (theme) =>
                            `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`,
                          width: '100%',
                        }}
                        onClick={() => handleViewTask(task._id)}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              mb: 2,
                            }}
                          >
                            <Chip
                              label={priorityConfig.label}
                              size="medium"
                              sx={{
                                ...priorityConfig,
                                fontSize: '13px',
                                fontWeight: 700,
                                height: 23,
                              }}
                            />
                          </Box>

                          <Typography
                            variant="h3"
                            fontSize="18px"
                            color="text.secondary"
                            sx={{
                              mb: 2,
                              lineHeight: 1.25,
                              fontWeight: 600,
                              textTransform: 'capitalize',
                            }}
                          >
                            {task.name}
                          </Typography>

                          {task.description ? (
                            <Typography
                              variant="body2"
                              fontSize="0.75rem"
                              color="text.secondary"
                              sx={{
                                lineHeight: '1rem',
                                mb: 2,
                                WebkitLineClamp: 1,
                                display: '-webkit-box',
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                              }}
                            >
                              {task.description}
                            </Typography>
                          ) : (
                            <Typography
                              variant="body2"
                              fontSize="0.75rem"
                              color="text.secondary"
                              sx={{ fontStyle: 'italic', mb: 2 }}
                            >
                              No Description
                            </Typography>
                          )}

                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            {calculateTaskDays <= 0 ? (
                              <Typography variant="caption" color="red">
                                Expired
                              </Typography>
                            ) : task.startDate ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption">
                                  {formatDate(task.endDate)}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary', fontStyle: 'italic' }}
                              >
                                No Dates provided
                              </Typography>
                            )}
                          </Box>

                          {/* Progress */}
                          {/* <Box>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                mb: 1,
                              }}
                            >
                              <Typography variant="caption" fontWeight="600">
                                Progress
                              </Typography>
                              <Chip
                                label={
                                  calculateTaskDays >= 1
                                    ? `${calculateDeadline(task.startDate, task.endDate)} Days Left`
                                    : 'Expired'
                                }
                                size="small"
                                sx={{
                                  bgcolor: '#FFEBEE',
                                  color: '#C62828',
                                  height: 20,
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                }}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              {[1, 2, 3, 4].map((i) => (
                                <Box
                                  key={i}
                                  sx={{
                                    flex: 1,
                                    height: 8,
                                    bgcolor:
                                      i <= Math.floor(task.completion / 25) ? '#FF9800' : '#E0E0E0',
                                    borderRadius: 1,
                                  }}
                                />
                              ))}
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                mt: 0.5,
                                display: 'block',
                              }}
                            >
                              {task.completion}% Complete
                            </Typography>
                          </Box> */}
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <Card
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                    }}
                    elevation={0}
                  >
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" align="center">
                        No tasks assigned
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
      <UpdateMemberProfileModal
        open={open}
        onClose={handleClose}
        onUpdate={handleUpdateUser}
        selectedUser={profileUser}
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onDelete={handleRemoveFromTask}
        selected={profileUser ? `${profileUser.firstName} ${profileUser.lastName}` : ''}
        loading={loading}
      />
    </>
  );
}

export default MemberProfile;
