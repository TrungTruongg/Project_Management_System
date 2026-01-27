import { Box, Card, CardContent, CircularProgress, IconButton, Typography } from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useSearch } from "../context/SearchContext";
import api from "../api/axiosConfig";
import AttachmentPreview from "./AttachmentPreview";
import AttachmentFilters, { type FilterState } from "./AttachmentFilters";
import DeleteConfirmDialog from "../DeleteConfirmDialog";

function AttachmentManagement() {
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedAttachment, setSelectedAttachment] = useState<any>(null);
    const [attachments, setAttachments] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const navigate = useNavigate();
    const { user } = useUser();
    const { searchTerm } = useSearch();

    const [activeFilters, setActiveFilters] = useState<FilterState>({
        createdBy: [],
        type: [],
        createdDate: [],
    })

    // Helper function to get file extension from URL
    const getFileExtension = (url: string): string => {
        const filename = url.split('/').pop() || '';
        const ext = filename.split('.').pop()?.toLowerCase() || '';
        return ext;
    };

    // Helper function to map extension to type category
    const getFileType = (url: string): string => {
        const ext = getFileExtension(url);

        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
            return 'image';
        }
        if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext)) {
            return 'document';
        }
        if (ext === 'pdf') {
            return 'pdf';
        }
        if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) {
            return 'spreadsheet';
        }
        if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mp3', 'wav', 'aac', 'ogg'].includes(ext)) {
            return 'video';
        }

        return 'other';
    };

    // Helper function to check if date is within range
    const isDateInRange = (uploadedAt: string, range: string): boolean => {
        const uploadDate = new Date(uploadedAt);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (range) {
            case 'today':
                return uploadDate >= today;

            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                return uploadDate >= yesterday && uploadDate < today;

            case 'last-7-days':
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                return uploadDate >= sevenDaysAgo;

            case 'this-month':
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                return uploadDate >= monthStart;

            case 'this-year':
                const yearStart = new Date(now.getFullYear(), 0, 1);
                return uploadDate >= yearStart;

            default:
                return false;
        }
    };

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [attachmentsRes, tasksRes, projectRes, userRes] = await Promise.all([
                api.get("/attachments"),
                api.get("/tasks"),
                api.get("/projects"),
                api.get("/users")
            ]);

            setProjects(projectRes.data);
            setUsers(userRes.data);

            // Filter attachments based on user's project access
            if (user) {
                const userProjectIds = projectRes.data
                    .filter((p: any) => p.leaderId === user._id || p.members?.includes(user._id))
                    .map((p: any) => p._id);

                const userTasks = tasksRes.data.filter((t: any) =>
                    userProjectIds.includes(t.projectId)
                );

                const attachmentsWithTask = attachmentsRes.data
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
        // Filter by search term
        if (searchTerm.trim()) {
            const matchesSearch =
                attachment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                attachment.task?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                attachment.task?.description?.toLowerCase().includes(searchTerm.toLowerCase());

            if (!matchesSearch) return false;
        }

        // Filter by created users (người upload)
        if (activeFilters.createdBy.length > 0) {
            // Lấy danh sách userId từ createdBy (có thể là array hoặc single value)
            const createdByUsers = Array.isArray(attachment.createdBy)
                ? attachment.createdBy
                : [attachment.createdBy];

            // Kiểm tra xem có userId nào trong filter không
            const hasMatch = createdByUsers.some((userId: string) =>
                activeFilters.createdBy.includes(userId)
            );

            if (!hasMatch) return false;
        }

        // Filter by type (dựa vào extension của URL)
        if (activeFilters.type.length > 0) {
            const fileType = getFileType(attachment.url);

            if (!activeFilters.type.includes(fileType)) {
                return false;
            }
        }

        // Filter by created date (dựa vào uploadedAt)
        if (activeFilters.createdDate.length > 0) {
            const hasMatchingDate = activeFilters.createdDate.some((range: string) =>
                isDateInRange(attachment.uploadedAt, range)
            );

            if (!hasMatchingDate) return false;
        }

        return true;
    });

    const handleViewTask = (taskId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/task-detail?id=${taskId}`);
    };

    const handleDeleteAttachment = async () => {
        if (!selectedAttachment) return;
        
        setDeleteLoading(true);

        try {
            await api.delete(`attachments/delete/${selectedAttachment._id}`);

            setAttachments(attachments.filter((att: any) => att._id !== selectedAttachment._id));
            handleCloseDeleteDialog();
        } catch (err) {
            console.error("Error deleting attachment:", err);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleOpenDeleteDialog = (attachment: any) => {
        setSelectedAttachment(attachment);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setSelectedAttachment(null);
    };

    const handleFilterChange = (filters: FilterState) => {
        setActiveFilters(filters);
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
                        Attachments
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

                <AttachmentFilters
                    users={users}
                    onFilterChange={handleFilterChange}
                />
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
                                    onDelete={() => handleOpenDeleteDialog(attachment)}
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

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                onDelete={handleDeleteAttachment}
                selected={selectedAttachment ? selectedAttachment.name : ""}
                loading={deleteLoading}
            />
        </>
    )
}

export default AttachmentManagement