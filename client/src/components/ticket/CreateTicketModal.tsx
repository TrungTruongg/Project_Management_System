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
import { useUser } from "../context/UserContext";
import { createNotification } from "../utils/createNotification";
import api from "../api/axiosConfig";

function CreateTicketModal({
  open,
  onClose,
  onSave,
  onUpdate,
  selectedTicket,
}: any) {
  const [name, setName] = useState("");
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

    if (!name.trim() || !description.trim() || !selectedProject) {
      setShowError(true);
      return;
    }

    setLoading(true);

    try {
      if (isUpdate) {
        const updatedTicket = {
          ...selectedTicket,
          name,
          description,
          projectId: selectedProject?._id,
          status,
          priority,
        };

        const response = await api.put(
          `/tickets/update/${selectedTicket._id}`,
          updatedTicket
        );

        onUpdate(response.data.ticket);
        onClose();
      } else {
        const newTicket = {
          name,
          description,
          assignedBy: user?._id,
          projectId: selectedProject?._id,
          status,
          priority,
          createdDate: new Date().toISOString().split("T")[0],
        };

        const response = await api.post("/tickets/create",
          newTicket
        );

        //Send notify to project leader only
        if (selectedProject?.leaderId) {
          await createNotification({
            userId: [selectedProject.leaderId],
            type: "support",
            title: `New Support Ticket`,
            description: `created ticket ${name}`,
            createdBy: user?._id,
          });
        }

        onSave(response.data);
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
      const fetchProjects = async () => {
        try {
          const projectsRes = await api.get("/projects");
          const allProjects = projectsRes.data;

          // Filter projects where user is not the leader
          const availableProjects = allProjects.filter(
            (p: any) => p.leaderId !== user?._id
          );
          setProjects(availableProjects);
        } catch (error) {
          console.error("Error fetching projects:", error);
        }
      };

      fetchProjects();

      if (selectedTicket) {
        setName(selectedTicket.name || "");
        setDescription(selectedTicket.description || "");
        setStatus(selectedTicket.status || "pending");
        setPriority(selectedTicket.priority || "medium");
        setSelectedProject(
          selectedTicket.projectId ? { _id: selectedTicket.projectId } : null
        );
      } else {
        setName("");
        setDescription("");
        setStatus("pending");
        setPriority("medium");
        setSelectedProject(null);
      }
      setShowError(false);
      setLoading(false);
    }
  }, [open, selectedTicket, user?._id]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="flex items-center justify-center"
    >
      <Box className="relative bg-white rounded-xl w-125 overflow-y-auto shadow-xl mx-auto p-6">
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
              Name <span className="text-red-500">*</span>
            </Typography>
            <TextField
              fullWidth
              type="text"
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ticket name "
              sx={{ "& .MuiOutlinedInput-root": { fontSize: "14px" } }}
            />
            {showError && !name.trim() && (
              <Typography sx={{ fontSize: "12px", color: "#ef4444", mt: 0.5 }}>
                Name is required
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
              value={selectedProject?._id || ""}
              onChange={(e) => {
                const project = projects.find(
                  (p: any) => p._id === e.target.value
                );
                setSelectedProject(project);
              }}
              sx={{ fontSize: "14px", textTransform: "capitalize" }}
            >
              <MenuItem value="" disabled>
                Select project
              </MenuItem>
              {projects.map((project) => (
                <MenuItem
                  key={project._id}
                  value={project._id}
                  sx={{ textTransform: "capitalize" }}
                >
                  {project.name}
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
