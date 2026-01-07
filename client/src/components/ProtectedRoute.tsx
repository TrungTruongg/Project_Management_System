import { useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useUser } from "./context/UserContext";
import { Box, Button, Typography } from "@mui/material";
import { Lock as LockIcon } from "@mui/icons-material";

const ProtectedRoute = ({ allowedRoles }: any) => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  let isAuth = localStorage.getItem("auth");

  useEffect(() => {
    if (isAuth && !user) {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
  }, [isAuth, user, setUser]);

  if (isAuth !== "true") {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && user) {
    const hasAccess = allowedRoles.includes(user.role || "");

    if (!hasAccess) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            backgroundColor: "#f5f5f5",
            p: 3,
          }}
        >
          <LockIcon sx={{ fontSize: 80, color: "#dc3545", mb: 2 }} />
          <Typography
            variant="h4"
            sx={{ fontWeight: 600, mb: 1, color: "#2c3e50" }}
          >
            Access Denied
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "#6c757d", mb: 1, textAlign: "center" }}
          >
            You dont have permisson to access this page.
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#6c757d", mb: 3, textAlign: "center" }}
          >
            Only <strong>Leader</strong> can access{" "}
            <strong>Security Config</strong>.
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={{
                borderColor: "#484c7f",
                color: "#484c7f",
                "&:hover": {
                  borderColor: "#3a3e66",
                  backgroundColor: "rgba(72, 76, 127, 0.04)",
                },
              }}
            >
              Return
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate("/")}
              sx={{
                backgroundColor: "#484c7f",
                "&:hover": {
                  backgroundColor: "#3a3e66",
                },
              }}
            >
              Return Dashboard
            </Button>
          </Box>
        </Box>
      );
    }
  }

  // Có quyền truy cập
  return <Outlet />;
};

export default ProtectedRoute;