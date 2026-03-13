import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  Snackbar,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { GoPlusCircle as AddIcon } from "react-icons/go";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddMemberModal from "./AddMemberModal";
import { useSearch } from "../context/SearchContext";
import { useUser } from "../context/UserContext";
import api from "../api/axiosConfig";

function MemberList() {
  const [users, setUsers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { searchTerm, setSearchTerm } = useSearch();
  const { user } = useUser();
  const [tabValue, setTabValue] = useState(0);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [taskRes, userRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/users"),
      ]);

      setUsers(userRes.data);
      setTasks(taskRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  // Get tasks where the user is the leader
  const getTaskLeader = () => {
    if (!user) return [];
    return tasks.filter((task) => task.leaderId === user._id);
  };

  // Get tasks where the user is a member 
  const getTaskMemebers = () => {
    if (!user) return [];
    return tasks.filter(
      (task) => task.leaderId === user._id || task.assignedTo?.includes(user._id)
    );
  };

  const taskLeader = getTaskLeader();
  const taskMembers = getTaskMemebers();

  // Get workspace members (Leaders only)
  const getWorkspaceMembers = () => {
    const leadersSet = new Set<number>();

    taskMembers.forEach((task) => {
      leadersSet.add(task.leaderId);
    });

    return Array.from(leadersSet).map((leaderId) => {
      const leader = users.find((u) => u._id === leaderId);
      return leader;
    }).filter(Boolean);
  };

  // Get guests (Tasks members who are not leaders)
  const getGuests = () => {
    const leaderIds = new Set(taskLeader.map((t) => t.leaderId));
    const guestsMap = new Map<number, any>();

    taskMembers.forEach((task) => {
      task.assignedTo?.forEach((memberId: number) => {
        if (!leaderIds.has(memberId) && !guestsMap.has(memberId)) {
          const member = users.find((u) => u._id === memberId);
          if (member) {
            guestsMap.set(memberId, member);
          }
        }
      });
    });

    return Array.from(guestsMap.values());
  };

  const workspaceMembers = getWorkspaceMembers();
  const guests = getGuests();

  const getFilteredMembers = () => {
    const members = tabValue === 0 ? workspaceMembers : guests;

    if (!searchTerm.trim()) return members;

    return members.filter((member: any) => {
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
      const email = member.email?.toLowerCase() || '';
      return fullName.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase());
    });
  };

  const filteredMembers = getFilteredMembers();

  const handleAddMember = async () => {
    await fetchAllData();

    setSnackbar({
      open: true,
      message: "Add member successfully!",
      type: "success",
    });
  };

  const handleOpenAddMemberModal = () => {
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleViewProfile = (member: any) => {
    navigate("/member-profile", { state: { memberId: member._id } });
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSearchTerm("");
  };

  const handleRemoveMember = async (memberId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const memberTasks = taskMembers.filter((task) =>
        task.assignedTo?.includes(memberId)
      );

      // Remove member 
      for (const task of memberTasks) {
        const updatedMembers = task.assignedTo.filter((id: string) => id !== memberId);

        await api.put(`/tasks/update/${task._id}`, {
          name: task.name,
          description: task.description,
          startDate: task.startDate,
          endDate: task.endDate,
          leaderId: task.leaderId,
          assignedTo: updatedMembers,
        });
      }

      // Refresh data
      await fetchAllData();
    } catch (err) {
      console.error("Error removing member:", err);
    }
  };

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Typography fontSize="1.5rem" fontWeight="700">
              Members
            </Typography>

            <Chip
              label={`${workspaceMembers.length + guests.length}`}
              size="small"
              sx={{
                fontSize: "14px",
                fontWeight: 500,
              }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <IconButton
              onClick={fetchAllData}
              disabled={loading}
              sx={{ color: "text.secondary" }}
              title="Refresh members"
            >
              <RefreshIcon />
            </IconButton>

            <Button
              variant="contained"
              size="medium"
              startIcon={<AddIcon />}
              onClick={handleOpenAddMemberModal}
              disabled={taskLeader.length === 0}
              sx={{
                backgroundColor: "#484c7f",
                color: "white",
                textTransform: "none",
                px: 3,
              }}
            >
              Add Members
            </Button>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Task Leaders
                  <Chip
                    label={workspaceMembers.length}
                    size="small"
                    sx={{ height: 20, fontSize: '0.75rem' }}
                  />
                </Box>
              }
              sx={{ textTransform: "none", fontWeight: 600 }}
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Task Members
                  <Chip
                    label={guests.length}
                    size="small"
                    sx={{ height: 20, fontSize: '0.75rem' }}
                  />
                </Box>
              }
              sx={{ textTransform: "none", fontWeight: 600 }}
            />
          </Tabs>
        </Box>

        {/* Description */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {tabValue === 0
            ? "Leaders can view and participate in all visible tasks and create new tasks."
            : "Members can only view and edit tasks they've been added to.."
          }
        </Typography>

      </Box>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 10,
          }}
        >
          <CircularProgress />
        </Box>
      ) : taskMembers.length === 0 ? (
        <Typography fontStyle="italic">
          You are not part of any tasks yet.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {filteredMembers.map((member: any) => {

            return (
              <Card
                key={member._id}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "action.hover",
                    borderColor: "primary.main",
                  },
                  cursor: "pointer",
                }}
                onClick={() => handleViewProfile(member)}
              >
                <Avatar
                  src={member.avatar}
                  sx={{
                    width: 40,
                    height: 40,
                    fontSize: 16,
                    bgcolor: tabValue === 0 ? "#0c66e4" : "#6b778c",
                    color: "white",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  {member.firstName?.[0]}
                  {member.lastName?.[0]}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  >
                    {member.firstName} {member.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {member.email}
                  </Typography>
                </Box>

                {tabValue === 0 && (
                  <Chip
                    label="Leader"
                    size="small"
                    sx={{
                      bgcolor: "#e3f2fd",
                      color: "#0c66e4",
                      fontSize: "12px",
                      height: "24px",
                      fontWeight: 500,
                    }}
                  />
                )}

                {tabValue === 1 && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    sx={{
                      textTransform: "none",
                      fontSize: "12px",
                    }}
                    onClick={(e) => handleRemoveMember(member._id, e)}
                  >
                    Remove
                  </Button>
                )}
              </Card>
            )
          })}
        </Box>
      )}

      <AddMemberModal
        open={open}
        onClose={handleCloseModal}
        onSave={handleAddMember}
        taskLeader={taskLeader}
        allUsers={users}
        allTasks={tasks}
      />

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

export default MemberList;