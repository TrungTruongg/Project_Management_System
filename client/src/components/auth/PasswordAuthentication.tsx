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
import verifyPassword from "../../assets/verify_password.svg"
import api from "../api/axiosConfig";

function PasswordAuthentication() {
    const [verificationCode, setVerificationCode] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [isCodeExpired, setIsCodeExpired] = useState(false);
    const [countdown, setCountdown] = useState(600);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate("/password-reset");
        }
    }, [email, navigate]);

    useEffect(() => {
        if (countdown <= 0) {
            setIsCodeExpired(true);
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    setIsCodeExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!verificationCode.trim()) {
            setError("Please enter verification code");
            return;
        }

        if (verificationCode.trim().length !== 6) {
            setError("Verification code must be 6 digits");
            return;
        }

        if (isCodeExpired) {
            setError("Verification code has expired. Please request a new one.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/auth/verify-reset-code", {
                email: email,
                verificationCode: verificationCode.trim(),
            });
            if (response.data.success) {
                setSuccess("Verification successful! Redirecting...");

                setTimeout(() => {
                    navigate("/reset-password", {
                        state: {
                            email: email,
                            userId: response.data.userId, 
                        }
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

    const handleResendCode = async () => {
        setError("");
        setSuccess("");
        setResendLoading(true);

        try {
            const response = await api.post("/auth/resend-verification-code", {
                email: email,
            });

            if (response.data.success) {
                setSuccess("New verification code has been sent to your email");
                setIsCodeExpired(false);
                setCountdown(600);
                setVerificationCode("");
            }
        } catch (error: any) {
            console.error("Resend code failed", error);
            setError(
                error.response?.data?.error ||
                "Failed to resend code. Please try again."
            );
        } finally {
            setResendLoading(false);
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
                            src={verifyPassword}
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
                        Verification
                    </Typography>
                    <Typography
                        sx={{
                            color: "rgba(255,255,255,0.7)",
                            mb: 4,
                            textAlign: "center",
                            fontSize: "14px",
                        }}
                    >
                        We sent a verification code to <strong>{email}</strong>. Enter the code from the email in the field below.
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
                        {/* Verification code */}
                        <Box sx={{ mb: 4 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 1,
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: isCodeExpired
                                            ? "error.main"
                                            : countdown < 60
                                                ? "warning.main"
                                                : "white",
                                        fontWeight: 600,
                                    }}
                                >
                                    {isCodeExpired
                                        ? "Code Expired"
                                        : `Expires in: ${formatTime(countdown)}`}
                                </Typography>
                            </Box>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Enter 6-digit code"
                                value={verificationCode}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    setVerificationCode(value);
                                }}
                                disabled={isCodeExpired || loading || !!success}
                                error={isCodeExpired}
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
                                }}
                                helperText={
                                    isCodeExpired ? (
                                        <Box sx={{ mt: 1 }}>
                                            <Typography sx={{ color: "white" }} >
                                                This code has expired. Please request a new code.
                                            </Typography>
                                            <Button
                                                size="small"
                                                onClick={handleResendCode}
                                                disabled={resendLoading}
                                                sx={{
                                                    textDecoration: "underline",
                                                    textTransform: "none",
                                                    pl: 1,
                                                    minWidth: "auto",
                                                }}
                                            >
                                                {resendLoading ? "Sending..." : "Resend"}
                                            </Button>
                                        </Box>
                                    ) : (
                                        ""
                                    )
                                }
                                slotProps={{
                                    htmlInput: {
                                        maxLength: 6,
                                        style: {
                                            textAlign: "center",
                                            fontSize: "20px",
                                            letterSpacing: "8px",
                                            fontWeight: "bold",
                                        },
                                    },
                                }}
                            />
                        </Box>

                        {/* Submit Button */}
                        <Box sx={{ textAlign: "center", mt: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading || isCodeExpired || !!success}
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
                                {loading ? "Verifying..." : success ? "Verified!" : "SUBMIT"}
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


export default PasswordAuthentication;
