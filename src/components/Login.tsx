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
import TaskIcon from "./icons/TaskIcon";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import imageLogin from "../assets/image_login.svg";
import axios from "axios";
import { useUser } from "./context/UserContext";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 10;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();

  // const checkEmailLocked = async (email: string) => {
  //   const res = await axios.get(
  //     "https://mindx-mockup-server.vercel.app/api/resources/locks?apiKey=69205e8dbf3939eacf2e89f2"
  //   );

  //   const lock = res.data.data.data.find((l: any) => l.email === email);

  //   if (!lock || !lock.lockUntil) return null;

  //   if (Date.now() < new Date(lock.lockUntil).getTime()) {
  //     return lock;
  //   }
  // }

  const increaseAttempts = async (email: string) => {
    const res = await axios.get(
      "https://mindx-mockup-server.vercel.app/api/resources/locks?apiKey=69205e8dbf3939eacf2e89f2"
    );

    const locks = res.data.data.data;
    const lock = locks.find((l: any) => l.email === email);

    if (!lock) {
      await axios.post(
        "https://mindx-mockup-server.vercel.app/api/resources/locks?apiKey=69205e8dbf3939eacf2e89f2",
        {
          email,
          attempts: 1,
          lockUntil: null,
        }
      );

      return MAX_ATTEMPTS - 1;
    }

    const attempts = lock.attempts + 1;
    const isLocked = attempts >= MAX_ATTEMPTS;

    await axios.put(
      `https://mindx-mockup-server.vercel.app/api/resources/locks/${lock._id}?apiKey=69205e8dbf3939eacf2e89f2`,
      {
        ...lock,
        attempts,
        lockUntil: isLocked
          ? new Date(
            Date.now() + LOCK_MINUTES * 60 * 1000
          ).toISOString()
          : null,
      }
    );

    const remaining = Math.max(0, MAX_ATTEMPTS - attempts);
    return remaining;
  };

  const resetLock = async (email: string) => {
    const res = await axios.get("https://mindx-mockup-server.vercel.app/api/resources/locks?apiKey=69205e8dbf3939eacf2e89f2");
    const lock = res.data.data.data.find((l: any) => l.email === email);

    if (!lock) return;

    await axios.put(`https://mindx-mockup-server.vercel.app/api/resources/locks/${lock._id}?apiKey=69205e8dbf3939eacf2e89f2`, {
      ...lock,
      attempts: 0,
      lockUntil: null,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      // const lock = await checkEmailLocked(email);

      // if (lock) {
      //   setIsLocked(true);
      //   setError(
      //     `Account locked. Try again after ${LOCK_MINUTES} minutes.`
      //   );
      //   return;
      // }

      const response = await axios.get(
        "https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=69205e8dbf3939eacf2e89f2"
      );
      const users = response.data.data.data;

      const matchedUser = users.find(
        (user: any) => user.email === email && user.password === password
      );


      if (matchedUser) {
        await resetLock(email);

        const { password, ...securedUsers } = matchedUser;

        setUser(securedUsers);
        localStorage.setItem("auth", "true");
        localStorage.setItem("user", JSON.stringify(securedUsers));
        navigate("/");

        return;
      }
      else {
        const remainingAttempts = await increaseAttempts(email);

        if (remainingAttempts === 0) {
          setIsLocked(true);
          setError(`Account locked. Try again after ${LOCK_MINUTES} minutes.`);
        } else {
          setIsLocked(false)
          setError(
            `Invalid email or password, you have ${remainingAttempts} attempts left`
          );
        }
      }

    } catch (error: any) {
      console.error("Login failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => { };

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
            <Alert severity={isLocked ? "error" : "warning"} sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Google Sign In Button */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<FcGoogle size={20} />}
            onClick={handleGoogleSignIn}
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
            Sign in with Google
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
          <Box component="form" onSubmit={handleSubmit}>
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
              sx={{ mb: 3 }}
            />

            {/* Sign In Button */}
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading || isLocked}
              sx={{
                py: 1.5,
                backgroundColor: "white",
                color: "#484c7f",
                textTransform: "none",
                fontSize: "15px",
                fontWeight: 600,
                borderRadius: "8px",
                mb: 3,
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              {loading
                ? "Signing in..." : "SIGN IN"}
            </Button>

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
