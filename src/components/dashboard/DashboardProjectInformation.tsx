import {
  Box,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  Typography,
  LinearProgress,
  Avatar,
  AvatarGroup,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";

const API_KEY = import.meta.env.VITE_API_KEY;

function DashboardProjectInformation() {
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const calculateDeadline = (dateStart: string, dateEnd: string) => {
    const startDate = new Date(dateStart);
    const endDate = new Date(dateEnd);

    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };


  const fetchAllDatas = async () => {
    setLoading(true);
    try {
      const [projectsRes, usersRes] = await Promise.all([
        axios.get(
          `https://mindx-mockup-server.vercel.app/api/resources/projects?apiKey=${API_KEY}`
        ),
        axios.get(
          `https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=${API_KEY}`
        ),
      ]);
      setProjects(projectsRes.data.data.data);
      setUsers(usersRes.data.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDatas();
  }, []);

  const getUserProjects = () => {
    if (!user) return [];
    return projects.filter(
      (p) => p.ownerId === user.id || p.members?.includes(user.id)
    );
  };

  const userProjects = getUserProjects();

  if (loading) {
    return (
      <Box sx={{ borderRadius: 2, p: 3, boxShadow: 1, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (

    <Box sx={{
      borderRadius: 2,
      p: 3,
      boxShadow: 1,
      border: (theme) =>
        `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`
    }}>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
        Project Information
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  textTransform: "uppercase",
                  borderBottom: "2px solid #f0f0f0",
                }}
              >
                TITLE
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  textTransform: "uppercase",
                  borderBottom: "2px solid #f0f0f0",
                }}
              >
                DATE START
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  textTransform: "uppercase",
                  borderBottom: "2px solid #f0f0f0",
                }}
              >
                DEADLINE
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  textTransform: "uppercase",
                  borderBottom: "2px solid #f0f0f0",
                }}
              >
                LEADER
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  textTransform: "uppercase",
                  borderBottom: "2px solid #f0f0f0",
                }}
              >
                MEMBERS
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  textTransform: "uppercase",
                  borderBottom: "2px solid #f0f0f0",
                }}
              >
                COMPLETION
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}>
                  <Typography fontStyle="italic" color="text.secondary">
                    No projects available!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project: any, index) => {
                const leader = users.find(user => user.id === project.ownerId);
                const projectMembers = users.filter((user) => project.members.includes(user.id));
                const calculateDays = calculateDeadline(project.startDate, project.endDate);

                return (
                  <TableRow
                    key={index}
                    sx={{
                      "&:hover": { bgcolor: 'action.hover' },
                      "& td": {
                        borderBottom: (theme) =>
                          `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {project.title}
                      </Typography>
                      {project.description && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          {project.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {project.startDate}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {calculateDays >= 1 ? (
                        <Typography variant="body2" color="text.secondary">
                          {calculateDeadline(
                            project.startDate,
                            project.endDate
                          )}{" "}
                          Days
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="red">
                          Expired
                        </Typography>
                      )}

                    </TableCell>
                    <TableCell>
                      {leader ? (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: "14px",
                              bgcolor: "#E0E0E0",
                              textTransform: "uppercase"
                            }}
                          >
                            {leader.firstName?.[0]}{leader.lastName?.[0]}
                          </Avatar>
                          <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                            {leader.firstName} {leader.lastName}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No leader
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {projectMembers.length > 0 ? (
                        <AvatarGroup max={4}>
                          {projectMembers.map((member: any) => {

                            return (
                              <Avatar
                                key={member.id}
                                src={member.avatar}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  fontSize: "14px",
                                  bgcolor: "#E0E0E0",
                                  textTransform: "uppercase"
                                }}
                                title={member ? `${member.firstName} ${member.lastName}` : "Unknown"}
                              >
                                {member?.firstName?.[0]}{member?.lastName?.[0]}
                              </Avatar>
                            );
                          })}
                        </AvatarGroup>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No members
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          minWidth: 150,
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={project.completion}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: "#E0E0E0",
                              "& .MuiLinearProgress-bar": {
                                bgcolor:
                                  project.completion >= 75
                                    ? "#4CAF50"
                                    : project.completion >= 50
                                      ? "#5C6BC0"
                                      : project.completion >= 25
                                        ? "#FF9800"
                                        : "#EF5350",
                                borderRadius: 4,
                              },
                            }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          fontWeight="600"
                          sx={{
                            minWidth: 35,
                            color:
                              project.completion >= 75
                                ? "#4CAF50"
                                : project.completion >= 50
                                  ? "#5C6BC0"
                                  : project.completion >= 25
                                    ? "#FF9800"
                                    : "#EF5350",
                          }}
                        >
                          {project.completion}%
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>

  );
}

export default DashboardProjectInformation;