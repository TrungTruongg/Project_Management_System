import { Box, Button, Card, CardContent, Grid, Paper, Typography } from "@mui/material"
import { ChevronRight } from "@mui/icons-material"
import { projectCards, taskCards } from "../../constants/constants"
import WelcomeIcon from "../icons/WelcomeIcon"
import DashboardProjectInformation from "./DashboardProjectInformation"
import Header from "../Header"

function DashboardContent() {
  return (
      <Box sx={{ p: 4, order: 3, flex: "1 1", overflowY: "auto", height: "100vh" }}>
        <Header />

        {/* Task Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {taskCards.map((card, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <Card
                elevation={0}
                sx={{
                  backgroundColor: "white",
                  position: "relative",
                  overflow: "visible",
                  border: "1px solid #f0f0f0",
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 3,
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: "#FFE28C",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 32,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      flex: "1 1 auto",
                      marginLeft: "1.5rem",
                    }}
                  >
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      fontWeight="500"
                    >
                      {card.title}
                    </Typography>
                    <Typography variant="h5" sx={{ marginBottom: 0 }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <ChevronRight sx={{ fontSize: 40, opacity: 0.5 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Main Content Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Welcome Section */}
          <Grid size={{ xs: 13 }}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid #f0f0f0",
                gap: 4,
              }}
            >
              <Box sx={{ flex: 1, maxWidth: "60%" }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Welcome to My-task, a Project Management System
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  component="p"
                  sx={{ lineHeight: "24px", mb: 3 }}
                >
                  Manage projects with ease and boost team productivity. Our
                  intuitive platform helps you plan, execute, and track every
                  aspect of your projects. From task assignment to deadline
                  management, everything you need is at your fingertips.
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#f19828",
                    borderRadius: 2,
                    textTransform: "none",
                    px: 4,
                    py: 1.5,
                    "&:hover": { bgcolor: "#F57C00" },
                  }}
                >
                  Free Inquire
                </Button>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  maxWidth: "40%",
                }}
              >
                <WelcomeIcon />
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Paper elevation={0} sx={{ p: 3, border: "1px solid #f0f0f0" }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Project Timeline
              </Typography>
              <Box
                sx={{
                  height: 100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Timeline visualization area
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Project Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {projectCards.map((card, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <Card
                elevation={0}
                sx={{
                  backgroundColor: "#484c7f",
                  position: "relative",
                  overflow: "visible",
                  border: "1px solid #f0f0f0",
                  color: "white",
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 3,
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 10,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 32,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      flex: "1 1 auto",
                      marginLeft: "1.5rem",
                    }}
                  >
                    <Typography variant="h6" fontWeight="500">
                      {card.title}
                    </Typography>
                    <Typography sx={{ marginBottom: 0 }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <ChevronRight sx={{ fontSize: 40, opacity: 0.5 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <DashboardProjectInformation />
      </Box>
  )
}

export default DashboardContent
