import { useState, useEffect } from "react";
import {
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    Box,
    CircularProgress,
} from "@mui/material";
import {
    Delete,
    InsertDriveFile,
    Link as LinkIcon,
} from "@mui/icons-material";
import api from "../../api/axiosConfig";

interface AttachmentListProps {
    taskId: string;
    refresh: boolean;
}

function AttachmentList({ taskId, refresh }: AttachmentListProps) {
    const [attachments, setAttachments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAttachments = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/attachments/task/${taskId}`);
            setAttachments(response.data?.data || response.data || []);
        } catch (error) {
            console.error("Fetch attachments error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (taskId) {
            fetchAttachments();
        }
    }, [taskId, refresh]);

    const handleDelete = async (attachmentId: string) => {
        if (!confirm("Delete this attachment?")) return;

        try {
            await api.delete(`/attachments/${attachmentId}`);
            fetchAttachments();
        } catch (error) {
            console.error("Delete attachment error:", error);
        }
    };

    const getFileIcon = (attachment: any) => {
        if (attachment.type === "link") {
            return <LinkIcon />;
        }
        return <InsertDriveFile />;
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    if (attachments.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                No attachments
            </Typography>
        );
    }

    return (
        <List dense>
            {loading ? (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        py: 10,
                    }}
                >
                    <CircularProgress />
                </Box>
            ) : attachments.map((attachment) => (
                <ListItem
                    key={attachment._id}
                    secondaryAction={
                        <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleDelete(attachment._id)}
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                    }
                    disablePadding
                >
                    <ListItemButton
                        onClick={() => window.open(attachment.url, "_blank")}
                        sx={{ borderRadius: 1 }}
                    >
                        {getFileIcon(attachment)}
                        <ListItemText
                            primary={attachment.displayText || attachment.name}
                            secondary={
                                <>
                                    {attachment.type === "link" && attachment.domain}
                                    {attachment.type === "file" &&
                                        attachment.size &&
                                        formatSize(attachment.size)}
                                    {" • "}
                                    {new Date(attachment.uploadedAt).toLocaleDateString()}
                                </>
                            }
                            sx={{ ml: 2 }}
                        />
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );
}

export default AttachmentList;