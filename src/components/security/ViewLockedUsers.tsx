import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useState } from "react";

function ViewLockedUsers() {
  const [locks, setLocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const lockedCount = locks.filter(
    (l) => l.lockUntil && new Date(l.lockUntil).getTime() > Date.now()
  ).length;

  const warningCount = locks.filter(
    (l) =>
      (!l.lockUntil || new Date(l.lockUntil).getTime() <= Date.now()) &&
      l.attempts > 0
  ).length;

  const fetchLocks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://mindx-mockup-server.vercel.app/api/resources/locks?apiKey=69205e8dbf3939eacf2e89f2"
      );
      setLocks(response.data.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRemainingTime = (lockUntil: string) => {
    const remaining = new Date(lockUntil).getTime() - Date.now();
    if (remaining <= 0) return "Expired";

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <>
      <Box sx={{ mb: 4 }}>
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
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <LockIcon sx={{ fontSize: 40, color: "#EF5350", mr: 2 }} />
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 600, color: "#2c3e50" }}
              >
                Locked Accounts
              </Typography>
              <Typography variant="body2" sx={{ color: "#6c757d", mt: 0.5 }}>
                View and manage accounts that have been locked due to failed
                login attempts
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchLocks}
            disabled={loading}
            sx={{
              backgroundColor: "#484c7f",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#3a3e66",
              },
            }}
          >
            Refresh
          </Button>
        </Box>
        <Divider />
      </Box>

      {/* Summary Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 3,
          mb: 4,
        }}
      >
        <Card>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "#EF5350" }}
                >
                  {lockedCount}
                </Typography>
                <Typography variant="body2" sx={{ color: "#6c757d", mt: 1 }}>
                  Currently Locked
                </Typography>
              </Box>
              <LockIcon sx={{ fontSize: 48, color: "#EF5350", opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "#FF9800" }}
                >
                  {warningCount}
                </Typography>
                <Typography variant="body2" sx={{ color: "#6c757d", mt: 1 }}>
                  Warning Status
                </Typography>
              </Box>
              <LockIcon sx={{ fontSize: 48, color: "#FF9800", opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>
        {/* 
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: "#484c7f" }}>
                  {config.maxLoginAttempts}
                </Typography>
                <Typography variant="body2" sx={{ color: "#6c757d", mt: 1 }}>
                  Max Attempts
                </Typography>
              </Box>
              <LockIcon sx={{ fontSize: 48, color: "#484c7f", opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card> */}
      </Box>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : locks.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: "center" }}>
          <LockIcon sx={{ fontSize: 64, color: "#9E9E9E", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No locked accounts
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            All accounts are currently accessible
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Attempts</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Locked Until</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Last Attempt</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Remaining Time</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {locks.map((lock) => {
                const isActive =
                  lock.lockUntil &&
                  new Date(lock.lockUntil).getTime() > Date.now();

                return (
                  <TableRow
                    key={lock._id}
                    sx={{
                      "&:hover": { backgroundColor: "#f9f9f9" },
                      backgroundColor: isActive ? "#ffebee" : "inherit",
                    }}
                  >
                    <TableCell>
                      <Typography sx={{ fontWeight: 500 }}>
                        {lock.email}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {isActive ? (
                        <Chip
                          label="Locked"
                          size="small"
                          icon={<LockIcon />}
                          sx={{
                            backgroundColor: "#EF5350",
                            color: "#fff",
                            fontWeight: 600,
                          }}
                        />
                      ) : lock.attempts > 0 ? (
                        <Chip
                          label="Warning"
                          size="small"
                          sx={{
                            backgroundColor: "#FFF9C4",
                            color: "#F57F17",
                            fontWeight: 600,
                          }}
                        />
                      ) : (
                        <Chip
                          label="Normal"
                          size="small"
                          sx={{
                            backgroundColor: "#E0E0E0",
                            color: "#616161",
                          }}
                        />
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography
                        sx={{
                          color: lock.attempts ? "#EF5350" : "#FF9800",
                          fontWeight: 600,
                        }}
                      >
                        {lock.attempts}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {lock.lockUntil ? formatDateTime(lock.lockUntil) : "-"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(lock.lastAttempt)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {isActive ? (
                        <Chip
                          label={getRemainingTime(lock.lockUntil)}
                          size="small"
                          sx={{
                            backgroundColor: "#FFEBEE",
                            color: "#C62828",
                            fontWeight: 600,
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          justifyContent: "center",
                        }}
                      >
                        <Tooltip title="Unlock Account">
                          <IconButton
                            size="small"
                            //onClick={() => handleUnlock(lock)}
                            sx={{ color: "#4CAF50" }}
                          >
                            <UnlockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Record">
                          <IconButton
                            size="small"
                            //onClick={() => handleDelete(lock)}
                            sx={{ color: "#EF5350" }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}

export default ViewLockedUsers;
