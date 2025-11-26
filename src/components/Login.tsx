import { Box, Typography } from "@mui/material";
import TaskIcon from "./icons/TaskIcon";

function Login() {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        flexDirection: "row",
        overflowY: "auto",
        padding: "3rem",
      }}
    >
      <Box>
        <Box className="mb-5">
          <TaskIcon  />
        </Box>

        <Box className="mb-5">
          <Typography variant="h2" sx={{ textAlign: "center" }} gutterBottom>
            My-Task Let's Management Better
          </Typography>
        </Box>

        <img src="./assets/image_login.svg" alt="Login " />
      </Box>
    </Box>
  );
}

export default Login;
