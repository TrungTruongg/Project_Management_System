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
} from '@mui/material';
import api from '../api/axiosConfig';
import { MoreHoriz } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.active).length;
  const totalLeaders = users.filter((user) => user.role === 'leader').length;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleViewProfile = (user: any) => {
    navigate('/admin/user-profile', { state: { userId: user._id } });
  };

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
      title: 'Leaders',
      description: '',
      total: totalLeaders,
    },
  ];

  const handleOpenAction = (event: React.MouseEvent<HTMLElement>) => {
    setActionAnchorEl(event.currentTarget);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600, color: '#172B4D' }}>
        Users
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography fontSize="14px" sx={{ mb: 2, color: '#292A2E' }}>
          Any user invited to your organization can access your app. Manage app access for
          individual users or set app access permissions to control other ways users can access your
          app. Go to app access settings.
        </Typography>
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
                User
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
                Status
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
                Last Login
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
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography fontStyle="italic" color="text.secondary">
                    No users available!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: any) => {
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
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={user.active ? 'Active' : 'Inactive'}
                        color={user.active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.lastLogin).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
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
                          <Typography fontSize="14px">Add to group</Typography>
                        </MenuItem>

                        <MenuItem>
                          <Typography fontSize="14px">Temporarily suspend access</Typography>
                        </MenuItem>

                        <MenuItem>
                          <Typography fontSize="14px" color="warning">
                            Delete User
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
    </Box>
  );
};

export default UserManagement;
