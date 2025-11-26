import { useEffect, useState } from "react";
import { IoMdClose as CloseIcon } from "react-icons/io";

import {
  Avatar,
  Box,
  Button,
  Chip,
  MenuItem,
  Modal,
  Select,
  TextareaAutosize,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";

function AddMemberModal({
  open,
  onClose,
  onSave,
  memberList = [],
  projectId = 1,
}: any) {
  const [selectedUserId, setSelectedUserId] = useState<number | string>("");
  const [role, setRole] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=69205e8dbf3939eacf2e89f2"
      );
      setUsers(response.data.data.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    if (open) {
      fetchUsers();
      // Reset form
      setSelectedUserId("");
      setRole("");
      setJoinDate(new Date().toISOString().split("T")[0]); // Default today
      setShowError(false);
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const getAvailableUsers = () => {
    const memberUserIds = memberList.map((m: any) => m.userId);
    return users.filter((user) => !memberUserIds.includes(user.id));
  };

  const availableUsers = getAvailableUsers();

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId || !role.trim()) {
      setShowError(true);
      return;
    }

    setLoading(true);

    try {
      const maxId =
        memberList.length > 0
          ? Math.max(...memberList.map((p: any) => p.id))
          : 0;

      const newMember = {
        id: maxId + 1,
        projectId: projectId,
        userId: selectedUserId,
        role: role,
        joinDate: joinDate,
        status: "active",
      };

      const response = await axios.post(
        "https://mindx-mockup-server.vercel.app/api/resources/projectMembers?apiKey=69205e8dbf3939eacf2e89f2",
        newMember
      );

      onSave(response.data.data);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      aria-labelledby="spring-modal-title"
      aria-describedby="spring-modal-description"
      open={open}
      onClose={onClose}
      closeAfterTransition
      className="flex items-center justify-center"
    >
      <Box className="relative bg-white rounded-xl w-[500px] overflow-y-auto shadow-xl mx-auto p-6">
        <Box className="flex items-center justify-between mb-8">
          <Typography
            sx={{
              fontSize: "18px",
              lineHeight: "28px",
              fontWeight: 600,
            }}
          >
            Add Member
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
          <Box className="gap-4">
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                mb: 0.5,
                color: "#374151",
              }}
            >
              Select User <span className="text-red-500">*</span>
            </Typography>
            <Select
              fullWidth
              displayEmpty
              size="small"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
              sx={{
                fontSize: "14px",
                color: selectedUserId === "" ? "#9ca3af" : "#111827",
              }}
            >
              <MenuItem value="" disabled>
                Choose a user to add
              </MenuItem>
              {availableUsers.length === 0 ? (
                <MenuItem value="" disabled>
                  All users have been added to this project
                </MenuItem>
              ) : (
                availableUsers.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: "14px" }}>
                        {user.avatar}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
                          {user.name}
                        </Typography>
                        <Typography
                          sx={{ fontSize: "12px", color: "text.secondary" }}
                        >
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
            {showError && !selectedUserId && (
              <Typography sx={{ fontSize: "12px", color: "#ef4444", mt: 0.5 }}>
                Please select a user
              </Typography>
            )}
          </Box>

          {/* Preview selected user */}
          {selectedUser && (
            <Box
              sx={{
                p: 2,
                bgcolor: "#f9fafb",
                borderRadius: 1,
                border: "1px solid #e5e7eb",
              }}
            >
              <Typography sx={{ fontSize: "12px", color: "#6b7280", mb: 1 }}>
                Selected User:
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ width: 40, height: 40, fontSize: "18px" }}>
                  {selectedUser.avatar}
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
                    {selectedUser.name}
                  </Typography>
                  <Typography
                    sx={{ fontSize: "12px", color: "text.secondary" }}
                  >
                    {selectedUser.email}
                  </Typography>
                  <Chip
                    label={selectedUser.role}
                    size="small"
                    sx={{
                      mt: 0.5,
                      height: 20,
                      fontSize: "11px",
                      bgcolor: "#E1BEE7",
                      color: "#6A1B9A",
                    }}
                  />
                </Box>
              </Box>
            </Box>
          )}

          {/* Role in Project */}
          <Box className="gap-4">
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                mb: 0.5,
                color: "#374151",
              }}
            >
              Role in Project <span className="text-red-500">*</span>
            </Typography>
            <Select
              fullWidth
              displayEmpty
              size="small"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              sx={{
                fontSize: "14px",
                color: role === "" ? "#9ca3af" : "#111827",
              }}
            >
              <MenuItem value="" disabled>
                Choose role
              </MenuItem>
              <MenuItem value="leader">Leader</MenuItem>
              <MenuItem value="member">Member</MenuItem>
              <MenuItem value="developer">Developer</MenuItem>
              <MenuItem value="designer">Designer</MenuItem>
              <MenuItem value="tester">Tester</MenuItem>
            </Select>
            {showError && !role.trim() && (
              <Typography sx={{ fontSize: "12px", color: "#ef4444", mt: 0.5 }}>
                Please select a role
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
              Join Date
            </Typography>
            <TextField
              fullWidth
              type="date"
              size="small"
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "14px",
                },
              }}
            />
          </Box>

          {/* Info message */}
          <Box
            sx={{
              p: 2,
              bgcolor: "#eff6ff",
              borderRadius: 1,
              border: "1px solid #bfdbfe",
            }}
          >
            <Typography sx={{ fontSize: "12px", color: "#1e40af" }}>
              ℹ️ <strong>Note:</strong> Only users who have already registered can be added as members. 
              User information (name, email, avatar) will be automatically imported from their account.
            </Typography>
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
              variant="contained"
              type="submit"
              loading={loading}
              loadingPosition="end"
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
              {loading ? "Adding..." : "Add Member"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

export default AddMemberModal;
