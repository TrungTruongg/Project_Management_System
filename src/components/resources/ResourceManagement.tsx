import { Box, Card, CardContent, CircularProgress, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiDownload as DownloadIcon } from "react-icons/bi";
import { IoTrashOutline as DeleteIcon } from "react-icons/io5";

function ResourceManagement() {
    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState<any[]>([]);
    const navigate = useNavigate();

    const fetchTask = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://mindx-mockup-server.vercel.app/api/resources/tasks?apiKey=69205e8dbf3939eacf2e89f2");
            setTasks(response.data.data.data);

            const tasksWithImages = response.data.data.data.filter((task: any) => {
                return task.attachments &&
                    task.attachments.length > 0 &&
                    task.attachments.some((att: any) =>
                        att.type?.startsWith("image/") ||
                        att.type?.startsWith("text/") ||
                        att.type?.startsWith("video/") ||
                        att.type?.startsWith("application/")
                    );
            });

            setTasks(tasksWithImages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTask();
    }, []);

    const handleViewTask = (taskId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/task-detail?id=${taskId}`);
    };

    const getFilePreview = (attachment: any) => {
        const isImage = attachment.type?.startsWith("image/");
        const isVideo = attachment.type?.startsWith("video/");
        const isPDF = attachment.type === "application/pdf";
        const isText = attachment.type?.startsWith("text/");

        if (isImage) {
            return (
                <Box
                    sx={{
                        height: 200,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "white",
                    }}
                >
                    <img
                        src={attachment.url}
                        alt={attachment.name}
                        style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                        }}
                        onError={(e: any) => { e.target.src = "/images/no-content.png"; }}
                    />

                    {/* <Box
                        sx={{
                            // position: "absolute",
                            // top: 8,
                            // right: 8,
                            display: "flex",
                            gap: 1,
                        }}
                    >
                        <Box
                            sx={{
                                width: 32,
                                height: 32,
                                bgcolor: "rgba(255,255,255,0.9)",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "0.2s",
                                "&:hover": { bgcolor: "white" },
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(attachment.url, "_blank");
                            }}
                        >
                            <DownloadIcon />
                        </Box>

                        <Box
                            sx={{
                                width: 32,
                                height: 32,
                                bgcolor: "rgba(255,255,255,0.9)",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "0.2s",
                                "&:hover": { bgcolor: "white" },
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                alert("Delete clicked!");
                            }}
                        >
                            <DeleteIcon />
                        </Box>
                    </Box> */}
                </Box>
            );
        }

        // Text/PDF preview
        if (isText || isPDF) {
            return (
                <Box
                    sx={{
                        height: 200,
                        bgcolor: "white",
                        p: 2,
                        overflow: "none",
                        position: "relative",
                    }}
                >
                    <iframe
                        src={attachment.url}
                        style={{
                            width: "100%",
                            height: "100%",
                            border: "none",
                            pointerEvents: "none",
                        }}
                        title={attachment.name}
                        scrolling="no"
                    />
                    {/* Overlay for better visibility */}
                    <Box
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: "rgba(255,255,255,0.1)",
                            pointerEvents: "none",
                        }}
                    />
                </Box>
            );
        }

        // Video
        if (isVideo) {
            return (
                <Box
                    sx={{
                        height: 200,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "white",
                    }}
                >
                    <video
                        src={attachment.url}
                        title={attachment.name}
                        style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                        }}
                        controls
                    />

                </Box>
            );
        }

        // Other files - show icon
        return (
            <Box
                sx={{
                    height: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#f5f5f5",
                    fontSize: 48,
                }}
            >
                📎
            </Box>
        );
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
            ) : (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: 3,
                    }}
                >
                    {tasks.map((task) => (
                        task.attachments && task.attachments.map((attachment: any) => (
                            <Card
                                key={attachment.id}
                                elevation={0}
                                // onClick={() => handleToggleSelect(index)}
                                sx={{
                                    border: "1px solid #e0e0e0",
                                    borderRadius: 2,
                                    transition: "all 0.3s",

                                }}
                            >
                                {getFilePreview(attachment)}

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
                                        onClick={(e) => handleViewTask(task.id, e)}
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
                                            {task.title}
                                        </Box>
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))

                    ))}
                </Box>
            )}
        </>
    )
}

export default ResourceManagement
