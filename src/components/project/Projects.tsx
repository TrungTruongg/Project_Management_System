import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import { GoPlusCircle as AddProjectIcon } from "react-icons/go";
import Header from "../Header";
import { users } from "../../constants/constants";
import { AccessTime, Delete, Edit } from "@mui/icons-material";
import { useEffect, useState } from "react";
import CreateProjectModal from "./CreateProjectModal";
import axios from "axios";
import DeleteConfirmDialog from "../DeleteConfirmDialog";

function Projects() {
  const filterTabs = ["All", "Started", "Approval", "Completed"];

  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectList, setProjectList] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculateDeadline = (dateStart: string, dateEnd: string) => {
    const startDate = new Date(dateStart);
    const endDate = new Date(dateEnd);

    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        "https://mindx-mockup-server.vercel.app/api/resources/projects?apiKey=69205e8dbf3939eacf2e89f2"
      );
      setProjectList(response.data.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

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

  return (
    <>
      <Box
        sx={{ p: 4, order: 3, flex: "1 1", overflowY: "auto", height: "100vh" }}
      >
        <Header />

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
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
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

            <Box sx={{ display: "flex" }}>
              {filterTabs.map((tab, index) => (
                <Button
                  key={index}
                  variant={index === 0 ? "contained" : "outlined"}
                  size="large"
                  sx={{
                    textTransform: "none",
                    px: 3,
                    borderRadius: 0,
                    backgroundColor: index === 0 ? "#484c7f" : "white",
                    color: index === 0 ? "white" : "#484c7f",
                    borderColor: "#484c7f",
                  }}
                >
                  {tab}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Projects Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 3,
          }}
        >
          {projectList.map((project: any) => (
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
                    <Typography variant="h6" fontWeight="bold">
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
                    {users.map((member) => (
                      <Avatar
                        key={member.id}
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: "16px",
                          bgcolor: "#E0E0E0",
                        }}
                      >
                        {member.avatar}
                      </Avatar>
                    ))}
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
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
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
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
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
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
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
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
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
                            i <= Math.floor(project.completion / 25)
                              ? "#FF9800"
                              : "#E0E0E0",
                          borderRadius: 1,
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
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
