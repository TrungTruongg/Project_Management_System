import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  Divider,
  Alert,
} from "@mui/material";
import TaskIcon from "../icons/TaskIcon";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google";
import imageLogin from "../../assets/image_login.svg";
import { useUser } from "../context/UserContext";
import api from "../api/axiosConfig";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/auth/login", {
        email: email.trim(),
        password: password,
      });

      if (response.data && response.data.success) {
        const userData = response.data.data.user;

        // localStorage.setItem("token", token);
        localStorage.setItem("auth", "true");
        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
        navigate("/", { replace: true });
      }

    } catch (error: any) {
      if (error.response) {
        setError(error.response.data.message);
      } else if (error.request) {
        setError("Cannot connect to server");
      } else {
        setError("An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError("");

        const googleUserRes = await fetch(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenResponse.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        const googleUser = await googleUserRes.json();

        const response = await api.post("/api/auth/google", {
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
          given_name: googleUser.given_name,
          family_name: googleUser.family_name,
        });

        if (response.data.success) {
          const { user, token } = response.data.data;

          localStorage.setItem("token", token);
          localStorage.setItem("auth", "true");
          localStorage.setItem("user", JSON.stringify(user));

          setUser(user);

          navigate("/", { replace: true });
        }
      } catch (error: any) {
        console.error("Google login error:", error);

        const errorMessage = error.response?.data?.message
          || error.message
          || "Google login failed. Please try again.";

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google OAuth error:", error);
      setError("Google login failed. Please try again.");
    },
  });

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        flexDirection: "row",
        width: "100%",
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 4,
          }}
        >
          <Box
            sx={{
              backgroundColor: "white",
              display: "flex",
              height: "80px",
              justifyContent: "center",
              width: "80px",
              alignItems: "center",
            }}
          >
            <TaskIcon width="64" height="64" />
          </Box>
        </Box>

        {/* Title */}
        <Typography
          variant="h3"
          sx={{
            textAlign: "center",

            mb: 6,
            color: "#2c3e50",
            maxWidth: "500px",
          }}
        >
          My-Task Let's
          <br />
          Management Better
        </Typography>

        {/* Illustration */}
        <Box
          sx={{
            width: "100%",
            maxWidth: "500px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <img
            src={imageLogin}
            alt="Task Management Illustration"
            style={{
              width: "100%",
              maxWidth: "400px",
              height: "auto",
            }}
          />
        </Box>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "3rem",
        }}
      >
        <Box
          sx={{
            backgroundColor: "#484c7f",
            borderRadius: "15px",
            padding: "48px",
            width: "100%",
            maxWidth: "480px",
          }}
        >
          {/* Header */}
          <Typography
            variant="h4"
            sx={{
              color: "white",
              fontWeight: 600,
              mb: 1,
              textAlign: "center",
            }}
          >
            Sign in
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.7)",
              mb: 4,
              textAlign: "center",
              fontSize: "14px",
            }}
          >
            Free access to our dashboard.
          </Typography>

          {error && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Google Sign In Button */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<FcGoogle size={20} />}
            onClick={() => handleGoogleLogin()}
            disabled={loading}
            sx={{
              mb: 3,
              py: 1.5,
              backgroundColor: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "white",
              textTransform: "none",
              fontSize: "15px",
              fontWeight: 500,
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.4)",
              },
            }}
          >
            {loading ? "Signing in..." : "Sign in with Google"}
          </Button>

          {/* Divider */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Divider
              sx={{
                flex: 1,
                borderColor: "rgba(255,255,255,0.3)",
              }}
            />
            <Typography
              sx={{
                mx: 2,
                color: "rgba(255,255,255,0.5)",
                fontSize: "14px",
              }}
            >
              OR
            </Typography>
            <Divider
              sx={{
                flex: 1,
                borderColor: "rgba(255,255,255,0.3)",
              }}
            />
          </Box>

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  color: "white",
                  mb: 1,
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Email address
              </Typography>
              <TextField
                fullWidth
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    borderRadius: "8px",
                    fontSize: "14px",
                    "& fieldset": {
                      borderColor: "transparent",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(72, 76, 127, 0.3)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#5C6BC0",
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    padding: "14px 16px",
                  },
                }}
              />
            </Box>

            {/* Password */}
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography
                  sx={{
                    color: "white",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Password
                </Typography>
                <Typography
                  onClick={() => navigate("/forgot-password")}
                  sx={{
                    color: "#FFB74D",
                    fontSize: "13px",
                    cursor: "pointer",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Forgot Password?
                </Typography>
              </Box>
              <TextField
                fullWidth
                type="password"
                placeholder="****************"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    borderRadius: "8px",
                    fontSize: "14px",
                    "& fieldset": {
                      borderColor: "transparent",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(72, 76, 127, 0.3)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#5C6BC0",
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    padding: "14px 16px",
                  },
                }}
              />
            </Box>

            {/* Remember Me */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  sx={{
                    color: "rgba(255,255,255,0.5)",
                    "&.Mui-checked": {
                      color: "white",
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ color: "white", fontSize: "14px" }}>
                  Remember me
                </Typography>
              }
            />

            {/* Sign In Button */}
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.5,
                  backgroundColor: "white",
                  color: "#484c7f",
                  textTransform: "none",
                  fontSize: "15px",
                  fontWeight: 700,
                  borderRadius: "8px",
                  mb: 3,
                  letterSpacing: "0.5px",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                  },
                }}
              >
                {loading
                  ? "Signing in..." : "SIGN IN"}
              </Button>
            </Box>

            {/* Sign Up Link */}
            <Box sx={{ textAlign: "center" }}>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "14px",
                }}
              >
                Don't have an account yet?{" "}
                <Typography
                  component="span"
                  onClick={() => navigate("/register")}
                  sx={{
                    color: "#FFB74D",
                    cursor: "pointer",
                    fontWeight: 500,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Sign up here
                </Typography>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}


export default Login;
