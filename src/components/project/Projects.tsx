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
import { AccessTime, Delete, Edit } from "@mui/icons-material";
import { useEffect, useState } from "react";
import CreateProjectModal from "./CreateProjectModal";
import axios from "axios";
import DeleteConfirmDialog from "../DeleteConfirmDialog";
import { useUser } from "../context/UserContext";
import { useSearch } from "../context/SearchContext";

function Projects() {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectList, setProjectList] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { searchTerm } = useSearch();

  const { user } = useUser();

  const calculateDeadline = (dateStart: string, dateEnd: string) => {
    const startDate = new Date(dateStart);
    const endDate = new Date(dateEnd);

    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(Math.abs(diffTime) / (1000 * 60 * 60 * 24));

    return diffDays;
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
          "https://mindx-mockup-server.vercel.app/api/resources/projects?apiKey=69205e8dbf3939eacf2e89f2"
        ),
        axios.get(
          "https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=69205e8dbf3939eacf2e89f2"
        ),
        axios.get(
          "https://mindx-mockup-server.vercel.app/api/resources/tasks?apiKey=69205e8dbf3939eacf2e89f2"
        ),
      ]);

      const allProjects = responseProject.data.data.data;

      let filteredProjects = allProjects;

      if (user) {
        if (user.role === "member") {
          filteredProjects = allProjects.filter(
            (project: any) =>
              project.member?.includes(user.id) || project.leaderId === user.id
          );
        }
      }

      setProjectList(filteredProjects);
      setUsers(responseUser.data.data.data);
      setTasks(responseTask.data.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projectList.filter((project: any) => {
    if (!searchTerm.trim()) return true;

    return (
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

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
    try {
      await axios.delete(
        `https://mindx-mockup-server.vercel.app/api/resources/projects/${selectedProject._id}?apiKey=69205e8dbf3939eacf2e89f2`
      );

      setProjectList(
        projectList.filter((project: any) => project.id !== selectedProject.id)
      );

      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProjectMembers = (project: any) => {
    if (!project.member || !Array.isArray(project.member)) {
      return [];
    }

    return users.filter((user) => project.member.includes(user.id));
  };

  const getProjectLeader = (project: any) => {
    return users.find((user) => user.id === project.leaderId);
  };

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
        <Typography variant="h4" fontWeight="700">
          Projects
        </Typography>

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
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 3,
          }}
        >
          {filteredProjects.map((project: any) => {
            const projectMembers = getProjectMembers(project);
            const projectLeader = getProjectLeader(project);
            const completion = calculateProjectCompletion(project.id);

            return (
              <Card
                key={project.id}
                elevation={0}
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  transition: "all 0.3s",
                  "&:hover": {
                    boxShadow: 3,
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Header with Icon and Actions */}
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
                    <Box sx={{ display: "flex", gap: 1 }}>
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
                  </Box>

                  {/* Members */}
                  <Box sx={{ mb: 2 }}>
                    <AvatarGroup max={5} sx={{ justifyContent: "flex-end" }}>
                      {projectLeader && (
                        <Avatar
                          key={`leader-${projectLeader.id}`}
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
                          title={`Leader: ${projectLeader.firstName} ${projectLeader.lastName}`}
                        >
                          {projectLeader.firstName?.[0]}
                          {projectLeader.lastName?.[0]}
                        </Avatar>
                      )}

                      {projectMembers.length > 0 ? (
                        projectMembers.map((member) => (
                          <Avatar
                            key={member.id}
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
                      ) : !projectLeader ? (
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontStyle: "italic",
                          }}
                        >
                          No members yet
                        </Typography>
                      ) : null}
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
                        label={`${calculateDeadline(
                          project.startDate,
                          project.endDate
                        )} Days Left`}
                        size="small"
                        sx={{
                          bgcolor: "#FFEBEE",
                          color: "#C62828",
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
        loading={loading}
      />
    </>
  );
}

export default Projects;
