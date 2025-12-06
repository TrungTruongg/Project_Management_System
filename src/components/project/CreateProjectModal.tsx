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
import axios from "axios";

function CreateProjectModal({
  open,
  onClose,
  onSave,
  onUpdate,
  projectList = [],
  selectedProject = null,
}: any) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState("");
  const [leaderId, setLeaderId] = useState<number | "">("");
  const [member, setMember] = useState<number[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);

  const isUpdate = selectedProject !== null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setShowError(true);
      return;
    }

    setLoading(true);

    try {
      if (isUpdate) {
        const updatedProject = {
          id: selectedProject.id,
          title: title,
          description: description,
          startDate: startDate,
          endDate: endDate,
          leaderId: leaderId,
          member: member,
          priority: priority.toLowerCase(),
          completion: selectedProject.completion || 0,
        };

        const response = await axios.put(
          `https://mindx-mockup-server.vercel.app/api/resources/projects/${selectedProject._id}?apiKey=69205e8dbf3939eacf2e89f2`,
          updatedProject
        );

        onUpdate(response.data.data);
      } else {
        const maxId =
          projectList.length > 0
            ? Math.max(...projectList.map((p: any) => p.id))
            : 0;

        const newProject = {
          id: maxId + 1,
          title: title,
          description: description,
          startDate: startDate,
          endDate: endDate,
          leaderId: leaderId,
          member: member,
          priority: priority.toLowerCase(),
          completion: 0,
        };

        const response = await axios.post(
          "https://mindx-mockup-server.vercel.app/api/resources/projects?apiKey=69205e8dbf3939eacf2e89f2",
          newProject
        );

        onSave(response.data.data);

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
      const response = await axios.get(
        "https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=69205e8dbf3939eacf2e89f2"
      );
      setUsers(response.data.data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    if (open) {
      if (selectedProject) {
        // Edit
        setTitle(selectedProject.title || "");
        setDescription(selectedProject.description || "");
        setStartDate(selectedProject.startDate || "");
        setEndDate(selectedProject.endDate || "");
        setPriority(selectedProject.priority || "");
        setLeaderId(selectedProject.leaderId || "");
        setMember(
          Array.isArray(selectedProject.member)
            ? selectedProject.member
            : selectedProject.member
              ? [selectedProject.member]
              : []
        );
      } else {
        // Create
        setTitle("");
        setDescription("");
        setStartDate("");
        setEndDate("");
        setPriority("");
        setLeaderId("");
        setMember([]);
      }
      setShowError(false);
      setLoading(false);
    }
    fetchUsers();
  }, [open, selectedProject]);

  const leaderUsers = users.filter((user: any) => user.role === "leader");
  const staffUsers = users.filter((user: any) => user.role === "member");

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
              Title <span className="text-red-500">*</span>
            </Typography>
            <TextField
              fullWidth
              type="text"
              size="small"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Type title of project..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "14px",
                },
              }}
            />
            {showError && !title.trim() && (
              <Typography sx={{ fontSize: "12px", color: "#ef4444", mt: 0.5 }}>
                Title is required
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
                  },
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
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontSize: "14px",
                  },
                }}
              />
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
              Task Assign Person
            </Typography>

            <Select
              fullWidth
              size="small"
              multiple
              onChange={(e) => {
                const value = e.target.value;
                setMember(typeof value === "string" ? [] : value);
              }}
              value={member}
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return (
                    <span style={{ color: "#9ca3af" }}>Choose members</span>
                  );
                }
                return (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((userId: number) => {
                      const user = users.find((u: any) => u.id === userId);
                      return (
                        <Chip
                          key={userId}
                          label={`${user?.firstName} ${user?.lastName}`}
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
                color: member.length === 0 ? "#9ca3af" : "#111827",
              }}
            >
              {staffUsers.map((user: any) => (
                <MenuItem value={user.id} key={user.id}>
                 
                  <ListItemText
                    primary={`${user.firstName} ${user.lastName}`}
                    secondary={user.role}
                    sx={{  textTransform: "capitalize" }}
                  />
                </MenuItem>
              ))}
            </Select>
             {/* <Typography
              variant="caption"
              sx={{ color: "text.secondary", mt: 0.5, display: "block" }}
            >
              {member.length} member{member.length !== 1 ? "s" : ""} selected
            </Typography> */}
          </Box>

          {/* Choose Leader */}
          <Box>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                mb: 0.5,
                color: "#374151",
              }}
            >
              Choose Leader <span className="text-red-500">*</span>
            </Typography>
            <Select
              fullWidth
              size="small"
              displayEmpty
              value={leaderId}
              onChange={(e) => setLeaderId(e.target.value)}
              sx={{
                fontSize: "14px",
                color: leaderId === "" ? "#9ca3af" : "#111827",
              }}
            >
              <MenuItem value="" disabled>
                <span style={{ color: "#9ca3af" }}>Choose leader</span>
              </MenuItem>
              {leaderUsers.map((user: any) => (
                <MenuItem
                  value={user.id}
                  key={user.id}
                  sx={{ fontSize: "14px" }}
                >              
                  <Typography>{user.firstName} {user.lastName}</Typography>  
                </MenuItem>

              ))}
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
              {isUpdate ? "Update" : "Save"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

export default CreateProjectModal;
