import { Avatar, Box, Button, Chip, CircularProgress, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from "@mui/material"
import { GoPlusCircle as AddTaskIcon } from "react-icons/go";
import { Delete, Edit, CheckCircle as CheckCompleteIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { useEffect, useState } from "react";
import DeleteConfirmDialog from "../DeleteConfirmDialog";
import { useNavigate } from "react-router-dom";
import CreateTicketModal from "./CreateTicketModal";
import { useUser } from "../context/UserContext";
import api from "../api/axiosConfig";

function SupportsView() {
    const [open, setOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [supTickets, setSupTickets] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const { user } = useUser();
    const navigate = useNavigate();

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [ticketsRes, usersRes, projectsRes] = await Promise.all([
                api.get("/tickets"),
                api.get("/users"),
                api.get("/projects"),
            ]);

            setSupTickets(ticketsRes.data || []);
            setUsers(usersRes.data || []);
            setProjects(projectsRes.data || []);
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [])

    // Get projects where the user is the leader
    const getLeaderProjects = () => {
        if (!user) return [];
        return projects.filter((p) => p.leaderId === user._id);
    };

    const getUserProjects = () => {
        if (!user) return [];
        return projects.filter(
            (p) => p.leaderId === user._id || p.members?.includes(user._id)
        );
    };

    const userProjects = getUserProjects();
    const leaderProjects = getLeaderProjects();

    const handleOpenModal = () => {
        setSelectedTicket(null);
        setOpen(true);
    };

    const handleCloseModal = () => {
        setOpen(false);
        setSelectedTicket(null);
    };

    const handleEditTicket = (ticket: any) => {
        setSelectedTicket(ticket);
        setOpen(true);
    };

    const handleSaveTicket = (newTicket: any) => {
        setSupTickets([...supTickets, newTicket]);
    };

    const handleUpdateTicket = (updatedTicket: any) => {
        setSupTickets(
            supTickets.map((ticket: any) =>
                ticket._id === updatedTicket._id ? updatedTicket : ticket
            )
        );
    };

    const handleOpenDeleteDialog = (ticket: any) => {
        setSelectedTicket(ticket);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setSelectedTicket(null);
    };

    const handleDeleteTicket = async () => {
        if (!selectedTicket) return;
        setLoading(true);
        try {
            await api.delete(`/tickets/delete/${selectedTicket._id}`);

            setSupTickets(
                supTickets.filter((ticket: any) => ticket._id !== selectedTicket._id)
            );
            handleCloseDeleteDialog();
        } catch (error) {
            console.error("Error deleting ticket:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const checkCompleteSupport = async (ticket: any) => {
        try {
            const updatedTicket = {
                ...ticket,
                status: "completed"
            };

            await api.put(
                `/tickets/update/${ticket._id}`,
                updatedTicket
            );

            setSupTickets(
                supTickets.map((t: any) =>
                    t._id === ticket._id ? updatedTicket : t
                )
            );

        } catch (error) {
            console.error("Error completing ticket:", error);
        }
    };

    const getStatusChip = (status: string) => {
        const config: any = {
            completed: { label: "Completed", bgcolor: "#4CAF50", color: "white" },
            "in-progress": {
                label: "In Progress",
                bgcolor: "#FF9800",
                color: "white",
            },
            pending: { label: "Pending", bgcolor: "#F44336", color: "white" },
        };

        const statusConfig = config[status] || config.pending;

        return (
            <Chip
                label={statusConfig.label}
                size="small"
                sx={{
                    bgcolor: statusConfig.bgcolor,
                    color: statusConfig.color,
                    fontWeight: 600,
                    fontSize: "0.75rem",
                }}
            />
        );
    };

    const getAssignedUser = (userId: number) => {
        return users.find((user) => user._id === userId);
    };

    const isProjectleaderForTicket = (ticket: any): boolean => {
        if (!ticket.projectId || !user) return false;
        const project = projects.find((p: any) => p._id === ticket.projectId);
        return project && project.leaderId === user._id;
    };

    const handleRowClick = (ticketId: string) => {
        navigate(`/supports-detail?id=${ticketId}`);
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
                        Support Tickets
                    </Typography>
                    <Chip
                        label={supTickets.length}
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
                        title="Refresh tickets"
                    >
                        <RefreshIcon />
                    </IconButton>
                    <Button
                        variant="contained"
                        size="medium"
                        startIcon={<AddTaskIcon />}
                        onClick={handleOpenModal}
                        disabled={leaderProjects.length === 0}
                        sx={{
                            backgroundColor: "#484c7f",
                            color: "white",
                            textTransform: "none",
                            px: 3,
                        }}
                    >
                        Add Ticket
                    </Button>
                </Box>
            </Box>
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
            ) : userProjects.length === 0 ? (
                <Typography fontStyle="italic">
                    You need in project to create support ticket.
                </Typography>
            ) : supTickets.length === 0 ? (
                <Typography fontStyle="italic" >No support tickets available!</Typography>
            ) : (
                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        border: (theme) =>
                            `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`
                    }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: (theme) => theme.palette.mode === 'light' ? "#f5f5f5" : "black" }}>
                                <TableCell sx={{ fontWeight: 700 }}>TICKET ID</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>NAME</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>ASSIGNED BY</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>CREATE DATE</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>STATUS</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">
                                    ACTION
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {supTickets
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((ticket): any => {
                                    const assignedUser = getAssignedUser(ticket.assignedBy);

                                    return (
                                        <TableRow
                                            key={ticket._id}
                                            sx={{
                                                "&:hover": {
                                                    bgcolor: "action.hover",
                                                    cursor: "pointer",
                                                },
                                            }}
                                            onClick={() => handleRowClick(ticket._id)}
                                        >
                                            <TableCell>
                                                <Typography
                                                    sx={{
                                                        color: "#FF9800",
                                                        fontWeight: 600,
                                                        fontSize: "0.9rem",
                                                        textAlign: "left"
                                                    }}
                                                >
                                                    {ticket._id}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{ticket.name}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <Avatar
                                                        src={assignedUser?.avatar}
                                                        sx={{
                                                            width: 32,
                                                            height: 32,
                                                            fontSize: "0.85rem",
                                                            bgcolor: "#E0E0E0",
                                                            textTransform: "uppercase",
                                                        }}
                                                    >
                                                        {assignedUser?.firstName?.[0]}
                                                        {assignedUser?.lastName?.[0]}
                                                    </Avatar>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ textTransform: "capitalize" }}
                                                    >
                                                        {assignedUser
                                                            ? `${assignedUser.firstName} ${assignedUser.lastName}`
                                                            : "Unassigned"}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(ticket.createdDate).toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </TableCell>
                                            <TableCell>{getStatusChip(ticket.status)}</TableCell>
                                            <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                                                {isProjectleaderForTicket(ticket) && ticket.status !== "completed" &&
                                                    <IconButton
                                                        size="small"
                                                        sx={{ color: "#4CAF50" }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            checkCompleteSupport(ticket);
                                                        }}
                                                        title="Mark as complete"
                                                    >
                                                        <CheckCompleteIcon fontSize="small" />
                                                    </IconButton>
                                                }
                                                {(user?.role === "leader" || ticket.assignedBy === user?._id) &&
                                                    (
                                                        <>
                                                            <IconButton
                                                                size="small"
                                                                sx={{ color: "#4CAF50" }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditTicket(ticket);
                                                                }}
                                                            >
                                                                <Edit fontSize="small" />
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                sx={{ color: "#EF5350" }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleOpenDeleteDialog(ticket);
                                                                }}
                                                            >
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </>
                                                    )
                                                }

                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>
                    <TablePagination
                        component="div"
                        count={supTickets.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25]}
                    />
                </TableContainer>
            )}

            <CreateTicketModal
                open={open}
                onClose={handleCloseModal}
                onSave={handleSaveTicket}
                onUpdate={handleUpdateTicket}
                ticketList={supTickets}
                selectedTicket={selectedTicket}
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                onDelete={handleDeleteTicket}
                selected={selectedTicket ? selectedTicket.ticketId : ""}
                loading={loading}
            />
        </>
    )
}

export default SupportsView
