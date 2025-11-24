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
} from "@mui/material";
import { projects, users } from "../../constants/constants";

function DashboardProjectInformation() {
  const calculateDeadline = (dateStart: string, dateEnd: string) => {
    const startDate = new Date(dateStart);
    const endDate = new Date(dateEnd);

    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };
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
                  COMPLETION
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project, index) => {
                const leader = users.find((u) => u.id === project.leaderId)
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
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {project.startDate}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {`${calculateDeadline(
                          project.startDate,
                          project.endDate
                        )} Days`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="body2">
                          {leader?.name}
                        </Typography>
                      </Box>
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
                                bgcolor: "#5C6BC0",
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
                            color: "#5C6BC0",
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
      </Box>
    </Box>
  );
}

export default DashboardProjectInformation;
