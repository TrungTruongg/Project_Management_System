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
import Header from "./Header";
import { projects, users } from "../constants/constants";
import {
  AccessTime,
  AttachFile,
  Delete,
  Edit,
  Group,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import CreateProjectModal from "./CreateProjectModal";
import axios from "axios";

function Projects() {
  const filterTabs = ["All", "Started", "Approval", "Completed"];

  const [open, setOpen] = useState(false);
  const [projectList, setProjectList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const calculateDeadline = (dateStart: string, dateEnd: string) => {
    const startDate = new Date(dateStart);
    const endDate = new Date(dateEnd);

    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        "https://mindx-mockup-server.vercel.app/api/resources/projects?apiKey=69205e8dbf3939eacf2e89f2"
      );
      console.log(response.data.data.data);
      setProjectList(response.data.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSaveProject = (newProject: any) => {
    setProjectList([...projectList, newProject]);
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
              onClick={() => setOpen(true)}
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
                    <IconButton size="small" sx={{ color: "#4CAF50" }}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" sx={{ color: "#EF5350" }}>
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <AttachFile
                      sx={{ fontSize: 16, color: "text.secondary" }}
                    />
                    <Typography color="text.secondary">0 Attach</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <AccessTime
                      sx={{ fontSize: 16, color: "text.secondary" }}
                    />
                    <Typography color="text.secondary">
                      {project.startDate}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Group sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography color="text.secondary">2 Members</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Group sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography color="text.secondary">2 Members</Typography>
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
        onClose={() => setOpen(false)}
        onSave={handleSaveProject}
        projectList={projectList}
      />
    </>
  );
}

export default Projects;
