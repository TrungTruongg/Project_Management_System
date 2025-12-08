import { useEffect, useState } from "react";
import { IoMdClose as CloseIcon } from "react-icons/io";
import {
    Box,
    Button,
    MenuItem,
    Modal,
    Select,
    TextareaAutosize,
    TextField,
    Typography,
} from "@mui/material";
import axios from "axios";

function CreateTicketModal({
    open,
    onClose,
    onSave,
    onUpdate,
    ticketList,
    selectedTicket,
}: any) {
    const [ticketId, setTicketId] = useState("");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [assignedTo, setAssignedTo] = useState<number | "">("");
    const [status, setStatus] = useState("pending");
    const [priority, setPriority] = useState("medium");
    const [users, setUsers] = useState<any[]>([]);
    const [showError, setShowError] = useState(false);
    const [loading, setLoading] = useState(false);

    const isUpdate = selectedTicket !== null;

    const fetchUsers = async () => {
        try {
            const response = await axios.get(
                "https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=69205e8dbf3939eacf2e89f2"
            );
            setUsers(response.data.data.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const generateTicketId = () => {
        const maxId =
            ticketList.length > 0
                ? Math.max(
                    ...ticketList.map((t: any) =>
                        parseInt(t.ticketId.replace("TC-", ""))
                    )
                )
                : 0;
        return `TC-${String(maxId + 1).padStart(5, "0")}`;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!subject.trim() || !description.trim()) {
            setShowError(true);
            return;
        }

        setLoading(true);

        try {
            if (isUpdate) {
                const updatedTicket = {
                    ...selectedTicket,
                    subject,
                    description,
                    assignedTo,
                    status,
                    priority,
                };

                const response = await axios.put(
                    `https://mindx-mockup-server.vercel.app/api/resources/supportTickets/${selectedTicket._id}?apiKey=69205e8dbf3939eacf2e89f2`,
                    updatedTicket
                );

                onUpdate(response.data.data);
                onClose();
            } else {
                const maxId =
                    ticketList.length > 0
                        ? Math.max(...ticketList.map((t: any) => t.id))
                        : 0;

                const newTicket = {
                    id: maxId + 1,
                    ticketId: generateTicketId(),
                    subject,
                    description,
                    assignedTo,
                    status,
                    priority,
                    createdDate: new Date().toISOString().split("T")[0],
                };

                const response = await axios.post(
                    "https://mindx-mockup-server.vercel.app/api/resources/supportTickets?apiKey=69205e8dbf3939eacf2e89f2",
                    newTicket
                );

                onSave(response.data.data);
                onClose();
            }
        } catch (error) {
            console.error("Error saving ticket:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            if (selectedTicket) {
                setTicketId(selectedTicket.ticketId || "");
                setSubject(selectedTicket.subject || "");
                setDescription(selectedTicket.description || "");
                setAssignedTo(selectedTicket.assignedTo || "");
                setStatus(selectedTicket.status || "pending");
                setPriority(selectedTicket.priority || "medium");
            } else {
                setTicketId(generateTicketId());
                setSubject("");
                setDescription("");
                setAssignedTo("");
                setStatus("pending");
                setPriority("medium");
            }
            setShowError(false);
            setLoading(false);
        }
        fetchUsers();
    }, [open, selectedTicket]);

    return (
        <Modal
            open={open}
            onClose={onClose}
            className="flex items-center justify-center"
        >
            <Box className="relative bg-white rounded-xl w-[500px] overflow-y-auto shadow-xl mx-auto p-6">
                <Box className="flex items-center justify-between mb-8">
                    <Typography sx={{ fontSize: "18px", fontWeight: 600 }}>
                        {isUpdate ? "Update Ticket" : "Create New Ticket"}
                    </Typography>
                    <Button
                        onClick={onClose}
                        sx={{
                            minWidth: "30px",
                            width: "30px",
                            height: "30px",
                            padding: 0,
                            borderRadius: "50%",
                            color: "rgb(156, 163, 175)",
                            "&:hover": {
                                backgroundColor: "#d5d5d5",
                                color: "rgb(75, 85, 99)",
                            },
                        }}
                    >
                        <CloseIcon className="w-10 h-10" />
                    </Button>
                </Box>

                <Box component="form" className="space-y-4" onSubmit={handleSave}>
                    <Box>
                        <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 0.5 }}>
                            Ticket ID
                        </Typography>
                        <TextField
                            fullWidth
                            type="text"
                            size="small"
                            value={ticketId}
                            disabled
                            sx={{ "& .MuiOutlinedInput-root": { fontSize: "14px" } }}
                        />
                    </Box>

                    <Box>
                        <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 0.5 }}>
                            Subject <span className="text-red-500">*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            type="text"
                            size="small"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Enter ticket subject"
                            sx={{ "& .MuiOutlinedInput-root": { fontSize: "14px" } }}
                        />
                        {showError && !subject.trim() && (
                            <Typography sx={{ fontSize: "12px", color: "#ef4444", mt: 0.5 }}>
                                Subject is required
                            </Typography>
                        )}
                    </Box>

                    <Box>
                        <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 0.5 }}>
                            Description <span className="text-red-500">*</span>
                        </Typography>
                        <TextareaAutosize
                            placeholder="Describe the issue..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            minRows={4}
                            style={{
                                width: "100%",
                                padding: "8px 12px",
                                border: "1px solid #d1d5db",
                                borderRadius: "4px",
                                fontSize: "14px",
                                fontFamily: "inherit",
                                resize: "none",
                                outline: "none",
                            }}
                        />
                        {showError && !description.trim() && (
                            <Typography sx={{ fontSize: "12px", color: "#ef4444", mt: 0.5 }}>
                                Description is required
                            </Typography>
                        )}
                    </Box>

                    <Box>
                        <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 0.5 }}>
                            Assign To
                        </Typography>
                        <Select
                            fullWidth
                            displayEmpty
                            size="small"
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(Number(e.target.value))}
                            sx={{ fontSize: "14px", textTransform: "capitalize" }}
                        >
                            <MenuItem value="" disabled>
                                Choose member
                            </MenuItem>
                            {users.map((user) => (
                                <MenuItem key={user.id} value={user.id} sx={{ textTransform: "capitalize" }}
                                >
                                    {user.firstName} {user.lastName}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>

                    <Box className="flex gap-4">
                        <Box className="w-full">
                            <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 0.5 }}>
                                Priority
                            </Typography>
                            <Select
                                fullWidth
                                displayEmpty
                                size="small"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                sx={{ fontSize: "14px" }}
                            >
                                <MenuItem value="high">High</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="low">Low</MenuItem>
                            </Select>
                        </Box>

                        <Box className="w-full">
                            <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 0.5 }}>
                                Status
                            </Typography>
                            <Select
                                fullWidth
                                displayEmpty
                                size="small"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                sx={{ fontSize: "14px" }}
                            >
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="in-progress">In Progress</MenuItem>
                                <MenuItem value="completed">Completed</MenuItem>
                            </Select>
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1.5 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={onClose}
                            sx={{
                                textTransform: "none",
                                color: "#374151",
                                borderColor: "#d1d5db",
                                fontSize: "14px",
                                fontWeight: 500,
                                py: 1,
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            type="submit"
                            disabled={loading}
                            sx={{
                                textTransform: "none",
                                backgroundColor: "#9333ea",
                                fontSize: "14px",
                                fontWeight: 500,
                                py: 1,
                                "&:hover": {
                                    backgroundColor: "#7e22ce",
                                },
                            }}
                        >
                            {isUpdate ? "Update" : "Save"}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
}

export default CreateTicketModal;