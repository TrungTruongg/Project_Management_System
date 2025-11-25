import { CalendarToday, CommentOutlined, People } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
} from "@mui/material";
import { GoPlusCircle as AddIcon } from "react-icons/go";
import Header from "../Header";
import { useEffect, useState } from "react";
import axios from "axios";

function MemberList({ onViewProfile }: any) {
  const [users, setUsers] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(
        "https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=69205e8dbf3939eacf2e89f2"
      );
      setMembers(response.data.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMember = async () => {
    try {
      const response = await axios.get(
        "https://mindx-mockup-server.vercel.app/api/resources/projectMembers?apiKey=69205e8dbf3939eacf2e89f2"
      );
      setUsers(response.data.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchMember();
  },[])
  return (
    <Box
      sx={{ p: 4, order: 3, flex: "1 1", overflowY: "auto", height: "100vh" }}
    >
      <Header />
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
        >
          Add Member
        </Button>
      </Box>

      <Grid container spacing={3}>
        {members.map((member: any) => {
          const memberProject = users.find((user: any) => user.id === member.userId);
          return (
            <Grid size={{ xs: 12, md: 6 }} key={member.id}>
              <Card
                sx={{
                  boxShadow: 2,
                  "&:hover": { boxShadow: 4 },
                  transition: "all 0.3s",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", gap: 3 }}>
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        fontSize: "48px",
                        flexShrink: 0,
                      }}
                    >
                      {memberProject?.avatar}
                    </Avatar>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {memberProject?.name}
                      </Typography>
                      <Chip
                        label={memberProject?.role}
                        size="small"
                        sx={{ bgcolor: "#E1BEE7", color: "#6A1B9A", mb: 2 }}
                      />

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        Hello, welcome to my task
                      </Typography>

                      <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <CalendarToday
                            sx={{ fontSize: 18, color: "text.secondary" }}
                          />
                          <Typography variant="body2">
                            {/* {member.tasks} */}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <CommentOutlined
                            sx={{ fontSize: 18, color: "text.secondary" }}
                          />
                          <Typography variant="body2">
                            {memberProject?.projectId}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<AddIcon />}
                          fullWidth
                          sx={{ bgcolor: "#5C6BC0", textTransform: "none" }}
                        >
                          Add Task
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<People />}
                          fullWidth
                          sx={{ bgcolor: "#5C6BC0", textTransform: "none" }}
                          onClick={() => onViewProfile(member)}
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
    </Box>
  );
}

export default MemberList;
