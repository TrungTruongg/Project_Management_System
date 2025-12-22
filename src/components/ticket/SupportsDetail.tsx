import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  Person as PersonIcon,
  Label as PriorityIcon,
  Loop as StatusIcon,
} from "@mui/icons-material";

const API_KEY = import.meta.env.VITE_API_KEY;

function SupportsDetail() {
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get("id");

  const [ticket, setTicket] = useState<any>(null);
  const [assignedUser, setAssignedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchTicketDetail = async () => {
    if (!ticketId) return;

    setLoading(true);
    try {
      const [ticketsRes, usersRes] = await Promise.all([
        axios.get(
          `https://mindx-mockup-server.vercel.app/api/resources/supportTickets?apiKey=${API_KEY}`
        ),
        axios.get(
          `https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=${API_KEY}`
        ),
      ]);

      const tickets = ticketsRes.data.data.data;
      const users = usersRes.data.data.data;

      const foundTicket = tickets.find(
        (t: any) => t.id === parseInt(ticketId)
      );

      if (foundTicket) {
        setTicket(foundTicket);

        const user = users.find((u: any) => u.id === foundTicket.assignedTo);
        setAssignedUser(user);
      }
    } catch (error) {
      console.error("Error fetching ticket detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetail();
  }, [ticketId]);

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

  return (
    <Box>
      <Typography variant="h4" fontWeight="700" sx={{ mb: 4 }}>
        Support Tickets Detail
      </Typography>

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
        <Typography fontStyle="italic" >No support tickets available!</Typography>
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
                    <Box sx={{ mt: 0.5 }}>{getStatusChip(ticket?.status)}</Box>
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
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

            {/* Priority Card */}
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
                      bgcolor: "#B2DFDB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PriorityIcon sx={{ fontSize: 32, color: "#00796B" }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Priority
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>{getPriorityChip(ticket?.priority)}</Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Card
            sx={{
              boxShadow: 2,
              borderRadius: 2,
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
                <Typography
                  variant="h5"
                  fontWeight="700"
                  sx={{
                    color: "#EF5350",
                    mb: 1,
                  }}
                >
                  {ticket.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Created:{" "}
                  {new Date(ticket.createdDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </Typography>
              </Box>

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
                    Created Date
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    {new Date(ticket.createdDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                  >
                    Status
                  </Typography>
                  {getStatusChip(ticket.status)}
                </Box>

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
    </Box>
  );
}

export default SupportsDetail;