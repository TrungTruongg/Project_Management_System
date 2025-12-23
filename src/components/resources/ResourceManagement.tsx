import { Box, Card, CardContent, CircularProgress, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PreviewActionButtons from "./PreviewActionButtons";

const API_KEY = import.meta.env.VITE_API_KEY;

const LinkImagePreview = ({ attachment, onDelete }: any) => {
    const [isImage, setIsImage] = useState(true);

    return (
        <Box
            sx={{
                height: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                bgcolor: "white",
                overflow: "hidden",
            }}
        >
            {isImage ? (
                <img
                    src={attachment.url}
                    alt={attachment.name}
                    loading="lazy"
                    style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                    }}
                    onError={() => setIsImage(false)}
                />
            ) : (
                <Box sx={{ fontSize: 20 }}>📎</Box>
            )}

            <PreviewActionButtons
                attachment={attachment}
                onDelete={onDelete}
            />
        </Box>
    );
};

function ResourceManagement() {
    const [loading, setLoading] = useState(false);
    const [attachments, setAttachments] = useState<any[]>([]);
    const navigate = useNavigate();

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [attachmentsRes, tasksRes] = await Promise.all([
                axios.get(
                    `https://mindx-mockup-server.vercel.app/api/resources/attachments?apiKey=${API_KEY}`
                ),
                axios.get(
                    `https://mindx-mockup-server.vercel.app/api/resources/tasks?apiKey=${API_KEY}`
                ),
            ]);

            const allAttachments = attachmentsRes.data.data.data;

            const allTasks = tasksRes.data.data.data;

            const attachmentsWithTask = allAttachments.map((att: any) => ({
                ...att,
                task: allTasks.find((t: any) => t.id === att.taskId),
            }));

            setAttachments(attachmentsWithTask);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleViewTask = (taskId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/task-detail?id=${taskId}`);
    };

    const handleDeleteAttachment = async (attachment: any) => {
        if (!window.confirm(`Delete ${attachment.name}?`)) {
            return;
        }

        try {
            await axios.delete(
                `https://mindx-mockup-server.vercel.app/api/resources/attachments/${attachment._id}?apiKey=${API_KEY}`
            );

            setAttachments(attachments.filter((att: any) => att.id !== attachment.id));

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
                <Typography variant="h4" fontWeight="700">
                    Resources
                </Typography>

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
            ) : attachments.length === 0 ? (
                <Typography fontStyle="italic" >No attachments available!</Typography>
            ) : (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: 3,
                    }}
                >
                    {attachments.map((attachment) => (
                        <Card
                            key={attachment.id}
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
                            <LinkImagePreview
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
                                    onClick={(e) => handleViewTask(attachment.task.id, e)}
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
                                        {attachment.task.title}
                                    </Box>
                                </Typography>
                            </CardContent>
                        </Card>
                    )

                    )}
                </Box>
            )}
        </>
    )
}

export default ResourceManagement
