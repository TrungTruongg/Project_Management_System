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
} from "@mui/material";
import axios from "axios";

const API_KEY = import.meta.env.VITE_API_KEY;

function AddMemberModal({
  open,
  onClose,
  onSave,
  selectedProject = null,
  allUsers = [],
  allProjects = [],
}: any) {
  const [email, setEmail] = useState("");
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const getAvailableUsers = () => {
    return allUsers.filter((user: any) => {
      if (selectedProject?.members?.includes(user.id)) return false;
      if (user.id === selectedProject?.ownerId) return false;

      const hasProject = allProjects.some((project: any) => 
        project.ownerId === user.id || project.members?.includes(user.id)
      );

      return !hasProject; 
    });
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);

    if (!value.trim()) {
      setSuggestions([]);
      setSelectedUser(null);
      return;
    }

    const filtered = allUsers.filter(
      (u: any) =>
        !selectedProject?.members?.includes(u.id) &&
        u.id !== selectedProject?.ownerId &&
        (u.firstName.toLowerCase().includes(value.toLowerCase()) ||
          u.lastName.toLowerCase().includes(value.toLowerCase()) ||
          u.email.toLowerCase().includes(value.toLowerCase()))
    );

    setSuggestions(filtered.slice(0, 5));
  };

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    setEmail(`${user.firstName} ${user.lastName}`);
    setSuggestions([]);
  };

  useEffect(() => {
    if (open) {
      setEmail("");
      setSelectedUser(null);
      setSuggestions([]);
      setShowError(false);
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) {
      setShowError(true);
      return;
    }

    if (!selectedProject?._id) {
      alert("Not found project info. try again!");
      return;
    }

    setLoading(true);

    try {
      const updatedProject = {
        ...selectedProject,
        members: [...(selectedProject.members || []), selectedUser.id],
      };

      await axios.put(
        `https://mindx-mockup-server.vercel.app/api/resources/projects/${selectedProject._id}?apiKey=${API_KEY}`,
        updatedProject
      );

      const newMember = {
        projectId: selectedProject.id,
        userId: selectedUser.id,
        role: "Member",
        joinDate: new Date().toISOString().split("T")[0],
        status: "active",
      };

      onSave(newMember);
      onClose();
    } catch (error) {
      console.error("Error adding member:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

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
          <Typography
            sx={{
              fontSize: "18px",
              lineHeight: "28px",
              fontWeight: 600,
            }}
          >
            Add members
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


        {availableCount === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography sx={{ color: "#6b7280", fontStyle: "italic" }}>
              Không có thành viên mới nào để thêm vào project này.
              <br />
              Tất cả user đã tham gia project.
            </Typography>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{ mt: 3 }}
            >
              Đóng
            </Button>
          </Box>
        ) : (    
        <Box component="form" className="space-y-4" onSubmit={handleSave}>
          {/* Email or Name Input */}
          <Box>
            <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  mb: 1,
                  color: "#374151",
                }}
              >
                Tìm kiếm thành viên <span className="text-red-500">*</span>
              </Typography>
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "#6b7280",
                  mb: 1,
                }}
              >
                Có {availableCount} thành viên mới chưa tham gia project nào
              </Typography>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                mb: 1,
                color: "#374151",
              }}
            >
              Email <span className="text-red-500">*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Example: trung@acb.com"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              error={showError && !selectedUser}
              helperText={showError && !selectedUser ? "Choose at least one" : ""}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "14px",
                },
              }}
            />

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <Paper
                sx={{
                  mt: 1,
                  maxHeight: 300,
                  overflow: "auto",
                  border: "1px solid #e5e7eb",
                }}
              >
                <List sx={{ p: 0 }}>
                  {suggestions.map((user) => (
                    <ListItem
                      key={user.id}
                      disablePadding
                      sx={{
                        "&:hover": { bgcolor: "#f3f4f6" },
                      }}
                    >
                      <ListItemButton
                        onClick={() => handleSelectUser(user)}
                        sx={{ py: 1 }}
                      >
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
                            {user.firstName?.[0]}
                            {user.lastName?.[0]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${user.firstName} ${user.lastName}`}
                          secondary={user.email}
                          primaryTypographyProps={{ fontSize: "14px" }}
                          secondaryTypographyProps={{ fontSize: "12px" }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Box>

          {/* Selected User Preview */}
          {selectedUser && (
            <Box
              sx={{
                p: 2,
                bgcolor: "#f9fafb",
                borderRadius: 1,
                border: "1px solid #e5e7eb",
              }}
            >
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
                  {selectedUser.firstName?.[0]}
                  {selectedUser.lastName?.[0]}
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
              disabled={loading || !selectedUser}
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
