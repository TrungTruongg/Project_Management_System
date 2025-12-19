import {
  CalendarToday,
  Phone,
  Email,
  LocationOn,
  Edit,
  AccessTime,
  Delete,
} from "@mui/icons-material";
import {
  Avatar,
  AvatarGroup,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import UpdateMemberProfileModal from "./UpdateMemberProfileModal";
import DeleteConfirmDialog from "../DeleteConfirmDialog";

function MemberProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedMember = location.state?.member;

  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (selectedMember) {
      loadAllData();
    }
  }, [selectedMember]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [usersRes, projectsRes, tasksRes] =
        await Promise.all([
          axios.get(
            "https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=69205e8dbf3939eacf2e89f2"
          ),
          axios.get(
            "https://mindx-mockup-server.vercel.app/api/resources/projects?apiKey=69205e8dbf3939eacf2e89f2"
          ),
          axios.get(
            "https://mindx-mockup-server.vercel.app/api/resources/tasks?apiKey=69205e8dbf3939eacf2e89f2"
          ),
          axios.get(
            "https://mindx-mockup-server.vercel.app/api/resources/projectMembers?apiKey=69205e8dbf3939eacf2e89f2"
          ),
        ]);

      // Process users
      const foundUser = usersRes.data.data.data.find(
        (u: any) => u.id === selectedMember.userId
      );
      setUser(foundUser);

      // Process projects
      const allProjectsData = projectsRes.data.data.data;
      setAllProjects(allProjectsData);

      const userProjects = allProjectsData.filter((project: any) =>
        project.member?.includes(selectedMember.userId)
      );
      setProjects(userProjects);

      // Process tasks
      const userTasks = tasksRes.data.data.data.filter((task: any) => {
        if (Array.isArray(task.assignedTo)) {
          return task.assignedTo.includes(selectedMember.userId);
        }
        return task.assignedTo === selectedMember.userId;
      });
      setTasks(userTasks);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDeadline = (dateStart: string, dateEnd: string) => {
    const startDate = new Date(dateStart);
    const endDate = new Date(dateEnd);

    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const getProjectByTaskId = (taskProjectId: number) => {
    return allProjects.find((p) => p.id === taskProjectId);
  };

  const handleUpdateUser = (updatedUser: any) => {
    setUser(updatedUser);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEditMemberProfile = () => {
    setOpen(true);
  };

  const handleOpenDeleteDialog = () => {
    console.log(selectedMember);

    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteMember = async () => {
    setLoading(true);
    try {
      await axios.delete(
        `https://mindx-mockup-server.vercel.app/api/resources/users/${user._id}?apiKey=69205e8dbf3939eacf2e89f2`
      );

      await axios.delete(
        `https://mindx-mockup-server.vercel.app/api/resources/projectMembers/${selectedMember._id}?apiKey=69205e8dbf3939eacf2e89f2`
      );

      handleCloseDeleteDialog();

      navigate("/member");
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setLoading(false);
    }
  };

  // if (!user) {
  //   return (
  //     <Typography variant="h5" sx={{ mt: 4, textAlign: "center" }}>
  //       User not found
  //     </Typography>
  //   );
  // }

  return (
    <>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
        Employee Profile
      </Typography>

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
        <Grid container spacing={3}>
          <Grid sx={{ xs: 12, width: "100%" }}>
            {/* Profile Card */}
            <Card
              sx={{
                mb: 3,
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                transition: "all 0.3s",
              }}
              elevation={0}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", gap: 4 }}>
                  <Avatar
                    src={user.avatar}
                    sx={{
                      width: 120,
                      height: 120,
                      fontSize: "48px",
                      textTransform: "uppercase",
                    }}
                  >
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        sx={{ textTransform: "capitalize" }}
                        gutterBottom
                      >
                        {user?.firstName} {user?.lastName}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          size="small"
                          sx={{ color: "#4CAF50" }}
                          onClick={handleEditMemberProfile}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{ color: "#EF5350" }}
                          onClick={handleOpenDeleteDialog}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Chip
                      label={selectedMember?.role || user?.role}
                      size="small"
                      sx={{ bgcolor: "#E1BEE7", color: "#6A1B9A", mb: 2 }}
                    />

                    <Grid container spacing={2} sx={{ mt: 4 }}>
                      <Grid size={{ xs: 6 }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Phone sx={{ fontSize: 18, color: "text.secondary" }} />
                          {user?.phone ? (
                            <Typography variant="body2">
                              +84 {user?.phone}
                            </Typography>
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{
                                color: "text.secondary",
                                fontStyle: "italic",
                              }}
                            >
                              No phone number
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Email sx={{ fontSize: 18, color: "text.secondary" }} />
                          {user?.email ? (
                            <Typography variant="body2">{user?.email}</Typography>
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{
                                color: "text.secondary",
                                fontStyle: "italic",
                              }}
                            >
                              No Email Address
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CalendarToday
                            sx={{ fontSize: 18, color: "text.secondary" }}
                          />
                          {user?.joinDate ? (
                            <Typography variant="body2">
                              {new Date(user.joinDate).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                }
                              )}
                            </Typography>
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{
                                color: "text.secondary",
                                fontStyle: "italic",
                              }}
                            >
                              No Joined Date
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <LocationOn
                            sx={{ fontSize: 18, color: "text.secondary" }}
                          />
                          {user?.location ? (
                            <Typography variant="body2">
                              {user?.location}
                            </Typography>
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{
                                color: "text.secondary",
                                fontStyle: "italic",
                              }}
                            >
                              No Location
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Projects and Tasks  */}
            <Grid container spacing={3}>
              {/* Projects */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Current Work Project
                </Typography>
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <Card key={project.id} sx={{ mb: 3 }}>
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 2,
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            sx={{ textTransform: "capitalize" }}
                          >
                            {project.title}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <IconButton
                              size="small"
                              sx={{ color: "#4CAF50" }}
                            //onClick={() => handleEditProject(project)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ color: "#EF5350" }}
                            //onClick={() => handleOpenDeleteDialog(project)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <AvatarGroup
                            max={5}
                            sx={{ justifyContent: "flex-end" }}
                          >
                            {project.member?.length > 0 ? (
                              <Avatar
                                key={project.id}
                                src={user.avatar}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  fontSize: "12px",
                                  bgcolor: "#E0E0E0",
                                  color: "#484c7f",
                                  fontWeight: 600,
                                }}
                              >
                                {user?.firstName?.[0]}
                                {user?.lastName?.[0]}
                              </Avatar>
                            ) : (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "text.secondary",
                                  fontStyle: "italic",
                                }}
                              >
                                No members yet
                              </Typography>
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
                  ))
                ) : (
                  <Card
                    sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                    }}
                    elevation={0}
                  >
                    <CardContent>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                      >
                        No projects assigned
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Grid>

              {/* Right Column - Tasks */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Current Task
                </Typography>

                {tasks.length > 0 ? (
                  tasks.map((task) => {
                    const taskProject = getProjectByTaskId(task.projectId);

                    return (
                      <Card
                        key={task.id}
                        sx={{
                          mb: 2,
                          border: "1px solid #e0e0e0",
                          borderRadius: 2,
                          transition: "all 0.3s",
                          "&:hover": {
                            boxShadow: 3,
                            transform: "translateY(-4px)",
                          },
                        }}
                        elevation={0}
                      >
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 1,
                            }}
                          >
                            <Chip
                              label={task.title}
                              size="small"
                              sx={{
                                bgcolor: "#E8F5E9",
                                color: "#2E7D32",
                                fontWeight: 600,
                                fontSize: "0.75rem",
                              }}
                            />

                            <Box sx={{ display: "flex", gap: 1 }}>
                              <IconButton size="small" sx={{ color: "#4CAF50" }}>
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton size="small" sx={{ color: "#EF5350" }}>
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <AvatarGroup
                              max={5}
                              sx={{ justifyContent: "flex-end" }}
                            >
                              <Avatar
                                src={user.avatar}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  fontSize: "12px",
                                  bgcolor: "#E0E0E0",
                                  color: "#484c7f",
                                  fontWeight: 600,
                                }}
                              >
                                {user.firstName?.[0]}
                                {user.lastName?.[0]}
                              </Avatar>
                            </AvatarGroup>
                          </Box>

                          {task.description && (
                            <Box sx={{ mb: 2 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 2, minHeight: 40 }}
                              >
                                {task.description}
                              </Typography>
                            </Box>
                          )}

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <CalendarToday
                                  sx={{ fontSize: 14, color: "text.secondary" }}
                                />
                                <Typography variant="caption">
                                  {new Date(task.startDate).toLocaleDateString(
                                    "en-GB",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                    }
                                  )}
                                </Typography>
                              </Box>
                              -
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <CalendarToday
                                  sx={{ fontSize: 14, color: "text.secondary" }}
                                />
                                <Typography variant="caption">
                                  {new Date(task.endDate).toLocaleDateString(
                                    "en-GB",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                    }
                                  )}
                                </Typography>
                              </Box>
                            </Box>

                            {taskProject && (
                              <Chip
                                label={taskProject.title}
                                size="small"
                                sx={{
                                  bgcolor: "#F3E5F5",
                                  color: "#7B1FA2",
                                  fontSize: "0.85rem",
                                }}
                              />
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <Card
                    sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                    }}
                    elevation={0}
                  >
                    <CardContent>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                      >
                        No tasks assigned
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
      <UpdateMemberProfileModal
        open={open}
        onClose={handleClose}
        onUpdate={handleUpdateUser}
        selectedUser={user}
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onDelete={handleDeleteMember}
        selected={user ? user.email : ""}
        loading={loading}
      />
    </>
  );
}

export default MemberProfile;
