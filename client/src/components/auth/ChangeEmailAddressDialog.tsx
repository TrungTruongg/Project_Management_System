import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, TextField, Typography } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close";
import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import api from "../api/axiosConfig";

function ChangeEmailAddressDialog({ open, onClose, onSuccess }: any) {
    const { user, setUser } = useUser();
    const [emailForm, setEmailForm] = useState({
        newEmail: "",
        password: "",
        verificationCode: "",
    });

    // UI state
    const [emailStep, setEmailStep] = useState<"input" | "verify">("input");
    const [show, setShow] = useState({
        emailPassword: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Countdown state
    const [countdown, setCountdown] = useState(600);
    const [isCodeExpired, setIsCodeExpired] = useState(false);

    // Countdown timer
    useEffect(() => {
        if (emailStep !== "verify") return;

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
    }, [countdown, emailStep]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleEmailFormChange = (field: string, value: string) => {
        setEmailForm((prev) => ({ ...prev, [field]: value }));
        setError("");
    };

    const toggleShow = (field: keyof typeof show) => {
        setShow((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    // Reset form khi đóng dialog
    const handleCloseDialog = () => {
        setEmailForm({ newEmail: "", password: "", verificationCode: "" });
        setEmailStep("input");
        setError("");
        setSuccess("");
        setCountdown(600);
        setIsCodeExpired(false);
        onClose();
    };

    // Bước 1: Gửi verification code
    const handleRequestEmailChange = async () => {
        setError("");
        setSuccess("");

        // Validation
        if (!emailForm.newEmail.trim()) {
            setError("Please enter new email address");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.newEmail)) {
            setError("Please enter a valid email address");
            return;
        }

        if (emailForm.newEmail.toLowerCase() === user?.email.toLowerCase()) {
            setError("New email cannot be the same as current email");
            return;
        }

        if (!emailForm.password.trim()) {
            setError("Please enter your current password");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/users/request-email-change", {
                userId: user?._id,
                newEmail: emailForm.newEmail.toLowerCase().trim(),
                currentPassword: emailForm.password,
            });

            if (response.data.success) {
                setSuccess(response.data.message);
                setEmailStep("verify");
                setCountdown(600);
                setIsCodeExpired(false);
            }
        } catch (error: any) {
            console.error("Request email change failed", error);
            setError(
                error.response?.data?.error ||
                "Failed to send verification code. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // Bước 2: Verify code và đổi email
    const handleVerifyEmailChange = async () => {
        setError("");
        setSuccess("");

        // Validation
        if (!emailForm.verificationCode.trim()) {
            setError("Please enter verification code");
            return;
        }

        if (emailForm.verificationCode.trim().length !== 6) {
            setError("Verification code must be 6 digits");
            return;
        }

        if (isCodeExpired) {
            setError("Verification code has expired. Please request a new one.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/users/verify-email-change", {
                userId: user?._id,
                newEmail: emailForm.newEmail.toLowerCase().trim(),
                verificationCode: emailForm.verificationCode.trim(),
            });

            if (response.data.success) {
                const updatedUser: any = {
                    ...user,
                    email: emailForm.newEmail.toLowerCase().trim(),
                };
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));

                setSuccess("Email changed successfully!");

                // Close dialog after 1.5s
                setTimeout(() => {
                    handleCloseDialog();
                    onSuccess?.();
                }, 1500);
            }
        } catch (error: any) {
            console.error("Verify email change failed", error);
            setError(
                error.response?.data?.error ||
                "Invalid or expired verification code. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // Return input email step
    const handleBackToInput = () => {
        setEmailStep("input");
        setEmailForm((prev) => ({ ...prev, verificationCode: "" }));
        setError("");
        setSuccess("");
        setCountdown(600);
        setIsCodeExpired(false);
    };
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 3,
                    },
                },
            }}
        >
            <DialogTitle
                sx={{
                    m: 0,
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Typography variant="h6" component="div">
                    Change email address
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        color: "white",
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3 }}>
                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        {success}
                    </Alert>
                )}

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {emailStep === "input" ? (
                    <>
                        <Box sx={{ mb: 2 }}>
                            <Typography
                                variant="subtitle2"
                                sx={{ mb: 1, fontWeight: 600 }}
                            >
                                Current Email:
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={user?.email}
                                disabled
                                sx={{
                                    "& .MuiInputBase-input.Mui-disabled": {
                                        WebkitTextFillColor: "rgba(0, 0, 0, 0.6)",
                                    },
                                }}
                            />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography
                                variant="subtitle2"
                                sx={{ mb: 1, fontWeight: 600 }}
                            >
                                New Email: *
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                type="email"
                                name="newEmail"
                                placeholder="Enter new email address"
                                value={emailForm.newEmail}
                                onChange={(e) =>
                                    handleEmailFormChange("newEmail", e.target.value)
                                }
                                required
                            />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography
                                variant="subtitle2"
                                sx={{ mb: 1, fontWeight: 600 }}
                            >
                                Current Password: *
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                type={show.emailPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter your current password"
                                value={emailForm.password}
                                onChange={(e) =>
                                    handleEmailFormChange("password", e.target.value)
                                }
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => toggleShow("emailPassword")}
                                                >
                                                    {show.emailPassword ? (
                                                        <Visibility />
                                                    ) : (
                                                        <VisibilityOff />
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Box>

                        <Alert severity="info" sx={{ mt: 2 }}>
                            A verification code will be sent to your new email address.
                            <br />
                            <strong>Note:</strong> Please check your <strong>Spam</strong>{" "}
                            folder if you don't see the email.
                        </Alert>
                    </>
                ) : (
                    <>
                        <Box sx={{ mb: 2 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 1,
                                }}
                            >
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    Verification Code: *
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: isCodeExpired
                                            ? "error.main"
                                            : countdown < 60
                                                ? "warning.main"
                                                : "text.secondary",
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
                                value={emailForm.verificationCode}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "");
                                    handleEmailFormChange("verificationCode", value);
                                }}
                                disabled={isCodeExpired || loading}
                                error={isCodeExpired}
                                slotProps={{
                                    htmlInput: {
                                        maxLength: 6,
                                        style: {
                                            textAlign: "center",
                                            fontSize: "20px",
                                            letterSpacing: "8px",
                                            fontWeight: "bold",
                                        },
                                    }
                                }}
                            />
                        </Box>

                        {isCodeExpired ? (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                Verification code has expired.{" "}
                                <Button
                                    size="small"
                                    onClick={handleRequestEmailChange}
                                    disabled={loading}
                                    sx={{
                                        textDecoration: "underline",
                                        textTransform: "none",
                                        p: 0,
                                        minWidth: "auto",
                                    }}
                                >
                                    Request new code
                                </Button>
                            </Alert>
                        ) : (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 2 }}
                            >
                                Didn't receive the code?{" "}
                                <Button
                                    size="small"
                                    onClick={handleRequestEmailChange}
                                    disabled={loading}
                                    sx={{ textTransform: "none", p: 0, minWidth: "auto" }}
                                >
                                    Resend
                                </Button>
                            </Typography>
                        )}
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                {emailStep === "verify" && (
                    <Button
                        onClick={handleBackToInput}
                        variant="outlined"
                        size="small"
                        disabled={loading}
                        sx={{ textTransform: "uppercase" }}
                    >
                        Back
                    </Button>
                )}
                <Button
                    onClick={handleCloseDialog}
                    variant="outlined"
                    size="small"
                    disabled={loading}
                    sx={{ textTransform: "uppercase" }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={
                        emailStep === "input"
                            ? handleRequestEmailChange
                            : handleVerifyEmailChange
                    }
                    variant="contained"
                    color="primary"
                    size="small"
                    disabled={loading || isCodeExpired}
                    sx={{
                        textTransform: "uppercase",
                    }}
                >
                    {loading
                        ? "Processing..."
                        : emailStep === "input"
                            ? "Send Code"
                            : "Verify"}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ChangeEmailAddressDialog
