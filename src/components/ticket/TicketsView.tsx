import { Avatar, Box, Button, Chip, CircularProgress, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from "@mui/material"
import { GoPlusCircle as AddTaskIcon } from "react-icons/go";
import { Delete, Edit } from "@mui/icons-material";
import { useEffect, useState } from "react";
import axios from "axios";
import DeleteConfirmDialog from "../DeleteConfirmDialog";
import { useNavigate } from "react-router-dom";
import CreateTicketModal from "./CreateTicketModal";

function TicketsView() {
    const [open, setOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [supTickets, setSupTickets] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const navigate = useNavigate();

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [ticketsRes, usersRes] = await Promise.all([
                axios.get(
                    "https://mindx-mockup-server.vercel.app/api/resources/supportTickets?apiKey=69205e8dbf3939eacf2e89f2"
                ),
                axios.get(
                    "https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=69205e8dbf3939eacf2e89f2"
                ),
            ]);

            setSupTickets(ticketsRes.data.data.data || []);
            setUsers(usersRes.data.data.data || []);
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [])

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
                ticket.id === updatedTicket.id ? updatedTicket : ticket
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
            await axios.delete(
                `https://mindx-mockup-server.vercel.app/api/resources/supportTickets/${selectedTicket._id}?apiKey=69205e8dbf3939eacf2e89f2`
            );

            setSupTickets(
                supTickets.filter((ticket: any) => ticket.id !== selectedTicket.id)
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
        return users.find((user) => user.id === userId);
    };

    const handleRowClick = (ticketId: string) => {
        navigate(`/tickets-detail?id=${ticketId}`);
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
                    Support Tickets
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
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                                <TableCell sx={{ fontWeight: 700 }}>TICKET ID</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>SUBJECT</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>ASSIGNED</TableCell>
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
                                    const assignedUser = getAssignedUser(ticket.assignedTo);

                                    return (
                                        <TableRow
                                            key={ticket.id}
                                            sx={{
                                                "&:hover": {
                                                    bgcolor: "#f9fafb",
                                                    cursor: "pointer",
                                                },
                                            }}
                                            onClick={() => handleRowClick(ticket.id)}
                                        >
                                            <TableCell>
                                                <Typography
                                                    sx={{
                                                        color: "#FF9800",
                                                        fontWeight: 600,
                                                        fontSize: "0.9rem",
                                                    }}
                                                >
                                                    #{ticket.ticketId}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{ticket.subject}</TableCell>
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

export default TicketsView
