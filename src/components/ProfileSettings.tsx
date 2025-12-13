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

  const handleUpdate = async () => {
    if (!user) return;

    try {
      const response = await axios.post(
        "https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=69205e8dbf3939eacf2e89f2",
        {
          id: user.id,
          firstName: form.firstName,
          lastName: form.lastName,
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
          avatar: newAvatar || `${user.firstName?.[0]} ${user.lastName?.[0]}`,
        }
      );

      setUser(response.data.data.data);

      if (form.currentPassword && form.newPassword) {
        setForm({
          firstName: response.data.data.data.firstName,
          lastName: response.data.data.data.lastName,
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
    }
  };

  console.log(user?.firstName?.[0])

  return (
    <>
      <Grid
        sx={{
          width: "60%",
          display: "flex",
          flexDirection: "column",
          justifySelf: "center",
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
                onClick={handleUpdate}
                sx={{ textTransform: "none" }}
              >
                Save Changes
              </Button>
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
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              First name
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={form.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
            />

            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Last name
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={form.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
            />

            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              Profile picture
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                src={newAvatar || `${user?.firstName?.[0]} ${user?.lastName?.[0]}`}
                sx={{ width: 56, height: 56 }}
              />
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
                onClick={handleUpdate}
                sx={{ textTransform: "none" }}
              >
                Save Changes
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
