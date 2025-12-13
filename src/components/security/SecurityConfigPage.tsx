import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Security as SecurityIcon,
  VpnKey as VpnKeyIcon,
  NotificationsActive as NotificationsActiveIcon,
  Save as SaveIcon,
  RestartAlt as RestartAltIcon,
} from "@mui/icons-material";

interface SecurityConfig {
  maxLoginAttempts: number;
  lockDuration: number;
  enableAccountLock: boolean;
  enableEmailNotification: boolean;
  enableCaptcha: boolean;
  captchaAfterAttempts: number;
  sessionTimeout: number;
  requireStrongPassword: boolean;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
}

const DEFAULT_CONFIG: SecurityConfig = {
  maxLoginAttempts: 3,
  lockDuration: 15,
  enableAccountLock: true,
  enableEmailNotification: false,
  enableCaptcha: false,
  captchaAfterAttempts: 2,
  sessionTimeout: 30,
  requireStrongPassword: true,
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumbers: true,
  passwordRequireSpecialChars: false,
};

function SecurityConfigPage() {
  const [config, setConfig] = useState<SecurityConfig>(DEFAULT_CONFIG);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load config từ localStorage khi component mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("securityConfig");
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  // Kiểm tra có thay đổi không
  useEffect(() => {
    const savedConfig = localStorage.getItem("securityConfig");
    const currentConfig = JSON.stringify(config);
    const originalConfig = savedConfig || JSON.stringify(DEFAULT_CONFIG);
    setHasChanges(currentConfig !== originalConfig);
  }, [config]);

  const handleSave = () => {
    try {
      // Validation
      if (config.maxLoginAttempts < 1 || config.maxLoginAttempts > 10) {
        alert("Login attempts must be 1 to 10");
        return;
      }
      if (config.lockDuration < 1 || config.lockDuration > 1440) {
        alert(
          "The lockout time must be between 1 minute and 24 hours (1440 minutes)."
        );
        return;
      }
      if (config.passwordMinLength < 6 || config.passwordMinLength > 32) {
        alert("Password length must be between 6 and 32 characters.");
        return;
      }

      // Lưu vào localStorage
      localStorage.setItem("securityConfig", JSON.stringify(config));
      setShowSuccess(true);
      setHasChanges(false);
    } catch (error) {
      setShowError(true);
      console.error("Error when saving config:", error);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to restore the default settings?")) {
      setConfig(DEFAULT_CONFIG);
      localStorage.removeItem("securityConfig");
      setShowSuccess(true);
    }
  };

  const handleChange = (field: keyof SecurityConfig, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <SecurityIcon sx={{ fontSize: 40, color: "#484c7f", mr: 2 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, color: "#2c3e50" }}>
              Security Config
            </Typography>
            <Typography variant="body2" sx={{ color: "#6c757d", mt: 0.5 }}>
              Manage security settings for login systems
            </Typography>
          </Box>
        </Box>
        <Divider />
      </Box>

      <Grid container spacing={3}>
        {/* Login Security */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <VpnKeyIcon sx={{ fontSize: 28, color: "#484c7f", mr: 1.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Security Login
                </Typography>
              </Box>

              {/* Enable Account Lock */}
              <FormControlLabel
                control={
                  <Switch
                    checked={config.enableAccountLock}
                    onChange={(e) =>
                      handleChange("enableAccountLock", e.target.checked)
                    }
                    color="primary"
                  />
                }
                label="Activate account"
                sx={{ mb: 2, display: "flex" }}
              />

              {/* Max Login Attempts */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, fontWeight: 500, color: "#374151" }}
                >
                  Maximum failed login attempts
                </Typography>
                <TextField
                  type="number"
                  size="small"
                  value={config.maxLoginAttempts}
                  onChange={(e) =>
                    handleChange("maxLoginAttempts", parseInt(e.target.value))
                  }
                  disabled={!config.enableAccountLock}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">times</InputAdornment>
                      ),
                    },
                    htmlInput: { min: 1, max: 10 }
                  }}
                />
              </FormControl>

              {/* Lock Duration */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, fontWeight: 500, color: "#374151" }}
                >
                  Account lock times
                </Typography>
                <TextField
                  type="number"
                  size="small"
                  value={config.lockDuration}
                  onChange={(e) =>
                    handleChange("lockDuration", parseInt(e.target.value))
                  }
                  disabled={!config.enableAccountLock}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">minutes</InputAdornment>
                      ),
                    },
                  }}
                  inputProps={{ min: 1, max: 1440 }}
                />
              </FormControl>

              {/* Session Timeout */}
              <FormControl fullWidth>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, fontWeight: 500, color: "#374151" }}
                >
                  End of work shift
                </Typography>
                <TextField
                  type="number"
                  size="small"
                  value={config.sessionTimeout}
                  onChange={(e) =>
                    handleChange("sessionTimeout", parseInt(e.target.value))
                  }
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">minutes</InputAdornment>
                      ),
                    },
                    htmlInput: { min: 5, max: 480 }
                  }}
                />
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Security */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <NotificationsActiveIcon
                  sx={{ fontSize: 28, color: "#484c7f", mr: 1.5 }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Additional setting
                </Typography>
              </Box>

              {/* Enable Email Notification */}
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.enableEmailNotification}
                      onChange={(e) =>
                        handleChange(
                          "enableEmailNotification",
                          e.target.checked
                        )
                      }
                      color="primary"
                    />
                  }
                  label="Send email notifications about unusual login attempts"
                />
                <Typography
                  variant="caption"
                  sx={{ display: "block", color: "#6c757d", ml: 4.5 }}
                >
                  Send an email when multiple failed login attempts are detected
                </Typography>
              </Box>

              {/* Enable CAPTCHA */}
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.enableCaptcha}
                      onChange={(e) =>
                        handleChange("enableCaptcha", e.target.checked)
                      }
                      color="primary"
                    />
                  }
                  label="Activate CAPTCHA"
                />
                <Typography
                  variant="caption"
                  sx={{ display: "block", color: "#6c757d", ml: 4.5, mb: 2 }}
                >
                  CAPTCHA verification will be required after a number of
                  incorrect login attempts
                </Typography>

                {config.enableCaptcha && (
                  <FormControl fullWidth size="small">
                    <Typography
                      variant="body2"
                      sx={{ mb: 1, fontWeight: 500, color: "#374151" }}
                    >
                      Show CAPTCHA after:
                    </Typography>
                    <Select
                      value={config.captchaAfterAttempts}
                      onChange={(e) =>
                        handleChange("captchaAfterAttempts", e.target.value)
                      }
                    >
                      <MenuItem value={1}>1 failed time</MenuItem>
                      <MenuItem value={2}>2 failed time</MenuItem>
                      <MenuItem value={3}>3 failed time</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
     
        {/* Preview/Summary */}
        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              backgroundColor: "#f8f9fa",
              border: "1px solid #e9ecef",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              📋 Config summary
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="body2" sx={{ color: "#6c757d" }}>
                  🔐 Number of failed login attempts:{" "}
                  <strong>{config.maxLoginAttempts} lần</strong>
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="body2" sx={{ color: "#6c757d" }}>
                  ⏰ Lock time: <strong>{config.lockDuration} minutes</strong>
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="body2" sx={{ color: "#6c757d" }}>
                  ⌛ Session time:{" "}
                  <strong>{config.sessionTimeout} minutes</strong>
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="body2" sx={{ color: "#6c757d" }}>
                  📧 Email notification:{" "}
                  <strong>
                    {config.enableEmailNotification ? "On" : "Off"}
                  </strong>
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="body2" sx={{ color: "#6c757d" }}>
                  🤖 CAPTCHA:{" "}
                  <strong>{config.enableCaptcha ? "On" : "Off"}</strong>
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="body2" sx={{ color: "#6c757d" }}>
                  🔑 Minimum password length:{" "}
                  <strong>{config.passwordMinLength} characters</strong>
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Action Buttons */}
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              pt: 2,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
              sx={{
                textTransform: "none",
                color: "#dc3545",
                borderColor: "#dc3545",
                "&:hover": {
                  borderColor: "#bb2d3b",
                  backgroundColor: "rgba(220, 53, 69, 0.04)",
                },
              }}
            >
              Reset default
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!hasChanges}
              sx={{
                textTransform: "none",
                backgroundColor: "#484c7f",
                "&:hover": {
                  backgroundColor: "#3a3e66",
                },
                "&:disabled": {
                  backgroundColor: "#9ca3af",
                },
              }}
            >
              Save changes
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Config saved successfully!
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={3000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setShowError(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          Errors occured when saving config!
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default SecurityConfigPage;
