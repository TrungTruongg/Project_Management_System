import {
  CalendarToday,
  CommentOutlined,
  People,
} from "@mui/icons-material";
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
import { projectMembers, users } from "../../constants/constants";
import Header from "../Header";

function MemberList({ onViewProfile }: any) {
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
        {projectMembers.map((member) => {
          const userProject = users.find(u => u.id === member.userId)
          console.log(userProject)
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
                      {userProject?.avatar}
                    </Avatar>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {userProject?.name}
                      </Typography>
                      <Chip
                        label={member.role}
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
                            {member.projectId}
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
