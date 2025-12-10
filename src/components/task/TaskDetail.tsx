import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import {
    Person as PersonIcon,
    Label as PriorityIcon,
    Loop as StatusIcon,
    AttachFile as FileIcon,
    Download as DownloadIcon
} from "@mui/icons-material";
import CommentSection from "../comment/CommentSection";

function TaskDetail() {
    const [searchParams] = useSearchParams();
    const taskId = searchParams.get("id");

    const [task, setTask] = useState<any>(null);
    const [assignedUsers, setAssignedUsers] = useState<any[]>([]);
    const [project, setProject] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [allUsers, setAllUsers] = useState<any[]>([]);

    const fetchTaskDetail = async () => {
        if (!taskId) return;

        setLoading(true);
        try {
            const [tasksRes, usersRes, projectsRes, commentsRes] = await Promise.all([
                axios.get(
                    "https://mindx-mockup-server.vercel.app/api/resources/tasks?apiKey=69205e8dbf3939eacf2e89f2"
                ),
                axios.get(
                    "https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=69205e8dbf3939eacf2e89f2"
                ),
                axios.get(
                    "https://mindx-mockup-server.vercel.app/api/resources/projects?apiKey=69205e8dbf3939eacf2e89f2"
                ),
                axios.get(
                    "https://mindx-mockup-server.vercel.app/api/resources/comments?apiKey=69205e8dbf3939eacf2e89f2"
                ),
            ]);

            const tasks = tasksRes.data.data.data;
            const users = usersRes.data.data.data;
            const projects = projectsRes.data.data.data;
            const allComments = commentsRes.data.data.data || [];

            setAllUsers(users);

            const foundTask = tasks.find((task: any) => task.id === parseInt(taskId));

            if (foundTask) {
                setTask(foundTask);

                const assignedUserIds = Array.isArray(foundTask.assignedTo)
                    ? foundTask.assignedTo
                    : foundTask.assignedTo
                        ? [foundTask.assignedTo]
                        : [];

                const assigned = users.filter((u: any) =>
                    assignedUserIds.includes(u.id)
                );
                setAssignedUsers(assigned);

                const taskProject = projects.find((p: any) => p.id === foundTask.projectId);
                setProject(taskProject);

                const taskComments = allComments.filter(
                    (c: any) => c.taskId === foundTask.id
                );
                setComments(taskComments);
            }
        } catch (error) {
            console.error("Error fetching task detail:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTaskDetail();
    }, [taskId]);

    const handleSubmitComment = (newComment: any) => {
        setComments([...comments, newComment]);
    };

    const handleDeleteComment = (commentId: number) => {
        setComments(comments.filter((c) => c.id !== commentId));
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    };

    const getStatusChip = (status: string) => {
        const config: any = {
            completed: { label: "Completed", bgcolor: "#4CAF50" },
            "in-progress": { label: "In Progress", bgcolor: "#FF9800" },
            pending: { label: "Pending", bgcolor: "#F44336" },
        };

        const statusConfig = config[status] || config.pending;

        return (
            <Chip
                label={statusConfig.label}
                size="small"
                sx={{
                    bgcolor: statusConfig.bgcolor,
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    height: 28,
                    px: 1,
                }}
            />
        );
    };

    const getPriorityChip = (priority: string) => {
        const config: any = {
            high: { label: "High", bgcolor: "#EF5350" },
            medium: { label: "Medium", bgcolor: "#FF9800" },
            low: { label: "Low", bgcolor: "#66BB6A" },
        };

        const priorityConfig = config[priority] || config.medium;

        return (
            <Chip
                label={priorityConfig.label}
                size="small"
                sx={{
                    bgcolor: priorityConfig.bgcolor,
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    height: 28,
                    px: 1,
                }}
            />
        );
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "60vh",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!task) {
        return (
            <Box sx={{ py: 10, textAlign: "center" }}>
                <Typography variant="h5" color="text.secondary">
                    Task not found
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" fontWeight="700" sx={{ mb: 4 }}>
                Task Detail
            </Typography>

            {/* Info Cards */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 3,
                    mb: 4,
                }}
            >
                {/* Status Card */}
                <Card
                    sx={{
                        boxShadow: 2,
                        borderRadius: 2,
                        transition: "all 0.3s",
                    }}
                >
                    <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 2,
                                    bgcolor: "#FFF9C4",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <StatusIcon sx={{ fontSize: 32, color: "#F57F17" }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontWeight: 600 }}
                                >
                                    Status
                                </Typography>
                                <Box sx={{ mt: 0.5 }}>{getStatusChip(task.status)}</Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* Assigned Users Card */}
                <Card
                    sx={{
                        boxShadow: 2,
                        borderRadius: 2,
                        transition: "all 0.3s",

                    }}
                >
                    <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 2,
                                    bgcolor: "#B3E5FC",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <PersonIcon sx={{ fontSize: 32, color: "#0277BD" }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontWeight: 600 }}
                                >
                                    Assigned To
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                                    {assignedUsers.length > 0 ? (
                                        assignedUsers.map((assignedUser, index) => (
                                            <Box
                                                key={assignedUser.id}
                                                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                                            >
                                                <Avatar
                                                    src={assignedUser?.avatar}
                                                    sx={{
                                                        width: 28,
                                                        height: 28,
                                                        fontSize: "0.75rem",
                                                        bgcolor: "#E0E0E0",
                                                        textTransform: "uppercase",
                                                    }}
                                                >
                                                    {assignedUser?.firstName?.[0]}
                                                    {assignedUser?.lastName?.[0]}
                                                </Avatar>
                                                {index < assignedUsers.length - 1 && ","}
                                            </Box>
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            Unassigned
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* Priority Card */}
                <Card
                    sx={{
                        boxShadow: 2,
                        borderRadius: 2,
                        transition: "all 0.3s",

                    }}
                >
                    <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 2,
                                    bgcolor: "#B2DFDB",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <PriorityIcon sx={{ fontSize: 32, color: "#00796B" }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontWeight: 600 }}
                                >
                                    Priority
                                </Typography>
                                <Box sx={{ mt: 0.5 }}>{getPriorityChip(task.priority)}</Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* Task Content */}
            <Card
                sx={{
                    boxShadow: 2,
                    borderRadius: 2,
                    mb: 4,
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    {/* Task Info Header */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 3,
                            pb: 2,
                            borderBottom: "1px solid #e0e0e0",
                        }}
                    >
                        <Box>
                            {project && (
                                <Chip
                                    label={project.title}
                                    size="small"
                                    sx={{
                                        bgcolor: "#F3E5F5",
                                        color: "#7B1FA2",
                                        fontSize: "0.75rem",
                                        mb: 1,
                                        textTransform: "capitalize",
                                    }}
                                />
                            )}
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: "0.85rem" }}
                            >
                                {new Date(task.startDate).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                })}{" "}
                                -{" "}
                                {new Date(task.endDate).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Title */}
                    <Typography
                        variant="h5"
                        fontWeight="700"
                        sx={{
                            color: "#2E7D32",
                            mb: 3,
                        }}
                    >
                        {task.title}
                    </Typography>

                    {/* Description */}
                    <Box>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{
                                lineHeight: 1.8,
                                whiteSpace: "pre-wrap",
                            }}
                        >
                            {task.description || "No description provided"}
                        </Typography>
                    </Box>

                    {/* Additional Info */}
                    <Box
                        sx={{
                            mt: 4,
                            pt: 3,
                            borderTop: "1px solid #e0e0e0",
                            display: "flex",
                            gap: 4,
                            flexWrap: "wrap",
                        }}
                    >
                        <Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                            >
                                Start Date
                            </Typography>
                            <Typography variant="body2" fontWeight="600">
                                {new Date(task.startDate).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                            >
                                End Date
                            </Typography>
                            <Typography variant="body2" fontWeight="600">
                                {new Date(task.endDate).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                            >
                                Status
                            </Typography>
                            {getStatusChip(task.status)}
                        </Box>

                        <Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                            >
                                Priority
                            </Typography>
                            {getPriorityChip(task.priority)}
                        </Box>
                    </Box>


                    {task.attachments && task.attachments.length > 0 && (
                        <Box sx={{
                            mt: 4,
                            pt: 3,
                            borderTop: "1px solid #e0e0e0",
                            gap: 4,
                        }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                                <FileIcon sx={{ width: 15, height: 15}} />
                                <Typography variant="h6" fontSize="small" fontWeight="700" >
                                    Attachments ({task.attachments.length})
                                </Typography>
                            </Box>

                            <List sx={{ p: 0 }}>
                                {task.attachments.map((attachment: any) => (
                                    <ListItem
                                        key={attachment.id}
                                        sx={{
                                            border: "1px solid #e0e0e0",
                                            borderRadius: 1,
                                            mb: 1,
                                            "&:hover": {
                                                bgcolor: "#f5f5f5",
                                            },
                                        }}
                                        secondaryAction={
                                            <IconButton

                                                size="small"
                                                href={attachment.url}
                                                download={attachment.name}
                                                sx={{ textTransform: "none" }}
                                            >
                                                <DownloadIcon />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemIcon>
                                            <FileIcon sx={{ color: "#2196F3", fontSize: 32 }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body1" fontWeight="600">
                                                    {attachment.name}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatFileSize(attachment.size)} • Added{" "}
                                                        {new Date(attachment.uploadedAt).toLocaleDateString("en-GB")}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Comments Section */}
            <CommentSection
                taskId={task.id}
                comments={comments}
                onSubmit={handleSubmitComment}
                onDelete={handleDeleteComment}
                assignedUsers={allUsers}
            />
        </Box>
    );
}

export default TaskDetail;