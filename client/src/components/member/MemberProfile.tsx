import {
  CalendarToday,
  Phone,
  Email,
  LocationOn,
  Edit,
  AccessTime,
  Delete,
  ArrowBack,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import UpdateMemberProfileModal from './UpdateMemberProfileModal';
import DeleteConfirmDialog from '../DeleteConfirmDialog';
import { useUser } from '../context/UserContext';
import { useSearch } from '../context/SearchContext';
import api from '../api/axiosConfig';

function MemberProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const memberId = location.state?.memberId;

  const [profileUser, setProfileUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
      setAllUsers(usersList);

      // user tasks
      const userTasks = tasksRes.data.filter((task: any) => {
        if (Array.isArray(task.assignedTo)) {
          return task.assignedTo.includes(memberId);
        }
        return task.assignedTo === memberId;
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

  const handleUpdateUser = (updatedUser: any) => {
    setProfileUser(updatedUser);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEditMemberProfile = () => {
    setOpen(true);
  };

  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteMember = async () => {
    setLoading(true);
    try {
      await api.delete(`/users/delete/${profileUser._id}`);

      handleCloseDeleteDialog();

      navigate('/member');
    } catch (error) {
      console.error('Error deleting member:', error);
    } finally {
      setLoading(false);
    }
  };

  const isLeader = tasks.some(
    (task) => task.leaderId === user?._id && task.assignedTo.includes(memberId)
  );

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
                      {isLeader && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            sx={{ color: '#4CAF50' }}
                            onClick={handleEditMemberProfile}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            sx={{ color: '#EF5350' }}
                            onClick={handleOpenDeleteDialog}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
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

                {tasks.length > 0 ? (
                  filteredTasks.map((task) => {
                    const calculateTaskDays = calculateDeadline(task.startDate, task.endDate);
                    return (
                      <Card
                        key={task._id}
                        onClick={() => navigate('/task')}
                        sx={{
                          mb: 2,
                          border: (theme) =>
                            `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`,
                          borderRadius: 2,
                          transition: 'all 0.3s',
                          '&:hover': {
                            boxShadow: 3,
                            transform: 'translateY(-4px)',
                          },
                        }}
                      >
                        <CardContent>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              mb: 1,
                            }}
                          >
                            <Chip
                              label={task.name}
                              size="small"
                              sx={{
                                bgcolor: '#E8F5E9',
                                color: '#2E7D32',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                              }}
                            />

                            {/* <Box sx={{ display: "flex", gap: 1 }}>
                              <IconButton
                                size="small"
                                sx={{ color: "#4CAF50" }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                sx={{ color: "#EF5350" }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box> */}
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <AvatarGroup max={5} sx={{ justifyContent: 'flex-end' }}>
                              <Avatar
                                src={profileUser?.avatar}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  fontSize: '12px',
                                  bgcolor: '#E0E0E0',
                                  color: '#484c7f',
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                }}
                              >
                                {profileUser?.firstName?.[0]}
                                {profileUser?.lastName?.[0]}
                              </Avatar>
                            </AvatarGroup>
                          </Box>

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

                          <Typography variant="caption" color="text.secondary">
                            {new Date(task.startDate).toLocaleDateString('en-GB')} -{' '}
                            {new Date(task.endDate).toLocaleDateString('en-GB')}
                          </Typography>

                          {/* Progress */}
                          <Box>
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
                          </Box>
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
        onDelete={handleDeleteMember}
        selected={profileUser ? profileUser.email : ''}
        loading={loading}
      />
    </>
  );
}

export default MemberProfile;
