import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import api from '../api/axiosConfig';
import { MoreHoriz } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import { formatLastLogin } from '../helper/helper';
import ResetPasswordDialog from './ResetPasswordDialog';

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [openResetPasswordDialog, setOpenResetPasswordDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const { searchTerm } = useSearch();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });
  const navigate = useNavigate();

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => !user.isLocked).length;
  const onlineUsers = users.filter((user) => user.isOnline).length;

  const usersTotalCards = [
    {
      title: 'Total users',
      description: '',
      total: totalUsers,
    },
    {
      title: 'Active users',
      description: '',
      total: activeUsers,
    },
    {
      title: 'Online users',
      description: '',
      total: onlineUsers,
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user: any) => {
    // Filter by search term
    if (searchTerm.trim()) {
      const matchesSearch =
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
    }

    return true;
  });

  const handleOpenChangeEmailDialog = () => {
    setOpenResetPasswordDialog(true);
  };

  const handleCloseChangeEmailDialog = () => {
    setOpenResetPasswordDialog(false);
  };

  const handleLockUser = async (userId: string, isLocked: boolean) => {
    try {
      if (isLocked) {
        await api.delete(`/locks/${userId}`);
        setSnackbar({ open: true, message: 'Access has been restored', type: 'success' });
      } else {
        await api.post(`/locks/${userId}`);
        setSnackbar({
          open: true,
          message: 'Access has been temporarily suspended',
          type: 'success',
        });
      }
      fetchUsers();
      setActionAnchorEl(null);
    } catch (error: any) {
      console.error('Failed to lock/unlock user:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Action failed',
        type: 'error',
      });
    }
  };

  const handleViewProfile = (user: any) => {
    navigate('/admin/user-profile', { state: { userId: user._id } });
  };

  const handleOpenAction = (event: React.MouseEvent<HTMLElement>, user: any) => {
    setActionAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleCloseAction = () => {
    setActionAnchorEl(null);
    setSelectedUser(null);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600, color: '#172B4D' }}>
        Users and Security Management
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography fontSize="14px" sx={{ mb: 2, color: '#292A2E' }}>
          Audit account activity, manage hierarchical permissions, and enforce security protocols
          across the enterprise architectural network.
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={2}>
              {usersTotalCards.map((userCard, index) => (
                <Grid size={{ xs: 10, md: 4 }} key={index}>
                  <Card
                    elevation={0}
                    sx={{
                      border: '1px solid #DFE1E6',
                      borderRadius: 2,
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 2,
                        '&:last-child': { pb: 2 },
                      }}
                    >
                      <Typography fontSize="14px" sx={{ color: '#292A2E' }}>
                        {userCard.title}
                      </Typography>
                      <Typography fontSize="20px" sx={{ fontWeight: 500, color: '#292A2E' }}>
                        {userCard.total}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>

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
                FULL NAME
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
                EMAIL
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
                ROLE
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
                LAST LOGIN
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
                STATUS
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
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography fontStyle="italic" color="text.secondary">
                    No users available!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user: any) => {
                return (
                  <TableRow
                    key={user._id}
                    onClick={() => handleViewProfile(user)}
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
                    <TableCell
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Avatar
                        src={user.avatar}
                        sx={{
                          width: 40,
                          height: 40,
                          fontSize: 16,
                          color: 'white',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                        }}
                      >
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Typography
                          sx={{
                            fontSize: '14px',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                          }}
                        >
                          {user.firstName} {user.lastName}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        <Chip
                          label={user.role === 'user' ? 'User' : 'Admin'}
                          color={user.role === 'user' ? 'default' : 'info'}
                          size="small"
                        />
                      </Typography>
                    </TableCell>

                    <TableCell>{formatLastLogin(user.lastLogin)}</TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={user.isLocked ? 'Locked' : 'Active'}
                          color={user.isLocked ? 'error' : 'default'}
                          size="small"
                        />
                      </Box>
                    </TableCell>

                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <IconButton onClick={(e) => handleOpenAction(e, user)}>
                        <MoreHoriz />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        elevation={0}
        open={Boolean(actionAnchorEl)}
        onClose={handleCloseAction}
        anchorEl={actionAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleOpenChangeEmailDialog}>
          <Typography fontSize="14px">Reset password</Typography>
        </MenuItem>

        <MenuItem
          onClick={() => selectedUser && handleLockUser(selectedUser._id, selectedUser.isLocked)}
        >
          <Typography fontSize="14px">
            {selectedUser?.isLocked ? 'Unlock access' : 'Temporarily suspend access'}
          </Typography>
        </MenuItem>

        <MenuItem>
          <Typography fontSize="14px" color="warning">
            Delete User
          </Typography>
        </MenuItem>
      </Menu>

      <ResetPasswordDialog
        open={openResetPasswordDialog}
        onClose={handleCloseChangeEmailDialog}
        selectedUser={selectedUser}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.type}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;
