import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Person as PersonIcon,
  Loop as StatusIcon,
  CheckCircle as CheckCompleteIcon,
  ArrowBack,
} from "@mui/icons-material";
import { useUser } from "../context/UserContext";
import api from "../api/axiosConfig";

function SupportsDetail() {
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get("id");
  const { user } = useUser();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<any>(null);
  const [assignedUser, setAssignedUser] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isProjectOwner, setIsProjectOwner] = useState(false);

  const fetchTicketDetail = async () => {
    if (!ticketId) return;

    setLoading(true);
    try {
      const [ticketsRes, usersRes, projectsRes] = await Promise.all([
        api.get("/tickets"),
        api.get("/users"),
        api.get("/projects"),
      ]);

      const tickets = ticketsRes.data;
      const users = usersRes.data;
      const projects = projectsRes.data;

      const foundTicket = tickets.find((t: any) => t._id === ticketId);

      if (foundTicket) {
        setTicket(foundTicket);

        // Find user by assignedBy
        const ticketUser = users.find(
          (u: any) => u._id === foundTicket.assignedBy
        );
        setAssignedUser(ticketUser);

        const foundProject = projects.find(
          (p: any) => p._id === foundTicket.projectId
        );
        setProject(foundProject);

        if (foundProject && user) {
          const isOwner = foundProject.leaderId === user._id;
          setIsProjectOwner(isOwner);
        } else {
          setIsProjectOwner(false);
        }
      }
    } catch (error) {
      console.error("Error fetching ticket detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetail();
  }, [ticketId, user]);

  const getStatusChip = (status: string) => {
    const config: any = {
      completed: { label: "Completed", bgcolor: "#4CAF50" },
      "in-progress": { label: "In Progress", bgcolor: "#FF9800" },
      pending: { label: "Pending", bgcolor: "#F44336" },
    };

    const statusConfig = config[status] || config.pending;

    return (
      <Chip
        label={statusConfig.label}
        size="small"
        sx={{
          bgcolor: statusConfig.bgcolor,
          color: "white",
          fontWeight: 600,
          fontSize: "0.85rem",
          height: 28,
          px: 1,
        }}
      />
    );
  };

  const getPriorityChip = (priority: string) => {
    const config: any = {
      high: { label: "High", bgcolor: "#EF5350" },
      medium: { label: "Medium", bgcolor: "#FF9800" },
      low: { label: "Low", bgcolor: "#66BB6A" },
    };

    const priorityConfig = config[priority] || config.medium;

    return (
      <Chip
        label={priorityConfig.label}
        size="small"
        sx={{
          bgcolor: priorityConfig.bgcolor,
          color: "white",
          fontWeight: 600,
          fontSize: "0.85rem",
          height: 28,
          px: 1,
        }}
      />
    );
  };

  const handleCompleteTicket = async () => {
    if (!ticket || !isProjectOwner) return;

    try {
      const updatedTicket = {
        ...ticket,
        status: "completed",
      };

      await api.put(`tickets/update/${ticket._id}`,
        updatedTicket
      );

      setTicket(updatedTicket);
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" fontWeight="700">
            Support Tickets Detail
          </Typography>
        </Box>

        {isProjectOwner && ticket?.status !== "completed" && (
          // <IconButton
          //   size="small"
          //   sx={{ color: "#4CAF50" }}
          //   onClick={handleCompleteTicket}
          //   title="Mark as complete"
          // >
          //   <CheckCompleteIcon fontSize="small" />
          // </IconButton>

          <Button
            variant="contained"
            size="medium"
            startIcon={<CheckCompleteIcon />}
            onClick={handleCompleteTicket}
            sx={{
              backgroundColor: "#4CAF50",
              color: "white",
              textTransform: "none",
              px: 3,
            }}
          >
            Check Complete
          </Button>
        )}
      </Box>

      {/* Info Cards */}
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
      ) : !ticket ? (
        <Typography fontStyle="italic">
          No support tickets available!
        </Typography>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 3,
              mb: 4,
            }}
          >
            {/* Status Card */}
            <Card
              sx={{
                boxShadow: 2,
                borderRadius: 2,
                transition: "all 0.3s",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: "#FFF9C4",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <StatusIcon sx={{ fontSize: 32, color: "#F57F17" }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Status
                    </Typography>
                    <Box
                      sx={{
                        mt: 0.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      {getStatusChip(ticket?.status)}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Created Name Card */}
            <Card
              sx={{
                boxShadow: 2,
                borderRadius: 2,
                transition: "all 0.3s",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: "#B3E5FC",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 32, color: "#0277BD" }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      User Assigned
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 0.5,
                      }}
                    >
                      <Avatar
                        src={assignedUser?.avatar}
                        sx={{
                          width: 28,
                          height: 28,
                          fontSize: "0.75rem",
                          bgcolor: "#E0E0E0",
                          textTransform: "uppercase",
                        }}
                      >
                        {assignedUser?.firstName?.[0]}
                        {assignedUser?.lastName?.[0]}
                      </Avatar>
                      <Typography
                        variant="body2"
                        fontWeight="600"
                        sx={{ textTransform: "capitalize" }}
                      >
                        {assignedUser
                          ? `${assignedUser.firstName} ${assignedUser.lastName}`
                          : "Unassigned"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Card
            sx={{
              boxShadow: 2,
              borderRadius: 2,
              mb: 4,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                  pb: 2,
                  borderBottom: "1px solid #e0e0e0",
                }}
              >
                <Box>
                  {project && (
                    <Chip
                      label={project.name}
                      size="small"
                      sx={{
                        bgcolor: "#F3E5F5",
                        color: "#7B1FA2",
                        fontSize: "0.75rem",
                        mb: 1,
                        textTransform: "capitalize",
                      }}
                    />
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Created:{" "}
                    {new Date(ticket.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Typography>
                </Box>
              </Box>

              {/* Name */}
              <Typography variant="h5" fontWeight="700">
                {ticket.name}
              </Typography>

              <Box>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.8,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {ticket.description}
                </Typography>
              </Box>

              <Box
                sx={{
                  mt: 4,
                  pt: 3,
                  borderTop: "1px solid #e0e0e0",
                  display: "flex",
                  gap: 4,
                  flexWrap: "wrap",
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                  >
                    Priority
                  </Typography>
                  {getPriorityChip(ticket.priority)}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}

export default SupportsDetail;
