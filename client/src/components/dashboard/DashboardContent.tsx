import { Box, Card, CardContent, CircularProgress, Grid, IconButton, Paper, Typography } from "@mui/material"
import { ChevronRight } from "@mui/icons-material"
import { BsJournalCheck as TotalTaskIcon } from "react-icons/bs";
import { BsListCheck as CompleteTaskIcon } from "react-icons/bs";
import { BsClipboardData as ProgressTaskIcon } from "react-icons/bs";
import { AiOutlineFundProjectionScreen as TotalProjectIcon } from "react-icons/ai";
import { BiTask as CompleteProjectIcon } from "react-icons/bi";
import { TbSubtask as ProgressProjectIcon } from "react-icons/tb";
import WelcomeIcon from "../icons/WelcomeIcon"
import DashboardProjectInformation from "./DashboardProjectInformation"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import api from "../api/axiosConfig";
import ProjectCharts from "./DashboardProjectCharts";

function DashboardContent() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();

  const getUserProjects = () => {
    if (!user) return [];
    return projects.filter(
      (p) => p.leaderId === user._id || p.members?.includes(user._id)
    );
  };

  const userProjects = getUserProjects();

  const getUserTasks = () => {
    if (!user) return [];
    const userProjects = getUserProjects();
    const projectIds = userProjects.map(p => p._id);
    return tasks.filter(task => projectIds.includes(task.projectId));
  };

  const userTasks = getUserTasks();

  const totalTask = userTasks.length;
  const totalToDoTasks = userTasks.filter((task: any) => task.status === "to-do").length;
  const totalCompletedTasks = userTasks.filter((task: any) => task.status === "completed").length;
  const totalProgressTasks = userTasks.filter((task: any) => task.status === "in-progress").length;

  const totalProject = userProjects.length;
  //const toDoProject = projects.filter((project: any) => project.completion > 0).length;
  const totalCompletedProjects = userProjects.filter((project: any) => project.completion === 100).length;
  const totalProgressProjects = userProjects.filter((project: any) => project.completion > 0).length;

  const fetchAllDatas = async () => {
    setLoading(true);
    try {
      const [projectsRes, tasksRes] =
        await Promise.all([
          api.get("/projects"),
          api.get("/tasks")
        ]);
      setProjects(projectsRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error(err)
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchAllDatas();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          p: 4,
          order: 3,
          flex: "1 1",
          height: "60vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const handleViewTasks = () => {
    navigate("/task");
  }


  return (
    <>
      <Grid container spacing={3} sx={{ mb: 4, gap: 3 }}>
        {/* Total Task Cards */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }} >
          <Card
            elevation={0}
            sx={{
              position: "relative",
              overflow: "visible",
              cursor: "pointer",
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
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 3,
                minHeight: { xs: 'auto', sm: 100, md: 110 },
                flex: 1,
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  bgcolor: "#FFE28C",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                  flexShrink: 0,
                }}
              >
                <TotalTaskIcon />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: "1 1 auto",
                  marginLeft: "1.5rem",
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
                <Typography variant="h5" sx={{ marginBottom: 0, fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }, }}>
                  {userTasks.length === 0 ? 0 : totalTask}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total To Do Tasks */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }} >
          <Card
            elevation={0}
            sx={{
              position: "relative",
              overflow: "visible",
              cursor: "pointer",
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
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 3,
                minHeight: { xs: 'auto', sm: 100, md: 110 },
                flex: 1,
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  bgcolor: "#FFE28C",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                  flexShrink: 0,
                }}
              >
                <CompleteTaskIcon />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: "1 1 auto",
                  marginLeft: "1.5rem",
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
                <Typography variant="h5" sx={{ marginBottom: 0, fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }, }}>
                  {userTasks.length === 0 ? 0 : totalToDoTasks}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Completed Tasks */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }} >
          <Card
            elevation={0}
            sx={{
              position: "relative",
              overflow: "visible",
              cursor: "pointer",
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
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 3,
                minHeight: { xs: 'auto', sm: 100, md: 110 },
                flex: 1,
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  bgcolor: "#FFE28C",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                  flexShrink: 0,
                }}
              >
                <CompleteTaskIcon />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: "1 1 auto",
                  marginLeft: "1.5rem",
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
                <Typography variant="h5" sx={{ marginBottom: 0, fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }, }}>
                  {userTasks.length === 0 ? 0 : totalCompletedTasks}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Progress Tasks */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }} >
          <Card
            elevation={0}
            sx={{
              position: "relative",
              overflow: "visible",
              cursor: "pointer",
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
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 3,
                minHeight: { xs: 'auto', sm: 100, md: 110 },
                flex: 1,
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  bgcolor: "#FFE28C",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                  flexShrink: 0,
                }}
              >
                <ProgressTaskIcon />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: "1 1 auto",
                  marginLeft: "1.5rem",
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
                <Typography variant="h5" sx={{ marginBottom: 0, fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }, }}>
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
              display: "flex",
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: "center",
              justifyContent: "space-between",
              border: (theme) =>
                `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`,
              gap: { xs: 2, md: 4 },
            }}
          >
            <Box sx={{ flex: 1, maxWidth: { xs: '100%', md: '60%' }, }}>
              <Typography
                variant="h4"
                fontWeight="bold"
                gutterBottom
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                }}>
                Welcome to My-task, a Project Management System
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                component="p"
                sx={{
                  lineHeight: "24px",
                  mb: { xs: 2, md: 3 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                Manage projects with ease and boost team productivity. Our
                intuitive platform helps you plan, execute, and track every
                aspect of your projects. From task assignment to deadline
                management, everything you need is at your fingertips.
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",

                maxWidth: { xs: '100%', md: '40%' }
              }}
            >
              <WelcomeIcon />
            </Box>
          </Paper>
        </Grid>

        {/* Project Charts - Status Overview & Priority Breakdown */}
        <Grid size={{ xs: 12 }}>
          <ProjectCharts projects={userProjects} tasks={tasks} />
        </Grid>
      </Grid>

      {/* Project Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }} >
          <Card
            elevation={0}
            sx={{
              backgroundColor: "#484c7f",
              position: "relative",
              overflow: "visible",
              border: (theme) =>
                `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : 'inherit'}`,
              color: "white",
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 3,
                minHeight: { xs: 'auto', md: 100 },
                flex: 1,
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  flexShrink: 0,
                }}
              >
                <TotalProjectIcon />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: "1 1 auto",
                  marginLeft: "1.5rem",
                  overflow: 'hidden',
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="500"
                  sx={{
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Total Projects
                </Typography>
                <Typography sx={{
                  marginBottom: 0,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                }}>
                  {userProjects.length === 0 ? 0 : totalProject}
                </Typography>
              </Box>           
            </CardContent>
          </Card>
        </Grid>

        {/* Completed Projects Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              backgroundColor: "#484c7f",
              position: "relative",
              overflow: "visible",
              border: (theme) =>
                `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : 'inherit'}`,
              color: "white",
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 3,
                minHeight: { xs: 'auto', md: 100 },
                flex: 1,
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  flexShrink: 0,
                }}
              >
                <CompleteProjectIcon />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: "1 1 auto",
                  marginLeft: "1.5rem",
                  overflow: 'hidden',
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="500"
                  sx={{
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Total Completed Projects
                </Typography>
                <Typography sx={{
                  marginBottom: 0,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                }}>
                  {userProjects.length === 0 ? 0 : totalCompletedProjects}
                </Typography>
              </Box>        
            </CardContent>
          </Card>
        </Grid>

        {/* Progress Projects Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              backgroundColor: "#484c7f",
              position: "relative",
              overflow: "visible",
              border: (theme) =>
                `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : 'inherit'}`,
              color: "white",
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 3,
                minHeight: { xs: 'auto', md: 100 },
                flex: 1,
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  flexShrink: 0,
                }}
              >
                <ProgressProjectIcon />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: "1 1 auto",
                  marginLeft: "1.5rem",
                  overflow: 'hidden',
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="500"
                  sx={{
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Total Progress Projects
                </Typography>
                <Typography sx={{
                  marginBottom: 0,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                }}>
                  {userProjects.length === 0 ? 0 : totalProgressProjects}
                </Typography>
              </Box>        
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <DashboardProjectInformation />
    </>
  )
}

export default DashboardContent
