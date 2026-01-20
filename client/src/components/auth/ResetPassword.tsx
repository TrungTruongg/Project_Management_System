import {
    Box,
    Button,
    TextField,
    Typography,
    Alert,
} from "@mui/material";
import TaskIcon from "../icons/TaskIcon";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import imageLogin from "../../assets/image_login.svg";
import api from "../api/axiosConfig";

function ResetPassword() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email;
    const userId = location.state?.userId

    useEffect(() => {
        if (!email || !userId) {
            navigate("/forgot-password");
        }
    }, [email, userId, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!newPassword.trim()) {
            setError("Please enter new password");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (!confirmPassword.trim()) {
            setError("Please enter confirm password");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {

            const response = await api.put(`/users/update/${userId}`,
                { password: newPassword }
            );

            if (response.data && response.data.success) {
                setSuccess("Password changed successfully! Redirecting to login...");

                setTimeout(() => {
                    navigate("/login", {
                        replace: true,
                        state: {
                            message: "Password reset successful! Please login with your new password."
                        }
                    });
                }, 2000);
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
                            textAlign: "center",
                            mb: 4
                        }}
                    >
                        Reset Password
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
                        {/*New Password */}
                        <Box sx={{ mb: 3 }}>
                            <Typography
                                sx={{
                                    color: "white",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    mb: 1
                                }}
                            >
                                New Password
                            </Typography>

                            <TextField
                                fullWidth
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={loading || !!success}
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

                        {/*Confirm Password */}
                        <Box sx={{ mb: 2 }}>
                            <Typography
                                sx={{
                                    color: "white",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    mb: 1
                                }}
                            >
                                Confirm Password
                            </Typography>

                            <TextField
                                fullWidth
                                type="password"
                                placeholder="Enter confirm password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading || !!success}
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

                        {/* Submit Button */}
                        <Box sx={{ textAlign: "center", mt: 4 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading || !!success}
                                sx={{
                                    py: 1,
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
                                    ? "Submitting..." : "Submit"}
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


export default ResetPassword;
