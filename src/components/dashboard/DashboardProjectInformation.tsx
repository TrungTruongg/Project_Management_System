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
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";

function DashboardProjectInformation() {
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
          "https://mindx-mockup-server.vercel.app/api/resources/projects?apiKey=69205e8dbf3939eacf2e89f2"
        ),
        axios.get(
          "https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=69205e8dbf3939eacf2e89f2"
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

  // Helper function để lấy tên đầy đủ của user
  const getUserFullName = (userId: number | string) => {
    const user = users.find((u: any) => u.id === userId);
    if (!user) return "N/A";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim();
  };

  // Helper function để lấy avatar của user
  const getUserAvatar = (userId: number | string) => {
    const user = users.find((u: any) => u.id === userId);
    return user?.avatar || "👤";
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, bgcolor: "#f5f5f5" }}>
        <Box sx={{ bgcolor: "white", borderRadius: 2, p: 3, boxShadow: 1 }}>
          <Typography>Đang tải dữ liệu...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, bgcolor: "#f5f5f5" }}>
      <Box sx={{ bgcolor: "white", borderRadius: 2, p: 3, boxShadow: 1 }}>
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
              {projects.map((project: any, index) => {
                const leaderName = getUserFullName(project.leaderId);
                const members = project.member || [];

                return (
                  <TableRow
                    key={index}
                    sx={{
                      "&:hover": { bgcolor: "#f9f9f9" },
                      "& td": { borderBottom: "1px solid #f0f0f0" },
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
                      <Typography variant="body2" color="text.secondary">
                        {calculateDeadline(
                          project.startDate,
                          project.endDate
                        )}{" "}
                        Days
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            fontSize: "14px",
                            bgcolor: "#E0E0E0",
                          }}
                        >
                          {getUserAvatar(project.leaderId)}
                        </Avatar>
                        <Typography variant="body2">{leaderName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {members.length > 0 ? (
                        <AvatarGroup max={4}>
                          {members.map((memberId: number) => (
                            <Avatar
                              key={memberId}
                              sx={{
                                width: 32,
                                height: 32,
                                fontSize: "14px",
                                bgcolor: "#E0E0E0",
                              }}
                              title={getUserFullName(memberId)}
                            >
                              {getUserAvatar(memberId)}
                            </Avatar>
                          ))}
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
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {projects.length === 0 && !loading && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary">
              Chưa có project nào
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default DashboardProjectInformation;