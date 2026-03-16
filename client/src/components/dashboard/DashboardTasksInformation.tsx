import {
  Box,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  Typography,
  Avatar,
  AvatarGroup,
  CircularProgress,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import HighPriority from '../../assets/HighPriority';
import MediumPriority from '../../assets/MediumPriority';
import LowPriority from '../../assets/LowPriority';
import SearchInput from '../SearchInput';
import { useSearch } from '../context/SearchContext';

function DashboardTasksInformation() {
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const { searchTerm } = useSearch();
  const navigate = useNavigate();

  const calculateDeadline = (dateStart: string, dateEnd: string) => {
    const startDate = new Date(dateStart);
    const endDate = new Date(dateEnd);

    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const fetchAllDatas = async () => {
    setLoading(true);
    try {
      const [tasksRes, usersRes] = await Promise.all([api.get('/tasks'), api.get('/users')]);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDatas();
  }, []);

  const filteredTasks = tasks.filter((task: any) => {
    if (searchTerm.trim()) {
      const matchesSearch =
        task.name?.toLowerCase().includes(searchTerm.toLowerCase())

      if (!matchesSearch) return false;
    }

    return true;
  });

  const getUserTasks = () => {
    if (!user) return [];
    return tasks.filter((t) => t.leaderId === user._id || t.assignedTo?.includes(user._id));
  };

  const userTasks = getUserTasks();

  const priorityConfig: any = {
    high: { label: 'High', color: '#DE350B', icon: <HighPriority /> },
    medium: { label: 'Medium', color: '#FF991F', icon: <MediumPriority /> },
    low: { label: 'Low', color: '#0065FF', icon: <LowPriority /> },
  };

  const statusOptions = [
    { value: 'to-do', label: 'To Do', bg: '#DFE1E6', color: '#42526E' },
    { value: 'in-progress', label: 'In Progress', bg: '#DEEBFF', color: '#0052CC' },
    { value: 'done', label: 'Done', bg: '#E3FCEF', color: '#006644' },
  ];

  const handleViewTask = (taskId: any) => {
    navigate(`/task-detail?id=${taskId}`);
  };

  if (loading) {
    return (
      <Box sx={{ borderRadius: 2, p: 3, boxShadow: 1, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        borderRadius: 2,
        p: 3,
        boxShadow: 1,
        border: (theme) => `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
        <Typography variant="h6" fontWeight="bold">
        Tasks Information
      </Typography>
      <SearchInput width={130} height={24} fontSize='0.75rem' paddingLeft={5} />
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
                NAME
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
                DATE START
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
                DEADLINE
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
                LEADER
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
                ASSIGNEE
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
                STATUS
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography fontStyle="italic" color="text.secondary">
                    No tasks available!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task: any) => {
                const leader = users.find((user) => user._id === task.leaderId);
                const taskMembers = users.filter((user) => task.assignedTo?.includes(user._id));
                const calculateDays = calculateDeadline(task.startDate, task.endDate);

                const currentPriority = priorityConfig[task.priority] || priorityConfig.medium;
                const currentStatus = statusOptions.find((s) => s.value === task.status) ?? {
                  value: task.status,
                  label: task.status,
                  bg: '#DFE1E6',
                  color: '#42526E',
                };
                return (
                  <TableRow
                    key={task._id}
                    sx={{
                      '&:hover': { bgcolor: 'action.hover' },
                      '& td': {
                        borderBottom: (theme) =>
                          `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`,
                      },                   
                    }}                 
                    onClick={() => handleViewTask(task._id)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {task.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {task.startDate}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {calculateDays >= 1 ? (
                        <Typography variant="body2" color="text.secondary">
                          {calculateDeadline(task.startDate, task.endDate)} Days
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="red">
                          Expired
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {leader ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            src={leader.avatar}
                            sx={{
                              width: 24,
                              height: 24,
                              fontSize: '14px',
                              bgcolor: '#E0E0E0',
                              textTransform: 'uppercase',
                            }}
                          >
                            {leader.firstName?.[0]}
                            {leader.lastName?.[0]}
                          </Avatar>
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {leader.firstName} {leader.lastName}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No leader
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {taskMembers.length > 0 ? (
                        <AvatarGroup max={5} sx={{ justifyContent: 'flex-end' }}>
                          {taskMembers.length > 0 &&
                            taskMembers.map((member) => (
                              <Avatar
                                key={member._id}
                                src={member.avatar}
                                sx={{
                                  width: 24,
                                  height: 24,
                                  fontSize: '12px',
                                  bgcolor: '#E0E0E0',
                                  color: '#484c7f',
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                }}
                                title={`${member.firstName} ${member.lastName}`}
                              >
                                {member.firstName?.[0]}
                                {member.lastName?.[0]}
                              </Avatar>
                            ))}
                        </AvatarGroup>
                      ) : (
                        <Typography variant="body2" fontStyle="italic" color="text.secondary">
                          Unassigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography
                          sx={{
                            color: currentPriority.color,
                            fontWeight: 700,
                            fontSize: '0.9rem',
                          }}
                        >
                          {currentPriority.icon}
                        </Typography>
                        <Typography
                          fontSize="0.82rem"
                          sx={{ color: currentPriority.color, fontWeight: 600 }}
                        >
                          {currentPriority.label}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box
                        sx={{
                          bgcolor: currentStatus.bg,
                          color: currentStatus.color,
                          borderRadius: 1,
                          px: 1,
                          py: 0.5,
                          display: 'inline-block',
                        }}
                      >
                        <Typography fontSize="0.82rem" sx={{ fontWeight: 600 }}>
                          {currentStatus.label}
                        </Typography>
                      </Box>
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
}

export default DashboardTasksInformation;
