import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
} from "@mui/material";

import Header from "./Header";
import { projects, tasks, users } from "../constants/constants";
import { CalendarToday } from "@mui/icons-material";

function Tasks() {
  //   const calculateDeadline = (dateStart: string, dateEnd: string) => {
  //     const startDate = new Date(dateStart);
  //     const endDate = new Date(dateEnd);

  //     const diffTime = endDate.getTime() - startDate.getTime();
  //     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  //     return diffDays;
  //   };

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
    <Box
      sx={{ p: 4, order: 3, flex: "1 1", overflowY: "auto", height: "100vh" }}
    >
      <Header />

      {/* Top Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Task Progress
              </Typography>
              {projectProgress.map((project, index) => (
                <Box key={project.id} sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" fontWeight="600">
                      {project.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {project.completed}/{project.total}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(project.completed / project.total) * 100 || 0}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: "#E0E0E0",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: getProgressColor(index),
                      },
                    }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Activity
              </Typography>
              <List sx={{ p: 0 }}>
                {activities.map((activity) => (
                  <ListItem key={activity.id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: "#E1BEE7",
                          color: "#6A1B9A",
                          width: 40,
                          height: 40,
                        }}
                      >
                        {activity.avatar}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.action}
                      secondary={activity.time}
                      primaryTypographyProps={{
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                      secondaryTypographyProps={{ fontSize: "0.75rem" }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Allocated Task Members
              </Typography>
              {allocatedMembers.map((member) => (
                <Box
                  key={member.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: "#FFB74D", width: 40, height: 40 }}>
                      {member.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="600">
                        {member.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {member.position}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    size="small"
                    sx={{
                      bgcolor: "#F3E5F5",
                      color: "#7B1FA2",
                      textTransform: "none",
                      fontSize: "0.75rem",
                      px: 2,
                      "&:hover": { bgcolor: "#E1BEE7" },
                    }}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid> */}

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
  );
}

export default Tasks;
