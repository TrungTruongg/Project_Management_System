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
import { CalendarToday, Delete, Edit } from "@mui/icons-material";
import { useEffect, useState } from "react";
import CreateTaskModal from "./CreateTaskModal";
import axios from "axios";
import DeleteConfirmDialog from "../DeleteConfirmDialog";
import { useUser } from "../context/UserContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSearch } from "../context/SearchContext";

const API_KEY = import.meta.env.VITE_API_KEY;

function Tasks() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

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

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [responseTask, responseProject, responseUser] = await Promise.all([
        axios.get(
          `https://mindx-mockup-server.vercel.app/api/resources/tasks?apiKey=${API_KEY}`
        ),
        axios.get(
          `https://mindx-mockup-server.vercel.app/api/resources/projects?apiKey=${API_KEY}`
        ),
        axios.get(
          `https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=${API_KEY}`
        ),
      ]);

      const allTasks = responseTask.data.data.data;
      const allProjects = responseProject.data.data.data;

      setProjects(allProjects);
      setUsers(responseUser.data.data.data);

      let filteredTasks = allTasks;

      if (user) {
        if (user.role === "member") {

          const userProjectIds = allProjects
            .filter((p: any) => p.member?.includes(user.id))
            .map((p: any) => p.id);

          filteredTasks = allTasks.filter((task: any) =>
            userProjectIds.includes(task.projectId)
          );
        }
      }

      setTaskList(filteredTasks);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = taskList.filter((task: any) => {
    if (projectId && task.projectId !== parseInt(projectId)) {
      return false;
    }

    if (!searchTerm.trim()) return true;

    return (
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const currentProject = projectId
    ? projects.find(p => p.id === parseInt(projectId))
    : null;


  useEffect(() => {
    fetchAllData();
  }, []);

  const tasksByStatus = () => {
    return {
      toDo: filteredTasks.filter((t) => t.status === "to-do"),
      inProgress: filteredTasks.filter((t) => t.status === "in-progress"),
      completed: filteredTasks.filter((t) => t.status === "completed"),
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

  const calculateTaskCompletion = (taskId: number) => {
    const task = taskList.filter((task) => task.projectId === taskId);

    if (task.length === 0) return 0;

    const completedTasks = task.filter(
      (task: any) => task.status === "completed"
    );

    return Math.round((completedTasks.length / task.length) * 100);
  };

  const updateProjectCompletion = async (projectId: number) => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        axios.get(
          `https://mindx-mockup-server.vercel.app/api/resources/tasks?apiKey=${API_KEY}`
        ),
        axios.get(
          `https://mindx-mockup-server.vercel.app/api/resources/projects?apiKey=${API_KEY}`
        ),
      ]);

      const allTasks = tasksRes.data.data.data;
      const allProjects = projectsRes.data.data.data;

      // Tìm project cần update
      const projectToUpdate = allProjects.find((p: any) => p.id === projectId);
      if (!projectToUpdate) return;

      // Tính completion mới
      const projectTasks = allTasks.filter((t: any) => t.projectId === projectId);
      const completedTasks = projectTasks.filter(
        (t: any) => t.status === "completed"
      );

      const newCompletion =
        projectTasks.length > 0
          ? Math.round((completedTasks.length / projectTasks.length) * 100)
          : 0;

      // Update project với completion mới
      const updatedProject = {
        ...projectToUpdate,
        completion: newCompletion,
      };

      await axios.put(
        `https://mindx-mockup-server.vercel.app/api/resources/projects/${projectToUpdate._id}?apiKey=${API_KEY}`,
        updatedProject
      );

      setProjects(prev =>
        prev.map(p => p.id === projectId ? updatedProject : p)
      );
    } catch (error) {
      console.error("Error updating project completion:", error);
    }
  };

  // New task
  const handleSaveTask = async (newTask: any) => {
    setTaskList([...taskList, newTask]);

    // Update completion của project
    if (newTask.projectId) {
      await updateProjectCompletion(newTask.projectId);
    }
  };

  // Khi update task (bao gồm thay đổi status)
  const handleUpdateTask = async (updatedTask: any) => {
    const oldTask = taskList.find(t => t.id === updatedTask.id);

    setTaskList(
      taskList.map((task: any) =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );

    // Update completion nếu status thay đổi HOẶC projectId thay đổi
    if (updatedTask.projectId) {
      await updateProjectCompletion(updatedTask.projectId);
    }

    // Nếu task được chuyển sang project khác, cập nhật cả project cũ
    if (oldTask?.projectId && oldTask.projectId !== updatedTask.projectId) {
      await updateProjectCompletion(oldTask.projectId);
    }
  };

  // Delete Task
  const handleDeleteTask = async () => {
    setDeleteLoading(true);

    if (!selectedTask) return;

    try {
      const projectId = selectedTask.projectId;
      console.log(selectedTask._id)
      await axios.delete(
        `https://mindx-mockup-server.vercel.app/api/resources/tasks/${selectedTask._id}?apiKey=${API_KEY}`
      );

      // XÓA TẤT CẢ ATTACHMENTS CỦA TASK NÀY
      const attachmentsRes = await axios.get(
        `https://mindx-mockup-server.vercel.app/api/resources/attachments?apiKey=${API_KEY}`
      );

      const taskAttachments = attachmentsRes.data.data.data.filter(
        (att: any) => att.taskId === selectedTask.id
      );

      // Xóa từng attachment
      for (const attachment of taskAttachments) {
        await axios.delete(
          `https://mindx-mockup-server.vercel.app/api/resources/attachments/${attachment._id}?apiKey=${API_KEY}`
        );
      }

      setTaskList(taskList.filter((task: any) => task.id !== selectedTask.id));

      // Update completion của project
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

  const renderTaskCard = (task: any) => {
    const priorityConfig = getPriorityChip(task.priority);
    const project = projects.find((p) => p.id === task.projectId);

    const assignedUserIds = Array.isArray(task.assignedTo)
      ? task.assignedTo
      : task.assignedTo
        ? [task.assignedTo]
        : [];

    const assignedUsers = assignedUserIds
      .map((userId: number) => users.find((u) => u.id === userId))
      .filter(Boolean);

    const calculateDays = calculateDeadline(task.startDate, task.endDate)
    const completion = calculateTaskCompletion(project.id);

    return (
      <Card
        key={task.id}
        sx={{
          mb: 2,
          cursor: "pointer",
          boxShadow: 1,
          border: (theme) =>
            `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`
        }}
        onClick={() => handleViewTask(task.id)}
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
              size="medium"
              sx={{
                bgcolor: "#E8F5E9",
                color: "#2E7D32",
                fontWeight: 600,
                fontSize: "15px",
                textTransform: "capitalize"
              }}
            />
            <Box sx={{ display: "flex", gap: 1 }} onClick={(e) => e.stopPropagation()}>
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
              {assignedUsers.length > 0 ? (
                assignedUsers.map((user: any) => (
                  <Avatar
                    key={user.id}
                    src={user.avatar}
                    sx={{
                      width: 20,
                      height: 20,
                      fontSize: "10px",
                      bgcolor: "#E0E0E0",
                      textTransform: "uppercase"
                    }}
                  >
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </Avatar>
                ))
              ) : (
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontStyle: "italic" }}
                >
                  No assigned members
                </Typography>
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
                label={project.title}
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
                label={`${calculateDeadline(
                  task.startDate,
                  task.endDate
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
          {currentProject ? (
            <Typography variant="h5" fontWeight="600">
              <>
                Tasks in
                <Box component="span" sx={{ color: "#C62828", px: 1, borderRadius: 1, textTransform: "capitalize" }}>
                  {currentProject.title}
                </Box>
              </>

            </Typography>
          ) : (
            <Typography variant="h4" fontWeight="600">
              Tasks Management
            </Typography>
          )}

          <Button
            variant="contained"
            size="large"
            startIcon={<AddTaskIcon />}
            onClick={handleOpenModal}
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
        selected={selectedTask ? selectedTask.title : ""}
        loading={deleteLoading}
      />
    </>
  );
}

export default Tasks;
