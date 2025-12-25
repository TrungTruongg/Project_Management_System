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
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [showError, setShowError] = useState(false);
    const [loading, setLoading] = useState(false);

    const { user } = useUser();

    const isUpdate = selectedTicket !== null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !description.trim() || !selectedProject) {
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
                    projectId: selectedProject?.id,
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
                    projectId: selectedProject?.id,
                    status,
                    priority,
                    createdDate: new Date().toISOString().split("T")[0],
                };

                const response = await axios.post(
                    `https://mindx-mockup-server.vercel.app/api/resources/supportTickets?apiKey=${API_KEY}`,
                    newTicket
                );

                //Send notify to project owner only
                if (selectedProject?.ownerId) {
                    await createNotification({
                        userId: [selectedProject.ownerId],
                        type: "support",
                        title: `New Support Ticket`,
                        description: `created ticket ${title}`,
                        createdBy: user?.id,
                    });
                }

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
            // Fetch projects
            const fetchProjects = async () => {
                try {
                    const projectsRes = await axios.get(
                        `https://mindx-mockup-server.vercel.app/api/resources/projects?apiKey=${API_KEY}`
                    );
                    const allProjects = projectsRes.data.data.data;
                    // Filter projects where user is not the owner
                    const availableProjects = allProjects.filter((p: any) => p.ownerId !== user?.id);
                    setProjects(availableProjects);
                } catch (error) {
                    console.error("Error fetching projects:", error);
                }
            };

            fetchProjects();

            if (selectedTicket) {
                setTitle(selectedTicket.subject || "");
                setDescription(selectedTicket.description || "");
                setStatus(selectedTicket.status || "pending");
                setPriority(selectedTicket.priority || "medium");
                setSelectedProject(selectedTicket.projectId ? { id: selectedTicket.projectId } : null);
            } else {
                setTitle("");
                setDescription("");
                setStatus("pending");
                setPriority("medium");
                setSelectedProject(null);
            }
            setShowError(false);
            setLoading(false);
        }
    }, [open, selectedTicket, user?.id]);

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

                    <Box>
                        <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 0.5 }}>
                            Project <span className="text-red-500">*</span>
                        </Typography>
                        <Select
                            fullWidth
                            displayEmpty
                            size="small"
                            value={selectedProject?.id || ""}
                            onChange={(e) => {
                                const project = projects.find((p: any) => p.id === Number(e.target.value));
                                setSelectedProject(project);
                            }}
                            sx={{ fontSize: "14px", textTransform: "capitalize" }}
                        >
                            <MenuItem value="" disabled>
                                Select project
                            </MenuItem>
                            {projects.map((project) => (
                                <MenuItem key={project.id} value={project.id} sx={{ textTransform: "capitalize" }}>
                                    {project.title}
                                </MenuItem>
                            ))}
                        </Select>
                        {showError && !selectedProject && (
                            <Typography sx={{ fontSize: "12px", color: "#ef4444", mt: 0.5 }}>
                                Project is required
                            </Typography>
                        )}
                    </Box>

                    <Box>
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