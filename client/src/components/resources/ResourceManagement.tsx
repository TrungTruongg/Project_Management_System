import { Box, Card, CardContent, CircularProgress, IconButton, Typography } from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useSearch } from "../context/SearchContext";
import api from "../api/axiosConfig";
import AttachmentPreview from "./AttachmentPreview";

function ResourceManagement() {
    const [loading, setLoading] = useState(false);
    const [attachments, setAttachments] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const navigate = useNavigate();
    const { user } = useUser();
    const { searchTerm } = useSearch();

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [attachmentsRes, tasksRes, projectRes] = await Promise.all([
                api.get("/attachments"),
                api.get("/tasks"),
                api.get("/projects"),
            ]);

            const allAttachments = attachmentsRes.data;
            const allTasks = tasksRes.data;
            const allProjects = projectRes.data;

            setProjects(allProjects);

            // Filter attachments based on user's project access
            if (user) {
                const userProjectIds = allProjects
                    .filter((p: any) => p.leaderId === user._id || p.members?.includes(user._id))
                    .map((p: any) => p._id);

                const userTasks = allTasks.filter((t: any) =>
                    userProjectIds.includes(t.projectId)
                );

                const attachmentsWithTask = allAttachments
                    .filter((att: any) => userTasks.some((t: any) => t._id === att.taskId))
                    .map((att: any) => ({
                        ...att,
                        task: userTasks.find((t: any) => t._id === att.taskId),
                    }));

                setAttachments(attachmentsWithTask);
            } else {
                setAttachments([]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const getUserProjects = () => {
        if (!user) return [];

        return projects.filter(
            (p) => p?.leaderId === user._id || p?.members?.includes(user._id)
        );
    };

    const userProjects = getUserProjects();

    const filteredAttachments = attachments.filter((attachment: any) => {
        if (!searchTerm.trim()) return true;

        const searchLower = searchTerm.toLowerCase();
        return (
            attachment.name?.toLowerCase().includes(searchLower) ||
            attachment.task?.title?.toLowerCase().includes(searchLower)
        );
    });

    const handleViewTask = (taskId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/task-detail?id=${taskId}`);
    };

    const handleDeleteAttachment = async (attachment: any) => {
        if (!window.confirm(`Delete ${attachment.name}?`)) {
            return;
        }

        try {
            await api.delete(`attachments/delete/${attachment._id}`);

            setAttachments(attachments.filter((att: any) => att._id !== attachment._id));

        } catch (err) {
            console.error("Error deleting attachment:", err);
        }
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
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Typography fontSize="1.5rem" fontWeight="700">
                        Resources
                    </Typography>
                    <IconButton
                        onClick={fetchAllData}
                        disabled={loading}
                        sx={{ color: "text.secondary" }}
                        title="Refresh resources"
                    >
                        <RefreshIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Resource Grid */}
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
                    You are not part of any projects yet.
                </Typography>
            ) : attachments.length === 0 ? (
                <Typography fontStyle="italic" >No attachments available!</Typography>
            ) : filteredAttachments.length === 0 ? (
                <Typography fontStyle="italic" >No attachments match your search!</Typography>
            ) : (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: 3,
                    }}
                >
                    {filteredAttachments.map((attachment) => {
                        return (
                            <Card
                                key={attachment._id}
                                elevation={0}
                                sx={{
                                    border: (theme) =>
                                        `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`,
                                    borderRadius: 2,
                                    transition: "all 0.3s",
                                    "&:hover .preview-actions": {
                                        opacity: 1,
                                        pointerEvents: "auto",
                                    }
                                }}
                            >
                                <AttachmentPreview
                                    attachment={attachment}
                                    onDelete={handleDeleteAttachment}
                                />

                                {/* Content */}
                                <CardContent sx={{ p: 2 }}>
                                    {/* File Name */}
                                    <Typography
                                        variant="body2"
                                        fontWeight="600"
                                        sx={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            mb: 0.5,
                                        }}
                                    >
                                        {attachment.name}
                                    </Typography>

                                    {/* Task Name */}
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        onClick={(e) => handleViewTask(attachment.task._id, e)}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 0.5,
                                            cursor: "pointer"
                                        }}
                                    >
                                        <Box
                                            component="span"
                                            sx={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                bgcolor: "#E3F2FD",
                                                color: "#2196F3",
                                                px: 1,
                                                py: 0.25,
                                                borderRadius: 1,
                                                fontSize: "0.7rem",

                                            }}
                                        >
                                            {attachment?.task?.name}
                                        </Box>
                                    </Typography>
                                </CardContent>
                            </Card>
                        )
                    })}
                </Box>
            )}
        </>
    )
}

export default ResourceManagement
