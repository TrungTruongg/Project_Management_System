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
import { GrStatusGoodSmall as StatusIcon } from "react-icons/gr";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AddMemberModal from "./AddMemberModal";

function MemberList() {
  const [users, setUsers] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const responseUser = await axios.get(
        "https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=69205e8dbf3939eacf2e89f2"
      );
      const responseMember = await axios.get(
        "https://mindx-mockup-server.vercel.app/api/resources/projectMembers?apiKey=69205e8dbf3939eacf2e89f2"
      );
      const responseTask = await axios.get(
        "https://mindx-mockup-server.vercel.app/api/resources/tasks?apiKey=69205e8dbf3939eacf2e89f2"
      );

      const userData = responseUser.data.data.data;
      const memberData = responseMember.data.data.data;

      const sortedMembers = memberData.sort((a: any, b: any) => {
        const userA = userData.find((u: any) => u.id === a.userId);
        const userB = userData.find((u: any) => u.id === b.userId);

        if (userA?.role === "leader") return -1;
        if (userB?.role === "leader") return 1;
        return 0;
      });

      setUsers(userData);
      setMembers(sortedMembers);
      setTasks(responseTask.data.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleAddMember = (newMember: any) => {
    setMembers([...members, newMember]);
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
    navigate("/member-profile", { state: { member } });
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
      ) : (
        <Grid container spacing={3}>
          {members.map((member: any) => {
            const memberProject = users.find(
              (user: any) => user.id === member.userId
            );
            const taskCount = getTaskCount(member.userId);

            return (
              <Grid sx={{ mb: 3 }} key={memberProject?.id}>
                <Card
                  sx={{
                    boxShadow: 2,
                    "&:hover": { boxShadow: 4 },
                    transition: "all 0.3s",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", gap: 3 }}>
                      <Box>
                        <Avatar
                          sx={{
                            width: 100,
                            height: 100,
                            fontSize: "48px",
                            flexShrink: 0,
                            textTransform: "uppercase"
                          }}
                        >
                          {memberProject?.firstName?.[0]}
                          {memberProject?.lastName?.[0]}
                        </Avatar>
                        <Box
                          sx={{
                            mt: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 20,
                          }}
                        >
                          <TotalTaskIcon />
                          <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {taskCount} Tasks
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ textTransform: "capitalize" }} gutterBottom>
                          {memberProject?.firstName} {memberProject?.lastName}
                        </Typography>
                        <Chip
                          label={member?.role}
                          size="small"
                          sx={{ bgcolor: "#E1BEE7", color: "#6A1B9A", mb: 2 }}
                        />

                        <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <CalendarToday
                              sx={{ fontSize: 14, color: "text.secondary" }}
                            />
                            <Typography variant="caption">
                              {new Date(member?.joinDate).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                }
                              )}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              fontSize: 12,
                            }}
                          >
                            <StatusIcon
                              className={
                                member?.status === "active"
                                  ? "text-green-500"
                                  : "text-gray-500"
                              }
                            />
                            <Typography
                              variant="caption"
                              sx={{ textTransform: "capitalize" }}
                            >
                              {member?.status}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: "flex", gap: 2 }}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={handleAddTask}
                            sx={{ bgcolor: "#5C6BC0", textTransform: "none" }}
                          >
                            Add Task
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<People />}
                            sx={{ bgcolor: "#5C6BC0", textTransform: "none" }}
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
