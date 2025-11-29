import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Alert,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import TaskIcon from "./icons/TaskIcon";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import imageRegister from "../assets/image_login.svg";
import axios from "axios";
import { useUser } from "./context/UserContext";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");
  const [errors, setErrors] = useState<any>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useUser();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: any = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!/^[3-9][0-9]{8}$/.test(phone)) {
      newErrors.phone = "Invalid Vietnamese number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const checkResponse = await axios.get(
        "https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=69205e8dbf3939eacf2e89f2"
      );

      const existingUsers = checkResponse.data.data.data;
      const emailExists = existingUsers.some((user: any) => user.email === email);

      if (emailExists) {
        setErrors({ ...errors, email: "Email already exists" });
        setLoading(false);
        return;
      }

      // Get max ID
      const maxId = existingUsers.length > 0
        ? Math.max(...existingUsers.map((u: any) => u.id))
        : 0;

      // Create new user với đầy đủ thông tin
      const newUser = {
        id: maxId + 1,
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        phone: `+84 ${phone}`,
        location: location,
        role: "member",
        avatar: "",
        joinDate: new Date().toISOString().split("T")[0],
      };

      const response = await axios.post(
        "https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=69205e8dbf3939eacf2e89f2",
        newUser
      );

      if (response.data) {
        setUser(response.data.data.data);
        setSuccessMessage("Registration successful! Redirecting to login...");

        // Navigate to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error: any) {
      console.error("Registration failed:", error);
      setErrors({
        ...errors,
        submit: "Registration failed. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        flexDirection: "row",
        width: "100%",
      }}
    >
      {/* Left Side - Illustration */}
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
            src={imageRegister}
            alt="Task Management Illustration"
            style={{
              width: "100%",
              maxWidth: "400px",
              height: "auto",
            }}
          />
        </Box>
      </Box>

      {/* Right Side - Register Form */}
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
            Create your account
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

          {successMessage && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {successMessage}
            </Alert>
          )}

          {/* Error Message */}
          {errors.submit && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errors.submit}
            </Alert>
          )}

          {/* Register Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {/* Full Name - 2 columns */}
            <Box sx={{ mb: 2.5 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography
                    sx={{
                      color: "white",
                      mb: 1,
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    First name
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    error={!!errors.firstName}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "white",
                        borderRadius: "8px",
                        fontSize: "14px",

                        "& fieldset": {
                          borderColor: errors.firstName
                            ? "#f44336"
                            : "transparent",
                        },
                        "&:hover fieldset": {
                          borderColor: errors.firstName
                            ? "#f44336"
                            : "rgba(72, 76, 127, 0.3)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: errors.firstName ? "#f44336" : "#5C6BC0",
                          borderWidth: "2px",
                        },
                      },
                      "& .MuiOutlinedInput-input": {
                        padding: "13px 16px",
                        textTransform: "capitalize"
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography
                    sx={{
                      color: "white",
                      mb: 1,
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    Last name
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    error={!!errors.lastName}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "white",
                        borderRadius: "8px",
                        fontSize: "14px",
                        "& fieldset": {
                          borderColor: errors.lastName
                            ? "#f44336"
                            : "transparent",
                        },
                        "&:hover fieldset": {
                          borderColor: errors.lastName
                            ? "#f44336"
                            : "rgba(72, 76, 127, 0.3)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: errors.lastName ? "#f44336" : "#5C6BC0",
                          borderWidth: "2px",
                        },
                      },
                      "& .MuiOutlinedInput-input": {
                        padding: "13px 16px",
                        textTransform: "capitalize"
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Email */}
            <Box sx={{ mb: 2.5 }}>
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
                error={!!errors.email}
                helperText={
                  errors.email && (
                    <span style={{ color: "#ffcdd2" }}>{errors.email}</span>
                  )
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    borderRadius: "8px",
                    fontSize: "14px",
                    "& fieldset": {
                      borderColor: errors.email ? "#f44336" : "transparent",
                    },
                    "&:hover fieldset": {
                      borderColor: errors.email
                        ? "#f44336"
                        : "rgba(72, 76, 127, 0.3)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: errors.email ? "#f44336" : "#5C6BC0",
                      borderWidth: "2px",
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    padding: "13px 16px",
                  },
                }}
              />
            </Box>

            {/* Password */}
            <Box sx={{ mb: 2.5 }}>
              <Typography
                sx={{
                  color: "white",
                  mb: 1,
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Password
              </Typography>
              <TextField
                fullWidth
                type="password"
                placeholder="8+ characters required"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.password}
                helperText={
                  errors.password && (
                    <span style={{ color: "#ffcdd2" }}>{errors.password}</span>
                  )
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    borderRadius: "8px",
                    fontSize: "14px",
                    "& fieldset": {
                      borderColor: errors.password ? "#f44336" : "transparent",
                    },
                    "&:hover fieldset": {
                      borderColor: errors.password
                        ? "#f44336"
                        : "rgba(72, 76, 127, 0.3)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: errors.password ? "#f44336" : "#5C6BC0",
                      borderWidth: "2px",
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    padding: "13px 16px",
                  },
                }}
              />
            </Box>

            {/* Confirm Password */}
            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{
                  color: "white",
                  mb: 1,
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Confirm password
              </Typography>
              <TextField
                fullWidth
                type="password"
                placeholder="8+ characters required"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={!!errors.confirmPassword}
                helperText={
                  errors.confirmPassword && (
                    <span style={{ color: "#ffcdd2" }}>
                      {errors.confirmPassword}
                    </span>
                  )
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    borderRadius: "8px",
                    fontSize: "14px",
                    "& fieldset": {
                      borderColor: errors.confirmPassword
                        ? "#f44336"
                        : "transparent",
                    },
                    "&:hover fieldset": {
                      borderColor: errors.confirmPassword
                        ? "#f44336"
                        : "rgba(72, 76, 127, 0.3)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: errors.confirmPassword
                        ? "#f44336"
                        : "#5C6BC0",
                      borderWidth: "2px",
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    padding: "13px 16px",
                  },
                }}
              />
            </Box>

            {/* Phone Number */}
            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{
                  color: "white",
                  mb: 1,
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Phone Number
              </Typography>
              <TextField
                fullWidth
                type="text"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhoneNumber(e.target.value)}
                error={!!errors.phone}
                helperText={
                  errors.phone && (
                    <span style={{ color: "#ffcdd2" }}>
                      {errors.phone}
                    </span>
                  )
                }
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        +84
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    borderRadius: "8px",
                    fontSize: "14px",
                    "& fieldset": {
                      borderColor: errors.phone
                        ? "#f44336"
                        : "transparent",
                    },
                    "&:hover fieldset": {
                      borderColor: errors.phone
                        ? "#f44336"
                        : "rgba(72, 76, 127, 0.3)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: errors.phone
                        ? "#f44336"
                        : "#5C6BC0",
                      borderWidth: "2px",
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    padding: "13px 16px",
                  },
                }}
              />
            </Box>

            {/* Select City */}
            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{
                  color: "white",
                  mb: 1,
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Location
              </Typography>
              <Select
                fullWidth
                displayEmpty
                size="small"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                sx={{
                  fontSize: "14px",
                  color: location === "" ? "#9ca3af" : "#111827",
                  bgcolor: "white",
                  borderRadius: "8px"
                }}
              >
                <MenuItem value="" disabled>
                  Choose Location
                </MenuItem>
                <MenuItem value="Ha Noi">Ha Noi</MenuItem>
                <MenuItem value="Ho Chi Minh City">Ho Chi Minh City</MenuItem>
                <MenuItem value="Da Nang">Da Nang</MenuItem>
                <MenuItem value="Hai Phong">Hai Phong</MenuItem>
                <MenuItem value="Can Tho">Can Tho</MenuItem>
              </Select>
            </Box>

            {/* Sign Up Button */}
            <Box sx={{ textAlign: "center", mt: 4 }}>
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
                {loading ? "Creating account..." : "SIGN UP"}
              </Button>
            </Box>

            {/* Sign In Link */}
            <Box sx={{ textAlign: "center" }}>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "14px",
                }}
              >
                Already have an account?{" "}
                <Typography
                  component="span"
                  onClick={() => navigate("/login")}
                  sx={{
                    color: "#FFB74D",
                    cursor: "pointer",
                    fontWeight: 500,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Sign in here
                </Typography>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Register;
