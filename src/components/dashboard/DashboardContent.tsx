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
import axios from "axios"
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const API_KEY = import.meta.env.VITE_API_KEY;

function DashboardContent() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();

  const totalTask = tasks.length;
  const totalToDoTasks = tasks.filter((task: any) => task.status === "to-do").length;
  const totalCompletedTasks = tasks.filter((task: any) => task.status === "completed").length;
  const totalProgressTasks = tasks.filter((task: any) => task.status === "in-progress").length;

  const totalProjects = projects.length;
  //const toDoProject = projects.filter((project: any) => project.completion > 0).length;
  const totalCompletedProjects = projects.filter((project: any) => project.completion === 100).length;
  const totalProgressProjects = projects.filter((project: any) => project.completion > 0).length;

  const fetchAllDatas = async () => {
    setLoading(true);
    try {
      const [projectsRes, tasksRes] =
        await Promise.all([
          axios.get(
            `https://mindx-mockup-server.vercel.app/api/resources/projects?apiKey=${API_KEY}`
          ),
          axios.get(
            `https://mindx-mockup-server.vercel.app/api/resources/tasks?apiKey=${API_KEY}`
          )
        ]);
      setProjects(projectsRes.data.data.data);
      setTasks(tasksRes.data.data.data);
    } catch (err) {
      console.error(err)
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchAllDatas();
  }, []);

  const getUserProjects = () => {
        if (!user) return [];
        return projects.filter(
            (p) => p.ownerId === user.id || p.members?.includes(user.id)
        );
    };

    const userProjects = getUserProjects();

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
      <Grid container spacing={3} sx={{ mb: 4, gap: 1 }}>
        {/* Total Task Cards */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }} >
          <Card
            elevation={0}
            sx={{
              position: "relative",
              overflow: "visible",
              cursor: "pointer",
              border: (theme) =>
                `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`
            }}
            onClick={handleViewTasks}
          >
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 3,
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
                }}
              >
                <Typography
                  variant="body1"
                  color="text.secondary"
                  fontWeight="500"
                >
                  Total Tasks
                </Typography>
                <Typography variant="h5" sx={{ marginBottom: 0 }}>
                  {userProjects.length === 0 ? 0 : totalTask}
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
                `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`
            }}
            onClick={handleViewTasks}
          >
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 3,
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
                }}
              >
                <Typography
                  variant="body1"
                  color="text.secondary"
                  fontWeight="500"
                >
                  Total To Do Tasks
                </Typography>
                <Typography variant="h5" sx={{ marginBottom: 0 }}>
                  {userProjects.length === 0 ? 0 : totalToDoTasks}
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
                `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`
            }}
            onClick={handleViewTasks}
          >
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 3,
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
                }}
              >
                <Typography
                  variant="body1"
                  color="text.secondary"
                  fontWeight="500"
                >
                  Total Completed Tasks
                </Typography>
                <Typography variant="h5" sx={{ marginBottom: 0 }}>
                  {userProjects.length === 0 ? 0 : totalCompletedTasks}
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
                `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`
            }}
            onClick={handleViewTasks}
          >
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 3,
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: "#FFE28C",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
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
                }}
              >
                <Typography
                  variant="body1"
                  color="text.secondary"
                  fontWeight="500"
                >
                  Total Progress Tasks
                </Typography>
                <Typography variant="h5" sx={{ marginBottom: 0 }}>
                  {userProjects.length === 0 ? 0 : totalProgressTasks}
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
              p: 4,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              border: (theme) =>
                `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`,
              gap: 4,
            }}
          >
            <Box sx={{ flex: 1, maxWidth: "60%" }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Welcome to My-task, a Project Management System
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                component="p"
                sx={{ lineHeight: "24px", mb: 3 }}
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
                maxWidth: "40%",
              }}
            >
              <WelcomeIcon />
            </Box>
          </Paper>
        </Grid>

        {/* <Grid size={{ xs: 12 }}>
          <Paper elevation={0} sx={{
            p: 3, 
            border: (theme) =>
              `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`
          }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Project Timeline
            </Typography>
            <Box
              sx={{
                height: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Timeline visualization area
              </Typography>
            </Box>
          </Paper>
        </Grid> */}
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
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 3,
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
                }}
              >
                <Typography variant="h6" fontWeight="500" fontSize="16px">
                  Total Projects
                </Typography>
                <Typography sx={{ marginBottom: 0 }}>
                  {userProjects.length === 0 ? 0 : totalProjects}
                </Typography>
              </Box>
              <IconButton
                onClick={() => navigate("/project")}
                sx={{
                  borderRadius: 1,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: "rgba(0, 0, 0, 0.04)",
                    transform: "translateX(4px)",
                    "& .MuiSvgIcon-root": {
                      opacity: 0.8,
                    }
                  },
                  "&:active": {
                    transform: "scale(0.95)",
                  }
                }}
              >
                <ChevronRight sx={{ fontSize: 40, opacity: 0.5, transition: "all 0.3s" }} />
              </IconButton>
            </CardContent>
          </Card>
        </Grid>

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
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 3,
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
                }}
              >
                <Typography variant="h6" fontWeight="500" fontSize="16px">
                  Total Completed Projects
                </Typography>
                <Typography sx={{ marginBottom: 0 }}>
                  {userProjects.length === 0 ? 0 : totalCompletedProjects}
                </Typography>
              </Box>
              <IconButton
                onClick={() => navigate("/project")}
                sx={{
                  borderRadius: 1,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: "rgba(0, 0, 0, 0.04)",
                    transform: "translateX(4px)",
                    "& .MuiSvgIcon-root": {
                      opacity: 0.8,
                    }
                  },
                  "&:active": {
                    transform: "scale(0.95)",
                  }
                }}
              >
                <ChevronRight sx={{ fontSize: 40, opacity: 0.5, transition: "all 0.3s" }} />
              </IconButton>

            </CardContent>
          </Card>
        </Grid>

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
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 3,
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
                }}
              >
                <Typography variant="h6" fontWeight="500" fontSize="16px">
                  Total Progress Projects
                </Typography>
                <Typography sx={{ marginBottom: 0 }}>
                  {userProjects.length === 0 ? 0 : totalProgressProjects}
                </Typography>
              </Box>
              <IconButton
                onClick={() => navigate("/project")}
                sx={{
                  borderRadius: 1,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: "rgba(0, 0, 0, 0.04)",
                    transform: "translateX(4px)",
                    "& .MuiSvgIcon-root": {
                      opacity: 0.8,
                    }
                  },
                  "&:active": {
                    transform: "scale(0.95)",
                  }
                }}
              >
                <ChevronRight sx={{ fontSize: 40, opacity: 0.5, transition: "all 0.3s" }} />
              </IconButton>

            </CardContent>
          </Card>
        </Grid>

      </Grid>

      <DashboardProjectInformation />
    </>
  )
}

export default DashboardContent
