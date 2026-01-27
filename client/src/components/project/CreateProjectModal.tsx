import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  ListItemText,
  MenuItem,
  Modal,
  Select,
  Snackbar,
  TextareaAutosize,
  TextField,
  Typography,
} from "@mui/material";
import { createNotification } from "../utils/createNotification";
import { useUser } from "../context/UserContext";
import api from "../api/axiosConfig";
import HighPriority from "../../assets/HighPriority";
import MediumPriority from "../../assets/MediumPriority";
import LowPriority from "../../assets/LowPriority";

function CreateProjectModal({
  open,
  onClose,
  onSave,
  onUpdate,
  selectedProject = null,
}: any) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const { user } = useUser();

  const isUpdate = !!selectedProject;

  const validateDates = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start >= end) {
      setSnackbar({
        open: true,
        message: "End Date must be after Start Date",
        type: "error",
      });
      return;
    }
    if (end < now) {
      setSnackbar({
        open: true,
        message: "End Date cannot be in the past",
        type: "error",
      });
      return;
    }
   
    return true;
  };

  const validateForm = () => {
    if (!name.trim() || !priority) {
      setShowError(true);
      return false;
    }
    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const dateError = validateDates();
    if (!dateError) return;

    setLoading(true);

    try {
      if (isUpdate) {
        const updatedProject = {
          name: name,
          description: description,
          startDate: startDate,
          endDate: endDate,
          leaderId: selectedProject.leaderId,
          members: members,
          priority: priority.toLowerCase(),
          completion: selectedProject.completion || 0,
        };

        const response = await api.put(`/projects/update/${selectedProject._id}`,
          updatedProject
        );

        await createNotification({
          userId: members,
          type: "project",
          title: `Updated Project`,
          description: `updated project ${name}`,
          createdBy: user?._id,
        });

        onUpdate(response.data.project);

        setSnackbar({
          open: true,
          message: "Update project successfully!",
          type: "success",
        });
      } else {
        const newProject = {
          name,
          description: description,
          startDate: startDate,
          endDate: endDate,
          leaderId: user?._id,
          members: members,
          priority: priority.toLowerCase(),
          completion: 0,
        };

        const response = await api.post("/projects/create",
          newProject
        );

        await createNotification({
          userId: members,
          type: "project",
          title: `New Project Assignment`,
          description: `created project ${name}`,
          createdBy: user?._id,
        });

        if (members.length > 0) {
          await createNotification({
            userId: members,
            type: "project",
            title: `Added to Project`,
            description: `added you to project: ${name}`,
            createdBy: user?._id,
          });
        }

        onSave(response.data);

        setSnackbar({
          open: true,
          message: "Create project successfully!",
          type: "success",
        });
      }
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");

      const otherUsers = response.data.filter(
        (u: any) => u._id !== user?._id
      );

      setUsers(otherUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    if (open) {
      setShowError(false);
      if (selectedProject) {
        // Edit   
        setName(selectedProject.name || "");
        setDescription(selectedProject.description || "");
        setStartDate(selectedProject.startDate || "");
        setEndDate(selectedProject.endDate || "");
        setPriority(selectedProject.priority || "");
        setMembers(
          Array.isArray(selectedProject.members)
            ? selectedProject.members
            : []
        );
      } else {
        // Create
        setName("");
        setDescription("");
        setStartDate("");
        setEndDate("");
        setPriority("");
        setMembers([]);
      }
      setLoading(false);
    }
    fetchUsers();
  }, [open, selectedProject, user]);

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
      >
        <Box
          component="form"
          onSubmit={handleSave}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: '500px',
            bgcolor: "background.paper",
            borderRadius: "8px",
            boxShadow: 24,
            display: "flex",
            flexDirection: "column",
          }}>
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid #e5e7eb",
              flexShrink: 0,
            }}>
            <Typography
              sx={{
                fontSize: "18px",
                lineHeight: "28px",
                fontWeight: 600,
              }}
            >
              {isUpdate ? "Update Project" : "Create Project"}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 2,
              overflow: "auto",
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              gap: 2
            }}>
            <Box>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  mb: 0.5,
                }}
              >
                Name <span className="text-red-500">*</span>
              </Typography>
              <TextField
                fullWidth
                type="text"
                size="small"
                value={name}
                error={showError && !name.trim()}
                onChange={(e) => setName(e.target.value)}
                placeholder="Type title of project..."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontSize: "14px"
                  },
                }}
              />
              {showError && !name.trim() && (
                <Typography sx={{ fontSize: "12px", color: "#ef4444", mt: 0.5 }}>
                  Task name is required
                </Typography>
              )}
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  mb: 0.5,
                }}
              >
                Description
              </Typography>
              <Box
                sx={{
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  "&:focus-within": {
                    border: "2px solid #1976d2",
                  },
                  "& textarea": {
                    "&::placeholder": {
                      color: "#9ca3af",
                    },
                  },
                }}
              >
                <TextareaAutosize
                  placeholder="Type description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  minRows={3}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "14px",
                    resize: "none",
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                />
              </Box>
            </Box>

            <Box className="flex gap-4">
              <Box className="w-full">
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    mb: 0.5,
                  }}
                >
                  Start Date
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "14px"
                    }
                  }}
                />
              </Box>

              <Box className="w-full">
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    mb: 0.5
                  }}
                >
                  End Date
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  value={startDate ? endDate : ""}
                  onChange={(e) => setEndDate(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "14px"
                    }
                  }}
                />
              </Box>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  mb: 0.5
                }}
              >
                Invite Members
              </Typography>

              <Select
                fullWidth
                size="small"
                multiple
                onChange={(e) => {
                  const value = e.target.value;
                  setMembers(typeof value === "string" ? [] : value);
                }}
                value={members}
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return (
                      <span style={{ color: "#9ca3af" }}>Choose members</span>
                    );
                  }
                  return (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((userId: any) => {
                        const member = users.find((u: any) => u._id === userId);
                        return (
                          <Chip
                            key={userId}
                            label={`${member?.firstName} ${member?.lastName}`}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  );
                }}
                sx={{
                  fontSize: "14px",
                  textTransform: "capitalize",
                  color: members.length === 0 ? "#9ca3af" : "",
                }}
              >
                {users.length === 0 ? (
                  <MenuItem disabled>
                    <Typography sx={{ fontSize: "14px", fontStyle: "italic" }}>
                      No other users available
                    </Typography>
                  </MenuItem>
                ) : (
                  users.map((user: any) => (
                    <MenuItem value={user._id} key={user._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          src={user.avatar}
                          sx={{
                            width: 32,
                            height: 32,
                            fontSize: "12px",
                            bgcolor: "#E0E0E0",
                            color: "#484c7f",
                            fontWeight: 600,
                            textTransform: "uppercase",
                          }}
                          title={`${user.firstName} ${user.lastName}`}
                        >
                          {user.firstName?.[0]}
                          {user.lastName?.[0]}
                        </Avatar>
                        <ListItemText
                          primary={`${user.firstName} ${user.lastName}`}
                          secondary={user.email.toLowerCase()}
                        />
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  mb: 0.5,
                }}
              >
                Priority <span className="text-red-500">*</span>
              </Typography>
              <Select
                fullWidth
                displayEmpty
                size="small"
                value={priority}
                error={showError && !priority}
                onChange={(e) => setPriority(e.target.value)}
                sx={{
                  fontSize: "14px",
                  color: priority === "" ? "#9ca3af" : ""
                }}
              >
                <MenuItem value="" disabled>
                  Choose priority
                </MenuItem>
                <MenuItem value="high">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HighPriority />
                    <span>High</span>
                  </Box>
                </MenuItem>
                <MenuItem value="medium">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MediumPriority />
                    <span>Medium</span>
                  </Box>
                </MenuItem>
                <MenuItem value="low">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LowPriority />
                    <span>Low</span>
                  </Box>
                </MenuItem>
              </Select>
              {showError && !priority && (
                <Typography sx={{ fontSize: "12px", color: "#ef4444", mt: 0.5 }}>
                  Priority is required
                </Typography>
              )}
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
                  "&:hover": {
                    borderColor: "#9ca3af",
                    backgroundColor: "#f9fafb",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                // variant="text"
                type="submit"
                loading={loading}
                loadingPosition="end"
                sx={{ bgcolor: "#9333ea", color: "white" }}
              >
                {isUpdate ? "Update" : "Save"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.type}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>

  );
}

export default CreateProjectModal;
