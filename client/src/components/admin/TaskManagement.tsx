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
  AvatarGroup,
} from '@mui/material';
import api from '../api/axiosConfig';
import { MoreHoriz } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import { formatDate } from '../helper/helper';

const TaskManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const { searchTerm } = useSearch();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });
  const navigate = useNavigate();

  const totalTasks = tasks.length;
  const toDoTasks = tasks.filter((task) => task.status === 'to-do').length;
  const inProgressTasks = tasks.filter((task) => task.status === 'in-progress').length;
  const doneTasks = tasks.filter((task) => task.status === 'done').length;

  const tasksTotalCards = [
    {
      title: 'Total tasks',
      description: '',
      total: totalTasks,
    },
    {
      title: 'To do tasks',
      description: '',
      total: toDoTasks,
    },
    {
      title: 'In-progress tasks',
      description: '',
      total: inProgressTasks,
    },
    {
      title: 'Done tasks',
      description: '',
      total: doneTasks,
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, usersRes] = await Promise.all([api.get('/tasks'), api.get('/users')]);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter((task: any) => {
    // Filter by search term
    if (searchTerm.trim()) {
      const matchesSearch =
        task.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
    }

    return true;
  });

  const getPriorityChip = (priority: 'high' | 'medium' | 'low') => {
    const config = {
      high: { label: 'High', bgcolor: '#FFEBEE', color: '#C62828' },
      medium: { label: 'Medium', bgcolor: '#FFF9C4', color: '#F57F17' },
      low: { label: 'Low', bgcolor: '#C8E6C9', color: '#388E3C' },
    };
    return config[priority] || config.medium;
  };

  const getStatusChip = (status: 'toDo' | 'inProgress' | 'done') => {
    const config = {
      toDo: { label: 'To do', bgcolor: '#DFE1E6', color: '#42526E' },
      inProgress: { label: 'In progress', bgcolor: '#DEEBFF', color: '#0052CC' },
      done: { label: 'Done', bgcolor: '#E3FCEF', color: '#006644' },
    };
    return config[status] || config.toDo;
  };

  const handleViewTaskDetail = (task: any) => {
    navigate('/admin/task-detail', { state: { taskId: task._id } });
  };

  const handleOpenAction = (event: React.MouseEvent<HTMLElement>) => {
    setActionAnchorEl(event.currentTarget);
  };

  const handleCloseAction = () => {
    setActionAnchorEl(null);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600, color: '#172B4D' }}>
        Tasks
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
              {tasksTotalCards.map((taskCard, index) => (
                <Grid size={{ xs: 10, md: 3 }} key={index}>
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
                        {taskCard.title}
                      </Typography>
                      <Typography fontSize="20px" sx={{ fontWeight: 500, color: '#292A2E' }}>
                        {taskCard.total}
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
                TASK NAME
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
                ASSIGNED TO
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
                PRIORITY
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
                DUE DATE
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
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography fontStyle="italic" color="text.secondary">
                    No task available!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task: any) => {
                const priorityConfig = getPriorityChip(task.priority);
                const statusConfig = getStatusChip(task.status);
                const assignedUserIds = Array.isArray(task.assignedTo)
                  ? task.assignedTo
                  : task.assignedTo
                    ? [task.assignedTo]
                    : [];

                const assignedUsers = assignedUserIds
                  .map((userId: string) => users.find((u) => u._id === userId))
                  .filter(Boolean);

                return (
                  <TableRow
                    key={task._id}
                    onClick={() => handleViewTaskDetail(task)}
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
                      <Typography
                        sx={{
                          fontSize: '14px',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      >
                        {task.name}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <AvatarGroup
                        max={3}
                        sx={{
                          '& .MuiAvatar-root': {
                            width: 24,
                            height: 24,
                            fontSize: '10px',
                          },
                          justifyContent: 'flex-end',
                        }}
                      >
                        {assignedUsers.length > 0 &&
                          assignedUsers.map((user: any) => (
                            <Avatar
                              key={user._id}
                              src={user.avatar}
                              sx={{
                                width: 20,
                                height: 20,
                                fontSize: '10px',
                                bgcolor: '#E0E0E0',
                                textTransform: 'uppercase',
                              }}
                              title={`Assignee: ${user.firstName} ${user.lastName}`}
                            >
                              {user.firstName?.[0]}
                              {user.lastName?.[0]}
                            </Avatar>
                          ))}
                      </AvatarGroup>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={priorityConfig.label.toUpperCase()}
                        size="small"
                        title={`Priority: ${priorityConfig.label}`}
                        sx={{
                          ...priorityConfig,
                          fontSize: '12px',
                          fontWeight: 700,
                          height: 23,
                        }}
                      />
                    </TableCell>

                    <TableCell>{formatDate(task.endDate)}</TableCell>

                    <TableCell>
                      <Chip
                        label={statusConfig.label.toUpperCase()}
                        size="small"
                        title={`Status: ${statusConfig.label}`}
                        sx={{
                          ...statusConfig,
                          fontSize: '12px',
                          fontWeight: 700,
 
                        }}
                      />
                    </TableCell>

                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <IconButton onClick={(e) => handleOpenAction(e)}>
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
        <MenuItem>
          <Typography fontSize="14px">Edit</Typography>
        </MenuItem>

        <MenuItem>
          <Typography fontSize="14px" color="warning">
            Delete Task
          </Typography>
        </MenuItem>
      </Menu>

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

export default TaskManagement;
