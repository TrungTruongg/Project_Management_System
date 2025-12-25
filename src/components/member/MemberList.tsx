import { CalendarToday, People } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import { GoPlusCircle as AddIcon } from "react-icons/go";
import { BiTask as TotalTaskIcon } from "react-icons/bi";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AddMemberModal from "./AddMemberModal";
import { useSearch } from "../context/SearchContext";

const API_KEY = import.meta.env.VITE_API_KEY;

function MemberList() {
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { searchTerm } = useSearch();

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [userRes, projectRes, taskRes] = await Promise.all([
        axios.get(
          `https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=${API_KEY}`
        ),
        axios.get(
          `https://mindx-mockup-server.vercel.app/api/resources/projects?apiKey=${API_KEY}`
        ),
        axios.get(
          `https://mindx-mockup-server.vercel.app/api/resources/tasks?apiKey=${API_KEY}`
        ),
      ]);

      setUsers(userRes.data.data.data);
      setProjects(projectRes.data.data.data);
      setTasks(taskRes.data.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAllData();
  }, []);

  const memberIds = new Set<number>(
    projects.flatMap((project) => project.members || [])
  );

  const members = users.filter((user) => memberIds.has(user.id));

  const filteredMembers = members.filter((member: any) => {
    if (!searchTerm.trim()) return true;

    const user = users.find((u: any) => u.id === member.userId);
    if (!user) return false;

    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();

    return fullName.includes(searchTerm.toLowerCase());
  });

  const handleAddMember = (newMember: any) => {
    setProjects([...members, newMember]);
  };

  const getTaskCount = (userId: number) => {
    return tasks.filter((task: any) => {
      if (Array.isArray(task.assignedTo)) {
        return task.assignedTo.includes(userId);
      }
      return task.assignedTo === userId;
    }).length;
  };

  const handleAddTask = () => {
    navigate("/task");
  };

  const handleOpenAddMemberModal = () => {
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleViewProfile = (member: any) => {
    navigate("/member-profile", { state: { memberId: member.id } });
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Members
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: "#484c7f",
            color: "white",
            textTransform: "none",
          }}
          onClick={handleOpenAddMemberModal}
        >
          Add Member
        </Button>
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
      ) : filteredMembers.length === 0 ? (
        <Typography fontStyle="italic" >No members available!</Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredMembers.map((member: any) => {
            const taskCount = getTaskCount(member.userId);

            return (
             <Grid key={member.id}>
                <Card sx={{ boxShadow: 2, "&:hover": { boxShadow: 4 } }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", gap: 3 }}>
                      {/* Avatar */}
                      <Box>
                        <Avatar
                          sx={{
                            width: 90,
                            height: 90,
                            fontSize: 36,
                            textTransform: "uppercase",
                          }}
                        >
                          {member.firstName[0]}
                          {member.lastName[0]}
                        </Avatar>

                        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                          <TotalTaskIcon />
                          <Typography variant="body2">
                            {taskCount} Tasks
                          </Typography>
                        </Box>
                      </Box>

                      {/* Info */}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold">
                          {member.firstName} {member.lastName}
                        </Typography>

                        <Chip
                          label={member.role}
                          size="small"
                          sx={{ bgcolor: "#E1BEE7", color: "#6A1B9A", mb: 2 }}
                        />

                        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                          <CalendarToday sx={{ fontSize: 14 }} />
                          <Typography variant="caption">
                            {new Date(member.joinDate).toLocaleDateString(
                              "en-GB",
                              { day: "2-digit", month: "short" }
                            )}
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", gap: 2 }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={handleAddTask}
                            sx={{ textTransform: "none" }}
                          >
                            Add Task
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<People />}
                            sx={{ textTransform: "none" }}
                            onClick={() => handleViewProfile(member)}
                          >
                            Profile
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
      <AddMemberModal
        open={open}
        onClose={handleCloseModal}
        onSave={handleAddMember}
        memberList={members}
      />
    </>
  );
}

export default MemberList;
