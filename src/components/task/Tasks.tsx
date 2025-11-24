import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
} from "@mui/material";
import { GoPlusCircle as AddTaskIcon } from "react-icons/go";
import Header from "../Header";
import { projects, tasks, users } from "../../constants/constants";
import { CalendarToday } from "@mui/icons-material";
import { useEffect, useState } from "react";
import CreateTaskModal from "./CreateTaskModal";
import axios from "axios";

function Tasks() {
  const [openCreateTaskModal, setOpenCreateTaskModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskList, setTaskList] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
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
        "https://mindx-mockup-server.vercel.app/api/resources/tasks?apiKey=69205e8dbf3939eacf2e89f2"
      );
      setTaskList(response.data.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const tasksByStatus = () => {
    return {
      inProgress: tasks.filter((t) => t.status === "in-progress"),
      completed: tasks.filter((t) => t.status === "completed"),
    };
  };

  const getPriorityChip = (priority: "high" | "medium" | "low") => {
    const config = {
      high: { label: "MEDIUM", bgcolor: "#FFF3E0", color: "#F57C00" },
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

  const handleSaveTask = (newTask: any) => {
    setTaskList([...taskList, newTask]);
  };

  const handleUpdateTask = (updateTask: any) => {
    setTaskList(
      taskList.map((task: any) =>
        task.id === updateTask.id ? updateTask : task
      )
    );
  };

  const handleDeleteTask = async () => { 
    try {
      await axios.delete(
        `https://mindx-mockup-server.vercel.app/api/resources/tasks/${selectedTask._id}?apiKey=69205e8dbf3939eacf2e89f2`
      );

      setTaskList(
        taskList.filter((task: any) => task.id !== selectedTask.id)
      );

      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenDeleteDialog = (deleteTask: any) => {
    setSelectedTask(deleteTask);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedTask(null);
  };


  const renderTaskCard = (task: any) => {
    const user = users.find((u) => u.id === task.assignedTo);
    const priorityConfig = getPriorityChip(task.priority);
    const project = projects.find((p) => p.id === task.projectId);
    return (
      <Card
        key={task.id}
        sx={{
          mb: 2,
          boxShadow: 1,
          "&:hover": { boxShadow: 3 },
          transition: "all 0.3s",
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
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
            {user && (
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: "14px",
                  bgcolor: "#FFB74D",
                }}
              >
                {user.avatar}
              </Avatar>
            )}
          </Box>

          <Chip
            label={priorityConfig.label}
            size="small"
            sx={{
              ...priorityConfig,
              fontSize: "0.65rem",
              height: 20,
              mb: 1,
            }}
          />

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, minHeight: 40 }}
          >
            {task.description}
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CalendarToday sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography variant="caption">
                {new Date(task.endDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                })}
              </Typography>
            </Box>

            <Chip
              label={project?.title}
              size="small"
              sx={{
                bgcolor: "#F3E5F5",
                color: "#7B1FA2",
                fontSize: "0.65rem",
                height: 22,
              }}
            />
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Box
        sx={{ p: 4, order: 3, flex: "1 1", overflowY: "auto", height: "100vh" }}
      >
        <Header />

        {/* Top Grid */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
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
              Tasks Management
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
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
          </Box>

          {/* Tasks Grid */}
          <Grid container spacing={3} sx={{ width: "100%" }}>
            {/* In Progress */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                In Progress
              </Typography>
              {tasksByStatus().inProgress.map(renderTaskCard)}
            </Grid>

            {/* Completed */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Completed
              </Typography>
              {tasksByStatus().completed.map(renderTaskCard)}
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <CreateTaskModal
        open={openCreateTaskModal}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        taskList={taskList}
        selectedTask={selectedTask}
      />
    </>
  );
}

export default Tasks;
