import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  InputAdornment,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/Visibility";
import { useUser } from "./context/UserContext";
import api from "./api/axiosConfig";
import ChangeEmailAddressDialog from "./auth/ChangeEmailAddressDialog";

const ProfileSettings = () => {
  const { user, setUser } = useUser();
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [newAvatar, setNewAvatar] = useState<string | null>(null);
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const [openChangeEmailDialog, setOpenChangeEmailDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setNewAvatar(reader.result as string);
    };
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleShow = (field: keyof typeof show) => {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validate = () => {
    if (!form.firstName.trim()) {
      setSnackbar({
        open: true,
        message: "First name is required",
        type: "error",
      });
      return;
    }

    if (!form.lastName.trim()) {
      setSnackbar({
        open: true,
        message: "Last name is required",
        type: "error",
      });
      return;
    }

    // If any password field is filled, validate passwords
    if (form.currentPassword || form.newPassword || form.confirmPassword) {
      if (!form.currentPassword) {
        setSnackbar({
          open: true,
          message: "Please enter current password",
          type: "error",
        });
        return;
      }

      if (!form.newPassword) {
        setSnackbar({
          open: true,
          message: "Please enter new password",
          type: "error",
        });
        return;
      }

      if (form.newPassword !== form.confirmPassword) {
        setSnackbar({
          open: true,
          message: "New passwords do not match",
          type: "error",
        });
        return;
      }

      // Check correct current password
      if (form.currentPassword !== user?.password) {
        setSnackbar({
          open: true,
          message: "Current password is incorrect",
          type: "error",
        });
        return;
      }
    }

    return true;
  }

  const handleUpdate = async () => {
    if (!user) return;

    const isValid = validate();
    if (!isValid) return;

    setLoading(true);
    try {
      const updatedData = {
        ...user,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        avatar: newAvatar || user.avatar || "",
        // ...(form.newPassword && { password: form.newPassword }),
      };

      if (form.newPassword) {
        updatedData.password = form.newPassword;
      }

      const response = await api.put(`/users/update/${user._id}`,
        updatedData
      );

      setUser(response.data.data);
      localStorage.setItem("user", JSON.stringify(response.data.data));

      if (response.data.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Reset password fields if password changed
        if (form.newPassword) {
          setForm((prev) => ({
            ...prev,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          }));
        }

        setSnackbar({
          open: true,
          message: "Profile updated successfully!",
          type: "success",
        });
      }
    } catch (error: any) {
      console.error("Error updating avatar:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Failed to update profile",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChangeEmailDialog = () => {
    setOpenChangeEmailDialog(true);
  };

  const handleCloseChangeEmailDialog = () => {
    setOpenChangeEmailDialog(false);
  };

  const handleEmailChangeSuccess = () => {
    setSnackbar({
      open: true,
      message: "Email changed successfully!",
      type: "success",
    });
  };

  return (
    <>
      <Grid
        sx={{
          width: "60%",
          display: "flex",
          flexDirection: "column",
          justifySelf: "center",
          gap: 3,
        }}
      >
        <Card
          elevation={0}
          sx={{
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            transition: "all 0.3s",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
              Email
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <TextField
                fullWidth
                size="small"
                name="email"
                value={user?.email}
                disabled
              />       
            </Box>

             <Button variant="text" onClick={handleOpenChangeEmailDialog} sx={{ mt: 1, textTransform: "none", textDecoration: "underline" }}>
                Change Email Address
              </Button>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            transition: "all 0.3s",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {["currentPassword", "newPassword", "confirmPassword"].map(
              (field, idx) => {
                const labels = [
                  "Current Password",
                  "New Password",
                  "Confirm New Password",
                ];
                const showKey = (["current", "new", "confirm"] as const)[idx];
                return (
                  <Box key={field} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      {labels[idx]}
                    </Typography>
                    <TextField
                      fullWidth
                      type={show[showKey] ? "text" : "password"}
                      size="small"
                      value={(form as any)[field]}
                      onChange={(e) => handleChange(field, e.target.value)}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => toggleShow(showKey)}>
                                {show[showKey] ? (
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
                );
              }
            )}

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                First name
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={form.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                sx={{ "& .MuiInputBase-input": { textTransform: "capitalize" } }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Last name
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={form.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                sx={{ "& .MuiInputBase-input": { textTransform: "capitalize" } }}
              />
            </Box>

            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              Profile picture
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                src={newAvatar || user?.avatar}
                sx={{ width: 56, height: 56, textTransform: "uppercase" }}
              >
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </Avatar>
              <Button variant="outlined" component="label">
                Upload
                <input type="file" hidden onChange={handleAvatarChange} />
              </Button>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                mt: 2,
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="contained"
                color="primary"
                loading={loading}
                onClick={handleUpdate}
                sx={{ textTransform: "none" }}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <ChangeEmailAddressDialog
        open={openChangeEmailDialog}
        onClose={handleCloseChangeEmailDialog}
        onSuccess={handleEmailChangeSuccess}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.type}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};
export default ProfileSettings;
