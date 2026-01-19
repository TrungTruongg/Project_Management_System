import {
    Box,
    Button,
    TextField,
    Typography,
    Alert,
} from "@mui/material";
import TaskIcon from "../icons/TaskIcon";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import imageLogin from "../../assets/image_login.svg";
import resetPassword from "../../assets/reset-password.svg"
import api from "../api/axiosConfig";

function PasswordReset() {
    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess("");
        setError("");

        if (!email.trim()) {
            setError("Please enter email address");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/auth/forgot-password", {
                email: email.toLowerCase(),
            });
            if (response.data.success) {
                setSuccess(response.data.message);

                setTimeout(() => {
                    navigate("/2-step-authentication", {
                        state: { email: email.toLowerCase().trim() }
                    });
                }, 1500);
            }
        } catch (error: any) {
            console.error("Request reset password failed", error);
            setError(
                error.response?.data?.error || "An error occurred. Please try again."
            );
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
                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            mb: 3,
                        }}
                    >
                        <img
                            src={resetPassword}
                            alt="Reset Password"
                            style={{
                                width: "180px",
                                height: "180px",
                                objectFit: "contain",
                            }}
                        />
                    </Box>
                    <Typography
                        variant="h4"
                        sx={{
                            color: "white",
                            fontWeight: 600,
                            mb: 1,
                            textAlign: "center",
                        }}
                    >
                        Forgot password?
                    </Typography>
                    <Typography
                        sx={{
                            color: "rgba(255,255,255,0.7)",
                            mb: 4,
                            textAlign: "center",
                            fontSize: "14px",
                        }}
                    >
                        Enter the email address you used when you joined and we'll send you instructions to reset your password.
                    </Typography>
                    
                    {success && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            {success}
                        </Alert>
                    )}

                    {error && (
                        <Alert severity="warning" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}


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

                        {/* Sybmit Button */}
                        <Box sx={{ textAlign: "center", mt: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading || !!success}
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
                                {loading ? "Sending..." : success ? "Redirecting..." : "SUBMIT"}
                            </Button>
                        </Box>

                        <Box sx={{ textAlign: "center" }}>
                            <Typography
                                component="span"
                                onClick={() => navigate("/login")}
                                sx={{
                                    fontSize: "14px",
                                    color: "#FFB74D",
                                    cursor: "pointer",
                                    fontWeight: 500,
                                    "&:hover": {
                                        textDecoration: "underline",
                                    },
                                }}
                            >
                                Back to Sign In
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}


export default PasswordReset;
