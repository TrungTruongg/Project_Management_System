import { useEffect, useState } from "react";
import { IoMdClose as CloseIcon } from "react-icons/io";

import {
  Avatar,
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import axios from "axios";

const API_KEY = import.meta.env.VITE_API_KEY;

function AddMemberModal({
  open,
  onClose,
  onSave,
  ownerProjects = [],
  allUsers = [],
  allProjects = [],
}: any) {
  const [selectedProjectId, setSelectedProjectId] = useState<number | "">("");
  const [emailOrName, setEmailOrName] = useState("");
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Filter user who are not in any project
  const getAvailableUsers = () => {
    return allUsers.filter((user: any) => {
      const hasProject = allProjects.some((project: any) => 
        project.ownerId === user.id || project.members?.includes(user.id)
      );
      return !hasProject;
    });
  };

  const handleEmailOrNameChange = (value: string) => {
    setEmailOrName(value);

    if (!value.trim()) {
      setSuggestions([]);
      setSelectedUser(null);
      return;
    }

    const availableUsers = getAvailableUsers();
    const searchLower = value.toLowerCase();

    const filtered = availableUsers.filter((u: any) =>
      u.firstName.toLowerCase().includes(searchLower) ||
      u.lastName.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower)
    );

    setSuggestions(filtered.slice(0, 5));
  };

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    setEmailOrName(`${user.firstName} ${user.lastName}`);
    setSuggestions([]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProjectId) {
      alert("Please select project!");
      return;
    }

    if (!selectedUser) {
      setShowError(true);
      return;
    }

    setLoading(true);

    try {
      // Find selected project
      const selectedProject = ownerProjects.find((p: any) => p.id === selectedProjectId);
      
      if (!selectedProject?._id) {
        alert("Project not found!");
        return;
      }

      // Update projects, add users to array members
      const updatedProject = {
        ...selectedProject,
        members: [...(selectedProject.members || []), selectedUser.id],
      };

      await axios.put(
        `https://mindx-mockup-server.vercel.app/api/resources/projects/${selectedProject._id}?apiKey=${API_KEY}`,
        updatedProject
      );

      onSave();
      onClose();
    } catch (error) {
      console.error("Error when adding members:", error);
      alert("Error occurs. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setSelectedProjectId(ownerProjects.length === 1 ? ownerProjects[0].id : "");
      setEmailOrName("");
      setSelectedUser(null);
      setSuggestions([]);
      setShowError(false);
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const availableCount = getAvailableUsers().length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      className="flex items-center justify-center"
    >
      <Box className="relative bg-white rounded-xl w-[500px] overflow-y-auto shadow-xl mx-auto p-6">
        <Box className="flex items-center justify-between mb-6">
          <Typography sx={{ fontSize: "18px", fontWeight: 600 }}>
            Add Member To Project
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

        {ownerProjects.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography sx={{ color: "#6b7280", fontStyle: "italic" }}>
              You dont own any projects.
            </Typography>
            <Button variant="outlined" onClick={onClose} sx={{ mt: 3 }}>
              Close
            </Button>
          </Box>
        ) : availableCount === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography sx={{ color: "#6b7280", fontStyle: "italic" }}>
              No available users to add.
              <br />
              All users are already in projects.
            </Typography>
            <Button variant="outlined" onClick={onClose} sx={{ mt: 3 }}>
              Close
            </Button>
          </Box>
        ) : (
          <Box component="form" className="space-y-4" onSubmit={handleSave}>
            {/* Choose Project */}
            {ownerProjects.length > 1 && (
              <Box>
                <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 1 }}>
                  Choose Project <span className="text-red-500">*</span>
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value as number)}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Choose a project
                    </MenuItem>
                    {ownerProjects.map((project: any) => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            {/* Tìm kiếm User */}
            <Box>
              <TextField
                fullWidth
                size="small"
                placeholder="Input email..."
                value={emailOrName}
                onChange={(e) => handleEmailOrNameChange(e.target.value)}
                error={showError && !selectedUser}
                helperText={showError && !selectedUser ? "Please choose members" : ""}
              />

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <Paper sx={{ mt: 1, maxHeight: 300, overflow: "auto", border: "1px solid #e5e7eb" }}>
                  <List sx={{ p: 0 }}>
                    {suggestions.map((user) => (
                      <ListItem key={user.id} disablePadding sx={{ "&:hover": { bgcolor: "#f3f4f6" } }}>
                        <ListItemButton onClick={() => handleSelectUser(user)} sx={{ py: 1 }}>
                          <ListItemAvatar sx={{ minWidth: 40 }}>
                            <Avatar
                              src={user.avatar}
                              sx={{
                                width: 32,
                                height: 32,
                                fontSize: "12px",
                                bgcolor: "#E0E0E0",
                                textTransform: "uppercase",
                              }}
                            >
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={`${user.firstName} ${user.lastName}`}
                            secondary={user.email}
                            slotProps={{
                              primary: {
                                fontSize: "14px"
                              },
                              secondary: {
                                fontSize: "12px"
                              }
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}

              {emailOrName.trim() && suggestions.length === 0 && !selectedUser && (
                <Typography sx={{ fontSize: "12px", color: "#ef4444", mt: 1, fontStyle: "italic" }}>
                  No matching users found.
                </Typography>
              )}
            </Box>

            {/* Display selected user */}
            {selectedUser && (
              <Box sx={{ p: 2, bgcolor: "#f9fafb", borderRadius: 1, border: "1px solid #e5e7eb" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    src={selectedUser.avatar}
                    sx={{
                      width: 40,
                      height: 40,
                      fontSize: "16px",
                      bgcolor: "#E0E0E0",
                      textTransform: "uppercase",
                    }}
                  >
                    {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: "14px", fontWeight: 600, textTransform: "capitalize" }}>
                      {selectedUser.firstName} {selectedUser.lastName}
                    </Typography>
                    <Typography sx={{ fontSize: "12px", color: "text.secondary" }}>
                      {selectedUser.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button fullWidth variant="outlined" onClick={onClose}>
                Cancel
              </Button>
              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading || !selectedUser || !selectedProjectId}
                sx={{ bgcolor: "#9333ea", "&:hover": { bgcolor: "#7e22ce" } }}
              >
                {loading ? "Adding..." : "Add"}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Modal>
  );
}

export default AddMemberModal;