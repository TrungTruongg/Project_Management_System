import {
  Alert,
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Fade,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Typography,
} from '@mui/material';
import { GoPlusCircle as AddTaskIcon } from 'react-icons/go';
import { CalendarToday, MoreHoriz, Refresh as RefreshIcon } from '@mui/icons-material';
import { useEffect, useMemo, useState } from 'react';
import TaskFilters, { type FilterState } from './TaskFilters';
import CreateTaskModal from './CreateTaskModal';
import DeleteConfirmDialog from '../DeleteConfirmDialog';
import { useUser } from '../context/UserContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import api from '../api/axiosConfig';
import { formatDate } from '../helper/helper';

function Tasks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [openCreateTaskModal, setOpenCreateTaskModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskList, setTaskList] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();
  const { searchTerm } = useSearch();
  const [menuOpenTaskId, setMenuOpenTaskId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });

  // Get filter params from URL
  const taskId = searchParams.get('id');

  const [activeFilters, setActiveFilters] = useState<FilterState>({
    assignee: [],
    status: [],
    priority: [],
  });

  const initialFilters = useMemo(() => {
    const filterStatusParam = searchParams.get('status');
    const filterPriorityParam = searchParams.get('priority');

    const filters: FilterState = {
      assignee: [],
      status: [],
      priority: [],
    };

    if (filterStatusParam) {
      filters.status = [filterStatusParam];
    }

    if (filterPriorityParam) {
      filters.priority = [filterPriorityParam];
    }

    return filters;
  }, []);

  // Apply initial filters from URL on mount
  useEffect(() => {
    const filterStatusParam = searchParams.get('status');
    const filterPriorityParam = searchParams.get('priority');

    if (filterStatusParam || filterPriorityParam) {
      setActiveFilters(initialFilters);

      // Clean URL after reading params
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('status');
      newSearchParams.delete('priority');
      setSearchParams(newSearchParams, { replace: true });
    }

    fetchAllData();
  }, []);

  const calculateDeadline = (dateStart: string, dateEnd: string) => {
    const startDate = new Date(dateStart);
    const endDate = new Date(dateEnd);

    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [responseTask, responseUser] = await Promise.all([
        api.get('/tasks'),
        api.get('/users'),
      ]);

      setUsers(responseUser.data);
      setTaskList(responseTask.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = taskList.filter((task: any) => {

    console.log(typeof task.assignedTo);
    // Filter by task ID
    if (taskId && task._id !== taskId) {
      return false;
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const matchesSearch =
        task.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
    }

    // Filter by assignees
    if (activeFilters.assignee.length > 0) {
      const taskAssignees = Array.isArray(task.assignedTo)
        ? task.assignedTo
        : task.assignedTo
          ? [task.assignedTo]
          : [];

      // Check if leader or any assignee matches the filter
      const hasMatch = activeFilters.assignee.some(userId => 
        task.leaderId === userId || taskAssignees.includes(userId)
      );

      if (!hasMatch) return false;
    }

    // Filter by status
    if (activeFilters.status.length > 0) {
      if (!activeFilters.status.includes(task.status)) {
        return false;
      }
    }

    // Filter by priority
    if (activeFilters.priority.length > 0) {
      if (!activeFilters.priority.includes(task.priority)) {
        return false;
      }
    }

    return true;
  });

  // Handler cho filter change
  const handleFilterChange = (filters: FilterState) => {
    setActiveFilters(filters);
  };

  const getPriorityChip = (priority: 'high' | 'medium' | 'low') => {
    const config = {
      high: { label: 'HIGH PRIORITY', bgcolor: '#FFEBEE', color: '#C62828' },
      medium: { label: 'MEDIUM PRIORITY', bgcolor: '#FFF9C4', color: '#F57F17' },
      low: { label: 'LOW PRIORITY', bgcolor: '#C8E6C9', color: '#388E3C' },
    };
    return config[priority] || config.medium;
  };

  const handleOpenModal = () => {
    setOpenCreateTaskModal(true);
  };

  const handleCloseModal = () => {
    setOpenCreateTaskModal(false);
    setSelectedTask(null);
  };

  const handleEditTask = (task: any) => {
    setSelectedTask(task);
    setOpenCreateTaskModal(true);
    setMenuOpenTaskId(null);
  };

  const tasksByStatus = useMemo(() => {
    const todo = filteredTasks.filter((t) => t.status === 'to-do');
    const inProgress = filteredTasks.filter((t) => t.status === 'in-progress');
    const done = filteredTasks.filter((t) => t.status === 'done');
    return { todo, inProgress, done };
  }, [filteredTasks]);

  // New task
  const handleSaveTask = async (newTask: any) => {
    setTaskList([...taskList, newTask]);
  };

  // Update Task
  const handleUpdateTask = async (updatedTask: any) => {
    const oldTask = taskList.find((t) => t._id === updatedTask._id);

    const taskToUpdate = {
      ...updatedTask,
      _id: updatedTask._id || oldTask?._id,
    };

    setTaskList(taskList.map((task: any) => (task._id === taskToUpdate._id ? taskToUpdate : task)));
  };

  // Delete Task
  const handleDeleteTask = async () => {
    setDeleteLoading(true);

    if (!selectedTask) return;

    try {
      await api.delete(`/tasks/delete/${selectedTask._id}`);

      // Delete attachments related to the task
      const attachmentsRes = await api.get('/attachments');

      const taskAttachments = attachmentsRes.data.filter(
        (att: any) => att.taskId === selectedTask._id
      );

      // Delete every attachment
      for (const attachment of taskAttachments) {
        await api.delete(`/attachments/${attachment._id}`);
      }

      setTaskList(taskList.filter((task: any) => task._id !== selectedTask._id));

      handleCloseDeleteDialog();
      setSnackbar({
        open: true,
        message: 'Deleted task successfully!',
        type: 'success',
      });
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenDeleteDialog = (task: any) => {
    setSelectedTask(task);
    setDeleteDialogOpen(true);
    setMenuOpenTaskId(null);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedTask(null);
  };

  const handleViewTask = (taskId: any) => {
    navigate(`/task-detail?id=${taskId}`);
  };

  const handleOpenMenu = (taskId: string) => {
    setMenuOpenTaskId(taskId);
  };
  const handleCloseMenu = () => {
    setMenuOpenTaskId(null);
  };

  const renderTaskCard = (task: any) => {
    const priorityConfig = getPriorityChip(task.priority);

    const assignedUserIds = Array.isArray(task.assignedTo)
      ? task.assignedTo
      : task.assignedTo
        ? [task.assignedTo]
        : [];

    const assignedUsers = assignedUserIds
      .map((userId: string) => users.find((u) => u._id === userId))
      .filter(Boolean);

    const calculateDays = calculateDeadline(task.startDate, task.endDate);

    return (
      <Card
        key={task._id}
        sx={{
          mb: 2,
          cursor: 'pointer',
          boxShadow: 1,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`,
          width: '100%',
        }}
        onClick={() => handleViewTask(task._id)}
      >
        <CardContent sx={{ p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: 1,
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
            <Box sx={{ display: 'flex', gap: 1 }} onClick={(e) => e.stopPropagation()}>
              <IconButton
                id={`fade-button-${task._id}`}
                aria-controls={menuOpenTaskId === task._id ? `fade-menu-${task._id}` : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpenTaskId === task._id ? 'true' : undefined}
                onClick={() => handleOpenMenu(task._id)}
              >
                <MoreHoriz fontSize="small" />
              </IconButton>
              <Menu
                id={`fade-menu-${task._id}`}
                slotProps={{
                  list: {
                    'aria-labelledby': `fade-button-${task._id}`,
                  },
                }}
                slots={{ transition: Fade }}
                anchorEl={
                  menuOpenTaskId === task._id
                    ? document.getElementById(`fade-button-${task._id}`)
                    : null
                }
                open={menuOpenTaskId === task._id}
                onClose={handleCloseMenu}
              >
                <MenuItem onClick={() => handleEditTask(task)}>
                  <Typography>Edit</Typography>
                </MenuItem>
                <MenuItem onClick={() => handleOpenDeleteDialog(task)}>
                  <Typography color="error">Delete</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Typography
            variant="h3"
            fontSize="18px"
            color="text.secondary"
            sx={{ mb: 2, lineHeight: 1.25, fontWeight: 600, textTransform: 'capitalize' }}
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

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {calculateDays <= 0 ? (
              <Typography variant="caption" color="red">
                Expired
              </Typography>
            ) : task.startDate ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption">{formatDate(task.endDate)}</Typography>
              </Box>
            ) : (
              <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                No Dates provided
              </Typography>
            )}

            <AvatarGroup max={5}>
              {task?.leaderId && (
                <Avatar
                  key={`leader-${task.leaderId}`}
                  src={users.find((u) => u._id === task.leaderId)?.avatar}
                  sx={{
                    width: 24,
                    height: 24,
                    fontSize: '10px',
                    bgcolor: '#FF9800',
                    color: 'white',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    border: '2px solid #FFA726',
                  }}
                  title={`Leader: ${users.find((u) => u._id === task.leaderId)?.firstName} ${users.find((u) => u._id === task.leaderId)?.lastName}`}
                >
                  {users.find((u) => u._id === task.leaderId)?.firstName?.[0]}
                  {users.find((u) => u._id === task.leaderId)?.lastName?.[0]}
                </Avatar>
              )}
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
                    title={`Members: ${user.firstName} ${user.lastName}`}
                  >
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </Avatar>
                ))}
            </AvatarGroup>
          </Box>

          {/* <Divider sx={{ mb: 2 }} /> */}

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
                  isTaskExpired(task.endDate)
                    ? 'Expired'
                    : (task.endDate && task.startDate) === ''
                      ? 'No deadline'
                      : `${calculateDeadline(task.startDate, task.endDate)} Days Left`
                }
                size="small"
                sx={{
                  bgcolor: isTaskExpired(task.endDate) ? '#FFCDD2' : '#FFEBEE',
                  color: isTaskExpired(task.endDate) ? '#B71C1C' : '#C62828',
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
                    bgcolor: i <= Math.floor(task.completion / 25) ? '#FF9800' : '#E0E0E0',
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
              {task.completion}% Done
            </Typography>
          </Box> */}
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography fontSize="1.5rem" fontWeight="700">
              Tasks Management
            </Typography>
          </Box>

          <Chip
            label={filteredTasks.length}
            size="small"
            sx={{
              fontSize: '14px',
              fontWeight: 500,
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TaskFilters
            users={users}
            currentUser={user}
            onFilterChange={handleFilterChange}
            initialFilters={initialFilters}
          />

          <IconButton
            onClick={fetchAllData}
            disabled={loading}
            sx={{ color: 'text.secondary' }}
            title="Refresh members"
          >
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddTaskIcon />}
            onClick={handleOpenModal}
            sx={{
              backgroundColor: '#484c7f',
              color: 'white',
              textTransform: 'none',
              px: 3,
            }}
          >
            Create Task
          </Button>
        </Box>
      </Box>

      {/* Tasks Grid */}
      {loading ? (
        <Box
          sx={{
            order: 3,
            flex: '1 1',
            height: '60vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      ) : filteredTasks.length === 0 ? (
        <Typography fontStyle="italic">No tasks available!</Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2,
            alignItems: 'start',
          }}
        >
          <Box sx={{ bgcolor: '#f4f5f7', borderRadius: 2, p: 2 }}>
            <Typography
              fontWeight={700}
              fontSize="0.85rem"
              textTransform="uppercase"
              color="text.secondary"
              textAlign="left"
              width="100%"
              sx={{ mb: 2 }}
            >
              To Do ({tasksByStatus.todo.length})
            </Typography>

            <Box sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
              {tasksByStatus.todo.map(renderTaskCard)}
            </Box>
          </Box>

          <Box sx={{ bgcolor: '#f4f5f7', borderRadius: 2, p: 2 }}>
            <Typography
              fontWeight={700}
              fontSize="0.85rem"
              textTransform="uppercase"
              color="text.secondary"
              textAlign="left"
              width="100%"
              sx={{ mb: 2 }}
            >
              In Progress ({tasksByStatus.inProgress.length})
            </Typography>

            <Box sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
              {tasksByStatus.inProgress.map(renderTaskCard)}
            </Box>
          </Box>

          <Box sx={{ bgcolor: '#f4f5f7', borderRadius: 2, p: 2 }}>
            <Typography
              fontWeight={700}
              fontSize="0.85rem"
              textTransform="uppercase"
              color="text.secondary"
              textAlign="left"
              width="100%"
              sx={{ mb: 2 }}
            >
              Done ({tasksByStatus.done.length})
            </Typography>

            <Box sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
              {tasksByStatus.done.map(renderTaskCard)}
            </Box>
          </Box>
        </Box>
      )}

      <CreateTaskModal
        open={openCreateTaskModal}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        taskList={taskList}
        selectedTask={selectedTask}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onDelete={handleDeleteTask}
        selected={selectedTask ? selectedTask.name : ''}
        loading={deleteLoading}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        sx={{ mt: 10 }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.type}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Tasks;
