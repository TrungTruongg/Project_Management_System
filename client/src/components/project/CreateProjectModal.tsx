import { useEffect, useState } from "react";
import { IoMdClose as CloseIcon } from "react-icons/io";

import {
  Box,
  Button,
  Chip,
  ListItemText,
  MenuItem,
  Modal,
  Select,
  TextareaAutosize,
  TextField,
  Typography,
} from "@mui/material";
import { createNotification } from "../utils/createNotification";
import { useUser } from "../context/UserContext";
import api from "../api/axiosConfig";

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
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user } = useUser();

  const isUpdate = !!selectedProject;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setShowError(true);
      return;
    } if (new Date(startDate) >= new Date(endDate)) {
      setShowError(true);
      return
    } if (new Date(endDate) < new Date()) {
      setShowError(true);
      return
    }

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
      setShowError(false);
      setLoading(false);
    }
    fetchUsers();
  }, [open, selectedProject, user]);

  return (
    <Modal
      aria-labelledby="spring-modal-title"
      aria-describedby="spring-modal-description"
      open={open}
      onClose={onClose}
      closeAfterTransition
      className="flex items-center justify-center"
    >
      <Box className="relative bg-white rounded-xl w-125 overflow-y-auto shadow-xl mx-auto p-6">
        <Box className="flex items-center justify-between mb-8">
          <Typography
            sx={{
              fontSize: "18px",
              lineHeight: "28px",
              fontWeight: 600,
              color: "black",
            }}
          >
            {isUpdate ? "Update Project" : "Create Project"}
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
              transition: "all 0.2s",
            }}
          >
            <CloseIcon className="w-10 h-10" />
          </Button>
        </Box>

        <Box component="form" className="space-y-4" onSubmit={handleSave}>
          <Box className=" gap-4">
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                mb: 0.5,
                color: "#374151",
              }}
            >
              Name <span className="text-red-500">*</span>
            </Typography>
            <TextField
              fullWidth
              type="text"
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Type title of project..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "14px",
                  color: "black",
                },
                border: "1px solid #d1d5db",
                borderRadius: "4px",
              }}
            />
            {showError && !name.trim() && (
              <Typography sx={{ fontSize: "12px", color: "#ef4444", mt: 0.5 }}>
                Name is required
              </Typography>
            )}
          </Box>

          <Box className="gap-4">
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                mb: 0.5,
                color: "#374151",
              }}
            >
              Description
            </Typography>
            <TextareaAutosize
              placeholder="Type description..."
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
                color: "black",
              }}
            />
          </Box>

          <Box className="flex gap-4">
            <Box className="w-full">
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  mb: 0.5,
                  color: "#374151",
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
                    fontSize: "14px",
                    color: "black"
                  },
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                }}
              />
            </Box>

            <Box className="w-full">
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  mb: 0.5,
                  color: "#374151",
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
                    fontSize: "14px",
                    color: "black"
                  },
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                }}
              />

              {showError && startDate >= endDate && (
                <Typography sx={{ fontSize: "12px", color: "#ef4444", mt: 0.5 }}>
                  End Date cannot smaller or equal than Start Date
                </Typography>
              )}

              {showError && new Date(endDate) < new Date() && (
                <Typography sx={{ fontSize: 12, color: "#ef4444", mt: 0.5 }}>
                  End Date cannot be in the past
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                mb: 0.5,
                color: "#374151",
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
                          sx={{ color: "black" }}
                        />
                      );
                    })}
                  </Box>
                );
              }}
              sx={{
                fontSize: "14px",
                textTransform: "capitalize",
                color: members.length === 0 ? "#9ca3af" : "#111827",
              }}
            >
              {users.length === 0 ? (
                <MenuItem disabled>
                  <Typography sx={{ fontSize: "14px", fontStyle: "italic" }}>
                    No other users available
                  </Typography>
                </MenuItem>
              ) : (
                users.map((u: any) => (
                  <MenuItem value={u._id} key={u._id}>
                    <ListItemText
                      primary={`${u.firstName} ${u.lastName}`}
                      secondary={u.email.toLowerCase()}
                    />
                  </MenuItem>
                ))
              )}
            </Select>
          </Box>
     
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontWeight: 500,
                mb: 0.5,
                color: "#374151",
              }}
              className="text-[14px]"
            >
              Priority
            </Typography>
            <Select
              fullWidth
              displayEmpty
              size="small"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              sx={{
                fontSize: "14px",
                color: priority === "" ? "#9ca3af" : "#111827",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
              }}
            >
              <MenuItem value="" disabled>
                Choose priority
              </MenuItem>
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
              sx={{bgcolor: "#9333ea", color: "white"}}
            >
              {isUpdate ? "Update" : "Save"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

export default CreateProjectModal;
