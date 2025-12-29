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
  IconButton,
  Typography,
} from "@mui/material";
import { GoPlusCircle as AddProjectIcon } from "react-icons/go";
import { AccessTime, Delete, Edit, Refresh as RefreshIcon } from "@mui/icons-material";
import { useEffect, useState } from "react";
import CreateProjectModal from "./CreateProjectModal";
import axios from "axios";
import DeleteConfirmDialog from "../DeleteConfirmDialog";
import { useUser } from "../context/UserContext";
import { useSearch } from "../context/SearchContext";
import { useNavigate, useLocation } from "react-router-dom";

const API_KEY = import.meta.env.VITE_API_KEY;

function Projects() {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectList, setProjectList] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { searchTerm } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useUser();

  useEffect(() => {
    if (location.state?.openCreateProjectModal) {
      setOpen(true);
    }
  }, [location.state?.openCreateProjectModal]);

  const calculateDeadline = (dateStart: string, dateEnd: string) => {
    const startDate = new Date(dateStart);
    const endDate = new Date(dateEnd);

    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(Math.abs(diffTime) / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const isProjectExpired = (dateEnd: string) => {
    const endDate = new Date(dateEnd);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    return endDate < today;
  };

  const calculateProjectCompletion = (projectId: number) => {
    const projectTasks = tasks.filter((task) => task.projectId === projectId);

    if (projectTasks.length === 0) return 0;

    const completedTasks = projectTasks.filter(
      (task: any) => task.status === "completed"
    );

    return Math.round((completedTasks.length / projectTasks.length) * 100);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [responseProject, responseUser, responseTask] = await Promise.all([
        axios.get(
          `https://mindx-mockup-server.vercel.app/api/resources/projects?apiKey=${API_KEY}`
        ),
        axios.get(
          `https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=${API_KEY}`
        ),
        axios.get(
          `https://mindx-mockup-server.vercel.app/api/resources/tasks?apiKey=${API_KEY}`
        ),
      ]);

      const allProjects = responseProject.data.data.data;

      let filteredProjects = allProjects;

      setProjectList(filteredProjects);
      setUsers(responseUser.data.data.data);
      setTasks(responseTask.data.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const getUserProjects = () => {
    if (!user) return [];
    return projectList.filter(
      (p) => p.ownerId === user.id || p.members?.includes(user.id)
    );
  };

  const userProjects = getUserProjects();

  const filteredProjects = userProjects.filter((project: any) => {
    if (!searchTerm.trim()) return true;

    return (
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleOpenModal = () => {
    setSelectedProject(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProject(null);
  };

  const handleEditProject = (project: any) => {
    setSelectedProject(project);
    setOpen(true);
  };

  const handleSaveProject = (newProject: any) => {
    setProjectList([...projectList, newProject]);
  };

  const handleUpdateProject = (updateProject: any) => {
    setProjectList(
      projectList.map((project: any) =>
        project.id === updateProject.id ? updateProject : project
      )
    );
  };

  const handleOpenDeleteDialog = (deleteProject: any) => {
    setSelectedProject(deleteProject);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedProject(null);
  };

  const handleDeleteProject = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(
        `https://mindx-mockup-server.vercel.app/api/resources/projects/${selectedProject._id}?apiKey=${API_KEY}`
      );

      setProjectList(
        projectList.filter((project: any) => project.id !== selectedProject.id)
      );

      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewTasksInProject = (projectId: any) => {
    navigate(`/task?projectId=${projectId}`)
  }

  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Typography variant="h4" fontWeight="700">
            Projects
          </Typography>
          <IconButton
            onClick={fetchAllData}
            disabled={loading}
            sx={{ color: "text.secondary" }}
            title="Refresh projects"
          >
            <RefreshIcon />
          </IconButton>
        </Box>


        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddProjectIcon />}
            onClick={handleOpenModal}
            sx={{
              backgroundColor: "#484c7f",
              color: "white",
              textTransform: "none",
              px: 3,
            }}
          >
            Create Project
          </Button>
        </Box>
      </Box>

      {/* Projects Grid */}
      {loading ? (
        <Box
          sx={{
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
      ) : userProjects.length === 0 ? (
        <Typography fontStyle="italic">
          You are not part of any projects yet. Start create your first project!
        </Typography>
      ) : filteredProjects.length === 0 ? (
        <Typography fontStyle="italic" >No project available!</Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 3,
          }}
        >
          {filteredProjects.map((project: any) => {
            const projectMembers = users.filter((user) => project.members.includes(user.id));
            const completion = calculateProjectCompletion(project.id);
            const projectOwner = users.find((user) => user.id === project.ownerId);
            const isOwner = project.ownerId === user?.id;

            return (
              <Card
                key={project.id}
                elevation={0}
                onClick={() => handleViewTasksInProject(project.id)}
                sx={{
                  border: (theme) =>
                    `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`,
                  borderRadius: 2,
                  transition: "all 0.3s",
                  cursor: "pointer"
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ textTransform: "capitalize" }}
                      >
                        {project.title}
                      </Typography>
                    </Box>
                    {isOwner && (
                      <Box sx={{ display: "flex", gap: 1 }} onClick={(e) => e.stopPropagation()}>
                        <IconButton
                          size="small"
                          sx={{ color: "#4CAF50" }}
                          onClick={() => handleEditProject(project)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{ color: "#EF5350" }}
                          onClick={() => handleOpenDeleteDialog(project)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>

                  {/* Members */}
                  <Box sx={{ mb: 2 }}>
                    <AvatarGroup max={5} sx={{ justifyContent: "flex-end" }}>
                      {projectOwner && (
                        <Avatar
                          src={projectOwner.avatar}
                          key={`leader-${projectOwner.id}`}
                          sx={{
                            width: 32,
                            height: 32,
                            fontSize: "12px",
                            bgcolor: "#FF9800",
                            color: "white",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            border: "2px solid #FFA726",
                          }}
                          title={`Leader: ${projectOwner.firstName} ${projectOwner.lastName}`}
                        >
                          {projectOwner.firstName?.[0]}
                          {projectOwner.lastName?.[0]}
                        </Avatar>
                      )}

                      {projectMembers.length > 0 && (
                        projectMembers.map((member) => (
                          <Avatar
                            key={member.id}
                            src={member.avatar}
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: "12px",
                              bgcolor: "#E0E0E0",
                              color: "#484c7f",
                              fontWeight: 600,
                              textTransform: "uppercase",
                            }}
                            title={`${member.firstName} ${member.lastName}`}
                          >
                            {member.firstName?.[0]}
                            {member.lastName?.[0]}
                          </Avatar>
                        ))
                      )}
                    </AvatarGroup>
                  </Box>

                  {/* Stats */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                      flexWrap: "wrap",
                      gap: 2,
                      pt: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "text.secondary",
                        }}
                      >
                        Start Date:
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <AccessTime
                          sx={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "text.secondary",
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "text.secondary",
                          }}
                        >
                          {project.startDate}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "text.secondary",
                        }}
                      >
                        End Date:
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <AccessTime
                          sx={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "text.secondary",
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "text.secondary",
                          }}
                        >
                          {project.endDate}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  {/* Progress */}
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="caption" fontWeight="600">
                        Progress
                      </Typography>
                      <Chip
                        label={
                          isProjectExpired(project.endDate)
                            ? "Expired"
                            : `${calculateDeadline(
                              project.startDate,
                              project.endDate
                            )} Days Left`
                        }
                        size="small"
                        sx={{
                          bgcolor: isProjectExpired(project.endDate)
                            ? "#FFCDD2"
                            : "#FFEBEE",
                          color: isProjectExpired(project.endDate)
                            ? "#B71C1C"
                            : "#C62828",
                          height: 20,
                          fontSize: "0.7rem",
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      {[1, 2, 3, 4].map((i) => (
                        <Box
                          key={i}
                          sx={{
                            flex: 1,
                            height: 8,
                            bgcolor:
                              i <= Math.floor(completion / 25)
                                ? "#FF9800"
                                : "#E0E0E0",
                            borderRadius: 1,
                          }}
                        />
                      ))}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        mt: 0.5,
                        display: "block",
                      }}
                    >
                      {completion}% Complete
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      <CreateProjectModal
        open={open}
        onClose={handleClose}
        onSave={handleSaveProject}
        onUpdate={handleUpdateProject}
        onDelete={handleDeleteProject}
        projectList={projectList}
        selectedProject={selectedProject}
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onDelete={handleDeleteProject}
        selected={selectedProject ? selectedProject.title : ""}
        loading={deleteLoading}
      />
    </>
  );
}

export default Projects;
