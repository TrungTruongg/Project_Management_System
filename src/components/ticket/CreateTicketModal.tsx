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
import { useUser } from "../context/UserContext";
import { createNotification } from "../utils/createNotification";

const API_KEY = import.meta.env.VITE_API_KEY;

function CreateTicketModal({
    open,
    onClose,
    onSave,
    onUpdate,
    ticketList,
    selectedTicket,
}: any) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("pending");
    const [priority, setPriority] = useState("medium");
    const [showError, setShowError] = useState(false);
    const [loading, setLoading] = useState(false);

    const { user } = useUser();

    const isUpdate = selectedTicket !== null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !description.trim()) {
            setShowError(true);
            return;
        }

        setLoading(true);

        try {
            if (isUpdate) {
                const updatedTicket = {
                    ...selectedTicket,
                    title,
                    description,
                    status,
                    priority,
                };

                const response = await axios.put(
                    `https://mindx-mockup-server.vercel.app/api/resources/supportTickets/${selectedTicket._id}?apiKey=${API_KEY}`,
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
                    title,
                    description,
                    assignedBy: user?.id,
                    status,
                    priority,
                    createdDate: new Date().toISOString().split("T")[0],
                };

                const response = await axios.post(
                    `https://mindx-mockup-server.vercel.app/api/resources/supportTickets?apiKey=${API_KEY}`,
                    newTicket
                );


                //Send notify for leader
                const usersResponse = await axios.get(
                    `https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=${API_KEY}`
                );

                const leaderUsers = usersResponse.data.data.data.filter(
                    (u: any) => u.role === "leader"
                );

                const leaderIds = leaderUsers.map((u: any) => u.id);

                await createNotification({
                    userId: leaderIds,
                    type: "support",
                    title: `New Support Ticket`,
                    description: `created ticket ${title}`,
                    createdBy: user?.id,
                });

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
                setTitle(selectedTicket.subject || "");
                setDescription(selectedTicket.description || "");
                setStatus(selectedTicket.status || "pending");
                setPriority(selectedTicket.priority || "medium");
            } else {
                setTitle("");
                setDescription("");
                setStatus("pending");
                setPriority("medium");
            }
            setShowError(false);
            setLoading(false);
        }
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
                            Title <span className="text-red-500">*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            type="text"
                            size="small"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter ticket title"
                            sx={{ "& .MuiOutlinedInput-root": { fontSize: "14px" } }}
                        />
                        {showError && !title.trim() && (
                            <Typography sx={{ fontSize: "12px", color: "#ef4444", mt: 0.5 }}>
                                Title is required
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

                    {/* <Box>
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
                    </Box> */}

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

                        {/* <Box className="w-full">
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
                        </Box> */}
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