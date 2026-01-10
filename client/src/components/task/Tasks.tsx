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
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { GoPlusCircle as AddTaskIcon } from "react-icons/go";
import { CalendarToday, Delete, Edit, CheckCircle as CheckStatusIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { useEffect, useState } from "react";
import CreateTaskModal from "./CreateTaskModal";
import DeleteConfirmDialog from "../DeleteConfirmDialog";
import { useUser } from "../context/UserContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSearch } from "../context/SearchContext";
import api from "../api/axiosConfig";

function Tasks() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('id');

  const [openCreateTaskModal, setOpenCreateTaskModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskList, setTaskList] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();
  const { searchTerm } = useSearch();

  const calculateDeadline = (dateStart: string, dateEnd: string) => {
    const startDate = new Date(dateStart);
    const endDate = new Date(dateEnd);

    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const isTaskExpired = (dateEnd: string) => {
    const endDate = new Date(dateEnd);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    return endDate < today;
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [responseTask, responseProject, responseUser] = await Promise.all([
        api.get("/tasks"),
        api.get("/projects"),
        api.get("/users"),
      ]);

      const allTasks = responseTask.data;
      const allProjects = responseProject.data;

      setProjects(allProjects);
      setUsers(responseUser.data);

      let filteredTasks = allTasks;

      // Filter tasks based on user's project access
      if (user) {
        const userProjectIds = allProjects
          .filter((p: any) => p.leaderId === user._id || p.members?.includes(user._id))
          .map((p: any) => p._id);

        filteredTasks = allTasks.filter((task: any) =>
          userProjectIds.includes(task.projectId)
        );
      }

      setTaskList(filteredTasks);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = taskList.filter((task: any) => {
    if (projectId && task.projectId !== projectId) {
      return false;
    }

    if (!searchTerm.trim()) return true;

    return (
      task.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const currentProject = projectId
    ? projects.find(p => p._id === projectId)
    : null;

  useEffect(() => {
    fetchAllData();
  }, []);

  const getUserProjects = () => {
    if (!user) return [];
    return projects.filter(
      (p) => p.leaderId === user._id || p.members?.includes(user._id)
    );
  };

  const userProjects = getUserProjects();

  const tasksByStatus = () => {
    return {
      toDo: filteredTasks.filter((t) => t.completion === 0),
      inProgress: filteredTasks.filter((t) => t.completion > 0 && t.completion < 100),
      completed: filteredTasks.filter((t) => t.completion === 100),
    };
  };

  const getPriorityChip = (priority: "high" | "medium" | "low") => {
    const config = {
      high: { label: "HIGH", bgcolor: "#FFEBEE", color: "#C62828" },
      medium: { label: "MEDIUM", bgcolor: "#FFF9C4", color: "#F57F17" },
      low: { label: "LOW", bgcolor: "#C8E6C9", color: "#388E3C" },
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
  };

  const updateProjectCompletion = async (projectId: number) => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/projects"),
      ]);

      const allTasks = tasksRes.data;
      const allProjects = projectsRes.data;

      // Find project to update
      const projectToUpdate = allProjects.find((p: any) => p._id === projectId);
      if (!projectToUpdate) return;

      // Count new completion
      const projectTasks = allTasks.filter((t: any) => t.projectId === projectId);
      const completedTasks = projectTasks.filter(
        (t: any) => t.status === "completed"
      );

      const newCompletion =
        projectTasks.length > 0
          ? Math.round((completedTasks.length / projectTasks.length) * 100)
          : 0;

      // Update project with new completion
      const updatedProject = {
        ...projectToUpdate,
        completion: newCompletion,
      };

      await api.put(
        `/projects/update/${projectToUpdate._id}`,
        updatedProject
      );

      setProjects(prev =>
        prev.map(p => p._id === projectId ? updatedProject : p)
      );
    } catch (error) {
      console.error("Error updating project completion:", error);
    }
  };

  // New task
  const handleSaveTask = async (newTask: any) => {
    setTaskList([...taskList, newTask]);

    // Update completion of project
    if (newTask.projectId) {
      await updateProjectCompletion(newTask.projectId);
    }
  };

  // Update Task
  const handleUpdateTask = async (updatedTask: any) => {
    const oldTask = taskList.find(t => t._id === updatedTask._id);

    const taskToUpdate = {
      ...updatedTask,
      _id: updatedTask._id || oldTask?._id
    };

    setTaskList(
      taskList.map((task: any) =>
        task._id === taskToUpdate._id ? taskToUpdate : task
      )
    );

    // Update completion if status or projectId changed
    if (taskToUpdate.projectId) {
      await updateProjectCompletion(taskToUpdate.projectId);
    }

    // if task changed project, update old project's completion too
    if (oldTask?.projectId && oldTask.projectId !== taskToUpdate.projectId) {
      await updateProjectCompletion(oldTask.projectId);
    }
  };

  // Delete Task
  const handleDeleteTask = async () => {
    setDeleteLoading(true);

    if (!selectedTask) return;

    try {
      const projectId = selectedTask.projectId;
      await api.delete(`/tasks/delete/${selectedTask._id}`);

      // Delete attachments related to the task
      const attachmentsRes = await api.get("/attachments");

      const taskAttachments = attachmentsRes.data.filter(
        (att: any) => att.taskId === selectedTask._id
      );

      // Delete every attachment
      for (const attachment of taskAttachments) {
        await api.delete(`/attachments/${attachment._id}`);
      }

      setTaskList(taskList.filter((task: any) => task._id !== selectedTask._id));

      // Update completion from project
      if (projectId) {
        await updateProjectCompletion(projectId);
      }
      handleCloseDeleteDialog();

    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenDeleteDialog = (task: any) => {
    setSelectedTask(task);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedTask(null);
  };

  const handleViewTask = (taskId: any) => {
    navigate(`/task-detail?id=${taskId}`)
  }

  const handleOpenProjectModal = () => {
    navigate("/project", { state: { openCreateProjectModal: true } });
  };

  const renderTaskCard = (task: any) => {
    const priorityConfig = getPriorityChip(task.priority);
    const project = projects.find((p) => p._id === task.projectId);
    const isProjectLeader = project?.leaderId === user?._id;
    const isTaskAssignedToMe = Array.isArray(task.assignedTo)
      ? task.assignedTo.includes(user?._id)
      : task.assignedTo === user?._id;

    const assignedUserIds = Array.isArray(task.assignedTo)
      ? task.assignedTo
      : task.assignedTo
        ? [task.assignedTo]
        : [];

    const assignedUsers = assignedUserIds
      .map((userId: number) => users.find((u) => u._id === userId))
      .filter(Boolean);

    const calculateDays = calculateDeadline(task.startDate, task.endDate)

    const handleStatusUpdate = () => {
      setSelectedTask(task);
      setOpenCreateTaskModal(true);
    };

    return (
      <Card
        key={task._id}
        sx={{
          mb: 2,
          cursor: "pointer",
          boxShadow: 1,
          border: (theme) =>
            `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`
        }}
        onClick={() => handleViewTask(task._id)}
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
              label={task.name}
              size="medium"
              sx={{
                bgcolor: "#E8F5E9",
                color: "#2E7D32",
                fontWeight: 600,
                fontSize: "15px",
              }}
            />
            <Box sx={{ display: "flex", gap: 1 }} onClick={(e) => e.stopPropagation()}>
              {isProjectLeader ? (
                <>
                  <IconButton
                    size="small"
                    sx={{ color: "#4CAF50" }}
                    onClick={() => handleEditTask(task)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{ color: "#EF5350" }}
                    onClick={() => handleOpenDeleteDialog(task)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </>
              ) : isTaskAssignedToMe ? (
                <IconButton
                  size="small"
                  sx={{ color: "#4CAF50" }}
                  onClick={handleStatusUpdate}
                  title="Change status"
                >
                  <CheckStatusIcon fontSize="small" />
                </IconButton>
              ) : null}
            </Box>
          </Box>

          <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Chip
              label={priorityConfig.label}
              size="small"
              sx={{
                ...priorityConfig,
                fontSize: "0.65rem",
                height: 20,

              }}
            />

            <AvatarGroup max={5}>
              {project?.leaderId && (
                <Avatar
                  key={`leader-${project.leaderId}`}
                  src={users.find((u) => u._id === project.leaderId)?.avatar}
                  sx={{
                    width: 24,
                    height: 24,
                    fontSize: "10px",
                    bgcolor: "#FF9800",
                    color: "white",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    border: "2px solid #FFA726",
                  }}
                  title={`Leader: ${users.find((u) => u._id === project.leaderId)?.firstName} ${users.find((u) => u._id === project.leaderId)?.lastName}`}
                >
                  {users.find((u) => u._id === project.leaderId)?.firstName?.[0]}
                  {users.find((u) => u._id === project.leaderId)?.lastName?.[0]}
                </Avatar>
              )}
              {assignedUsers.length > 0 && (
                assignedUsers.map((user: any) => (
                  <Avatar
                    key={user._id}
                    src={user.avatar}
                    sx={{
                      width: 20,
                      height: 20,
                      fontSize: "10px",
                      bgcolor: "#E0E0E0",
                      textTransform: "uppercase"
                    }}
                    title={`Members: ${user.firstName} ${user.lastName}`}
                  >
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </Avatar>
                ))
              )}
            </AvatarGroup>
          </Box>

          <Box sx={{ mb: 2 }}>
            {task.description ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, minHeight: 40 }}
              >
                {task.description}
              </Typography>

            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ color: "text.secondary", fontStyle: "italic", mb: 2, minHeight: 40 }}
              >
                No Description
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2
            }}
          >
            {calculateDays <= 0 ? (
              <Typography variant="caption" color="red">
                Expired
              </Typography>
            ) :
              task.startDate ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <CalendarToday sx={{ fontSize: 14, color: "text.secondary" }} />
                    <Typography variant="caption">
                      {new Date(task.startDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </Typography>
                  </Box>
                  -
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <CalendarToday sx={{ fontSize: 14, color: "text.secondary" }} />
                    <Typography variant="caption">
                      {new Date(task.endDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontStyle: "italic" }}
                >
                  No Dates provided
                </Typography>
              )}

            {project && (
              <Chip
                label={project.name}
                size="small"
                sx={{
                  bgcolor: "#F3E5F5",
                  color: "#7B1FA2",
                  fontSize: "0.85rem",
                  textTransform: "capitalize"
                }}
              />
            )}
          </Box>

          <Divider sx={{ mb: 2 }} />

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
                  isTaskExpired(task.endDate)
                    ? "Expired"
                    : `${calculateDeadline(
                      task.startDate,
                      task.endDate
                    )} Days Left`
                }
                size="small"
                sx={{
                  bgcolor: isTaskExpired(task.endDate)
                    ? "#FFCDD2"
                    : "#FFEBEE",
                  color: isTaskExpired(task.endDate)
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
                      i <= Math.floor(task.completion / 25)
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
              {task.completion}% Complete
            </Typography>
          </Box>
        </CardContent>
      </Card >
    );
  };

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3, width: "100%" }}>
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
            {currentProject ? (
              <Typography fontSize="1.5rem" fontWeight="600">
                <>
                  Tasks in
                  <Box component="span" sx={{ color: "#C62828", px: 1, borderRadius: 1, textTransform: "capitalize" }}>
                    {currentProject.name}
                  </Box>
                </>

              </Typography>
            ) : (
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography fontSize="1.5rem" fontWeight="700">
                  Tasks Management
                </Typography>
              </Box>
            )}

            <Chip
              label={filteredTasks.length}
              size="small"
              sx={{
                fontSize: "14px",
                fontWeight: 500,
              }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <IconButton
              onClick={fetchAllData}
              disabled={loading}
              sx={{ color: "text.secondary" }}
              title="Refresh members"
            >
              <RefreshIcon />
            </IconButton>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddTaskIcon />}
              onClick={handleOpenModal}
              disabled={userProjects.length === 0}
              sx={{
                backgroundColor: "#484c7f",
                color: "white",
                textTransform: "none",
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
            You are not part of any projects to create task.
            Start {""}
            <Typography fontStyle="normal" component="a"
              sx={{ color: "#0052cc", textDecoration: "underline", cursor: "pointer" }}
              onClick={handleOpenProjectModal}>create new project
            </Typography>
          </Typography>
        ) : taskList.length === 0 ? (
          <Typography fontStyle="italic">No tasks available!</Typography>
        ) : (
          <Grid container spacing={3} sx={{ width: "100%" }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                To do ({tasksByStatus().toDo.length})
              </Typography>
              {tasksByStatus().toDo.map(renderTaskCard)}
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                In Progress ({tasksByStatus().inProgress.length})
              </Typography>
              {tasksByStatus().inProgress.map(renderTaskCard)}
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Completed ({tasksByStatus().completed.length})
              </Typography>
              {tasksByStatus().completed.map(renderTaskCard)}
            </Grid>
          </Grid>
        )}
      </Grid>

      <CreateTaskModal
        open={openCreateTaskModal}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        taskList={taskList}
        selectedTask={selectedTask}
        currentProject={currentProject}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onDelete={handleDeleteTask}
        selected={selectedTask ? selectedTask.name : ""}
        loading={deleteLoading}
      />
    </>
  );
}

export default Tasks;
