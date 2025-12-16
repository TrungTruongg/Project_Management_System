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
  Link,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import axios from "axios";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/Visibility";
import { useUser } from "./context/UserContext";

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

    // Nếu muốn đổi password, kiểm tra các trường
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

      // Kiểm tra current password có đúng không
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

      const response = await axios.put(
        `https://mindx-mockup-server.vercel.app/api/resources/users/${user._id}?apiKey=69205e8dbf3939eacf2e89f2`,
        updatedData
      );

      setUser(response.data.data);
      localStorage.setItem("user", JSON.stringify(response.data.data));

      if (form.currentPassword && form.newPassword) {
        setForm({
          firstName: response.data.data.firstName,
          lastName: response.data.data.lastName,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }

      setSnackbar({
        open: true,
        message: "Profile updated successfully!",
        type: "success",
      });
      return;
    } catch (error) {
      console.error("Error updating avatar:", error);
    } finally {
      setLoading(false);
    }
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

              <Link href="#" underline="hover" sx={{ mt: 2 }}>
                <Typography>Change Email Address</Typography>
              </Link>
            </Box>
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
              />
            </Box>

            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              Profile picture
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                src={newAvatar || user?.avatar}
                sx={{ width: 56, height: 56 }}
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
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
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
