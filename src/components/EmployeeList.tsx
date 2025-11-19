import { Add, CalendarToday, CommentOutlined, People } from "@mui/icons-material";
import { Avatar, Box, Button, Card, CardContent, Chip, Grid, Typography } from "@mui/material";
import { employees } from "../constants/constants";

function EmployeeList({ onViewProfile }: any) {
  return (
    <Box sx={{ p: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Employee
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ bgcolor: "#5C6BC0", textTransform: "none", px: 3 }}
          >
            Add Employee
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: "#5C6BC0", textTransform: "none", px: 3 }}
          >
            Status
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {employees.map((employee) => (
          <Grid size={{ xs: 12, md: 6}} key={employee.id}>
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
                    {employee.avatar}
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {employee.name}
                    </Typography>
                    <Chip
                      label={employee.role}
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
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <CalendarToday
                          sx={{ fontSize: 18, color: "text.secondary" }}
                        />
                        <Typography variant="body2">
                          {employee.tasks}
                        </Typography>
                      </Box>
                     
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <CommentOutlined
                          sx={{ fontSize: 18, color: "text.secondary" }}
                        />
                        <Typography variant="body2">
                          {employee.projects}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Add />}
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
                        onClick={() => onViewProfile(employee)}
                      >
                        Profile
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default EmployeeList;
