import { Box, Card, CardContent, CircularProgress, Grid, Paper, Typography } from '@mui/material';
import { BsJournalCheck as TotalTaskIcon } from 'react-icons/bs';
import { BsListCheck as CompleteTaskIcon } from 'react-icons/bs';
import { BsClipboardData as ProgressTaskIcon } from 'react-icons/bs';
import WelcomeIcon from '../icons/WelcomeIcon';
import DashboardProjectInformation from './DashboardProjectInformation';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import api from '../api/axiosConfig';
import TaskCharts from './DashboardProjectCharts';

function DashboardContent() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();

  const getUserTasks = () => {
    if (!user) return [];
    return tasks.filter((task) => task.leaderId === user._id || task.assignedTo?.includes(user._id));
  };

  const userTasks = getUserTasks();

  const totalTask = userTasks.length;
  const totalToDoTasks = userTasks.filter((task: any) => task.status === 'to-do').length;
  const totalCompletedTasks = userTasks.filter((task: any) => task.status === 'completed').length;
  const totalProgressTasks = userTasks.filter((task: any) => task.status === 'in-progress').length;

  const fetchAllDatas = async () => {
    setLoading(true);
    try {
      const tasksRes = await api.get('/tasks');

      setTasks(tasksRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllDatas();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          p: 4,
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
    );
  }

  const handleViewTasks = () => {
    navigate('/board');
  };

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 4, gap: 3 }}>
        {/* Total Task Cards */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              position: 'relative',
              overflow: 'visible',
              cursor: 'pointer',
              border: (theme) =>
                `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={handleViewTasks}
          >
            <CardContent
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 3,
                minHeight: { xs: 'auto', sm: 100, md: 110 },
                flex: 1,
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  bgcolor: '#FFE28C',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 30,
                  flexShrink: 0,
                }}
              >
                <TotalTaskIcon />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: '1 1 auto',
                  marginLeft: '1.5rem',
                  overflow: 'hidden',
                }}
              >
                <Typography
                  variant="body1"
                  color="text.secondary"
                  fontWeight="500"
                  sx={{
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Tasks
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ marginBottom: 0, fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}
                >
                  {userTasks.length === 0 ? 0 : totalTask}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total To Do Tasks */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              position: 'relative',
              overflow: 'visible',
              cursor: 'pointer',
              border: (theme) =>
                `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={handleViewTasks}
          >
            <CardContent
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 3,
                minHeight: { xs: 'auto', sm: 100, md: 110 },
                flex: 1,
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  bgcolor: '#FFE28C',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 30,
                  flexShrink: 0,
                }}
              >
                <CompleteTaskIcon />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: '1 1 auto',
                  marginLeft: '1.5rem',
                  overflow: 'hidden',
                }}
              >
                <Typography
                  variant="body1"
                  color="text.secondary"
                  fontWeight="500"
                  sx={{
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  To Do Tasks
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ marginBottom: 0, fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}
                >
                  {userTasks.length === 0 ? 0 : totalToDoTasks}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Completed Tasks */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              position: 'relative',
              overflow: 'visible',
              cursor: 'pointer',
              border: (theme) =>
                `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={handleViewTasks}
          >
            <CardContent
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 3,
                minHeight: { xs: 'auto', sm: 100, md: 110 },
                flex: 1,
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  bgcolor: '#FFE28C',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 30,
                  flexShrink: 0,
                }}
              >
                <CompleteTaskIcon />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: '1 1 auto',
                  marginLeft: '1.5rem',
                  overflow: 'hidden',
                }}
              >
                <Typography
                  variant="body1"
                  color="text.secondary"
                  fontWeight="500"
                  sx={{
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Completed Tasks
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ marginBottom: 0, fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}
                >
                  {userTasks.length === 0 ? 0 : totalCompletedTasks}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Progress Tasks */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              position: 'relative',
              overflow: 'visible',
              cursor: 'pointer',
              border: (theme) =>
                `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={handleViewTasks}
          >
            <CardContent
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 3,
                minHeight: { xs: 'auto', sm: 100, md: 110 },
                flex: 1,
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  bgcolor: '#FFE28C',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 30,
                  flexShrink: 0,
                }}
              >
                <ProgressTaskIcon />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: '1 1 auto',
                  marginLeft: '1.5rem',
                  overflow: 'hidden',
                }}
              >
                <Typography
                  variant="body1"
                  color="text.secondary"
                  fontWeight="500"
                  sx={{
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Progress Tasks
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ marginBottom: 0, fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}
                >
                  {userTasks.length === 0 ? 0 : totalProgressTasks}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Welcome Section */}
        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              border: (theme) =>
                `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`,
              gap: { xs: 2, md: 4 },
            }}
          >
            <Box sx={{ flex: 1, maxWidth: { xs: '100%', md: '60%' } }}>
              <Typography
                variant="h4"
                fontWeight="bold"
                gutterBottom
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                }}
              >
                Welcome to My-task, a Project Management System
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                component="p"
                sx={{
                  lineHeight: '24px',
                  mb: { xs: 2, md: 3 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                Manage projects with ease and boost team productivity. Our intuitive platform helps
                you plan, execute, and track every aspect of your projects. From task assignment to
                deadline management, everything you need is at your fingertips.
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',

                maxWidth: { xs: '100%', md: '40%' },
              }}
            >
              <WelcomeIcon />
            </Box>
          </Paper>
        </Grid>

        {/* Task Charts - Status Overview & Priority Breakdown */}
        <Grid size={{ xs: 12 }}>
          <TaskCharts tasks={tasks} />
        </Grid>
      </Grid>
     
      <DashboardProjectInformation />
    </>
  );
}

export default DashboardContent;
