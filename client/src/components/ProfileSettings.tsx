import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  InputAdornment,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useUser } from './context/UserContext';
import api from './api/axiosConfig';
import ChangeEmailAddressDialog from './auth/ChangeEmailAddressDialog';
import { FcGoogle } from 'react-icons/fc';

const ProfileSettings = () => {
  const { user, setUser } = useUser();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [newAvatar, setNewAvatar] = useState<string | null>(null);
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });
  const [openChangeEmailDialog, setOpenChangeEmailDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openSetPasswordDialog, setOpenSetPasswordDialog] = useState(false);
  const [setPasswordStep, setSetPasswordStep] = useState<'request' | 'verify'>('request');
  const [setPasswordForm, setSetPasswordForm] = useState({
    verificationCode: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showSetPasswordForm, setShowSetPasswordForm] = useState({
    new: false,
    confirm: false,
  });

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
        message: 'First name is required',
        type: 'error',
      });
      return;
    }

    if (!form.lastName.trim()) {
      setSnackbar({
        open: true,
        message: 'Last name is required',
        type: 'error',
      });
      return;
    }

    // If any password field is filled, validate passwords
    if (form.currentPassword || form.newPassword || form.confirmPassword) {
      if (!form.currentPassword) {
        setSnackbar({
          open: true,
          message: 'Please enter current password',
          type: 'error',
        });
        return;
      }

      if (!form.newPassword) {
        setSnackbar({
          open: true,
          message: 'Please enter new password',
          type: 'error',
        });
        return;
      }

      if (form.newPassword !== form.confirmPassword) {
        setSnackbar({
          open: true,
          message: 'New passwords do not match',
          type: 'error',
        });
        return;
      }

      if (form.newPassword === form.currentPassword) {
        setSnackbar({
          open: true,
          message: 'New password must be different from current password',
          type: 'error',
        });
        return;
      }
    }

    return true;
  };

  const handleUpdate = async () => {
    if (!user) return;

    const isValid = validate();
    if (!isValid) return;

    setLoading(true);
    try {
      const updatedData: any = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        avatar: newAvatar || user.avatar || '',
      };

      if (form.newPassword) {
        updatedData.currentPassword = form.currentPassword;
        updatedData.newPassword = form.newPassword;
      }

      const response = await api.put(`/users/update/${user._id}`, updatedData);

      setUser(response.data.data);
      localStorage.setItem('user', JSON.stringify(response.data.data));

      if (response.data.success) {
        const updatedUser = response.data.user;

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Reset password fields if password changed
        if (form.newPassword) {
          setForm((prev) => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }));
        }

        setSnackbar({
          open: true,
          message: 'Profile updated successfully!',
          type: 'success',
        });
      }
    } catch (error: any) {
      console.error('Error updating avatar:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update profile',
        type: 'error',
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
      message: 'Email changed successfully!',
      type: 'success',
    });
  };

  // Handle Set Password for Google Auth Users
  const handleOpenSetPasswordDialog = async () => {
    setOpenSetPasswordDialog(true);
    setSetPasswordStep('request');
    setSetPasswordForm({ verificationCode: '', newPassword: '', confirmPassword: '' });
  };

  const handleRequestSetPassword = async () => {
    if (!user) return;
    setPasswordLoading(true);
    try {
      const response = await api.post('/users/request-set-password', { userId: user._id });
      if (response.data.success) {
        setSetPasswordStep('verify');
        setSnackbar({
          open: true,
          message: 'Verification code sent to your email',
          type: 'success',
        });
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to send verification code',
        type: 'error',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleVerifyAndSetPassword = async () => {
    if (!user) return;

    if (!setPasswordForm.verificationCode) {
      setSnackbar({ open: true, message: 'Please enter verification code', type: 'error' });
      return;
    }
    if (!setPasswordForm.newPassword) {
      setSnackbar({ open: true, message: 'Please enter new password', type: 'error' });
      return;
    }
    if (setPasswordForm.newPassword !== setPasswordForm.confirmPassword) {
      setSnackbar({ open: true, message: 'Passwords do not match', type: 'error' });
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await api.post('/users/verify-set-password', {
        userId: user._id,
        verificationCode: setPasswordForm.verificationCode,
        newPassword: setPasswordForm.newPassword,
        confirmPassword: setPasswordForm.confirmPassword,
      });

      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setOpenSetPasswordDialog(false);
        setSnackbar({
          open: true,
          message: 'Password set successfully!',
          type: 'success',
        });
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to set password',
        type: 'error',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <>
      <Grid
        sx={{
          width: '60%',
          display: 'flex',
          flexDirection: 'column',
          justifySelf: 'center',
          gap: 3,
        }}
      >
        <Card
          elevation={0}
          sx={{
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            transition: 'all 0.3s',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
              Email
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <TextField fullWidth size="small" name="email" value={user?.email} disabled />
            </Box>

            <Button
              variant="text"
              onClick={handleOpenChangeEmailDialog}
              sx={{ mt: 1, textTransform: 'none', textDecoration: 'underline' }}
            >
              Change Email Address
            </Button>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            transition: 'all 0.3s',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {(user?.authProvider === 'google' || user?.authProvider === 'emailPassword') &&
            user?.authProvider === 'google' ? (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                  Password
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleOpenSetPasswordDialog}
                  startIcon={<FcGoogle size={20} />}
                  sx={{
                    textTransform: 'none',
                    mb: 2,
                  }}
                >
                  Change Password
                </Button>
              </Box>
            ) : (
              <>
                {['currentPassword', 'newPassword', 'confirmPassword'].map((field, idx) => {
                  const labels = ['Current Password', 'New Password', 'Confirm New Password'];
                  const showKey = (['current', 'new', 'confirm'] as const)[idx];
                  return (
                    <Box key={field} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        {labels[idx]}
                      </Typography>
                      <TextField
                        fullWidth
                        type={show[showKey] ? 'text' : 'password'}
                        size="small"
                        value={(form as any)[field]}
                        onChange={(e) => handleChange(field, e.target.value)}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => toggleShow(showKey)}
                                  size="small"
                                  edge="end"
                                >
                                  {show[showKey] ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </>
            )}

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                First name
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={form.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                sx={{ '& .MuiInputBase-input': { textTransform: 'capitalize' } }}
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
                onChange={(e) => handleChange('lastName', e.target.value)}
                sx={{ '& .MuiInputBase-input': { textTransform: 'capitalize' } }}
              />
            </Box>

            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              Profile picture
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={newAvatar || user?.avatar}
                sx={{ width: 56, height: 56, textTransform: 'uppercase' }}
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
                display: 'flex',
                gap: 2,
                mt: 2,
                justifyContent: 'flex-end',
              }}
            >
              <Button
                variant="contained"
                color="primary"
                loading={loading}
                onClick={handleUpdate}
                sx={{ textTransform: 'none' }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
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

      <Dialog
        open={openSetPasswordDialog}
        onClose={() => !passwordLoading && setOpenSetPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Set Your Password</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {setPasswordStep === 'request' ? (
            <Box>
              <Typography sx={{ mb: 2, color: '#666' }}>
                We'll send a verification code to your email address. Please enter it to set your
                password.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Verification Code
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter code from email"
                  value={setPasswordForm.verificationCode}
                  onChange={(e) =>
                    setSetPasswordForm({ ...setPasswordForm, verificationCode: e.target.value })
                  }
                  disabled={passwordLoading}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  New Password
                </Typography>
                <TextField
                  fullWidth
                  type={showSetPasswordForm.new ? 'text' : 'password'}
                  size="small"
                  placeholder="Enter new password"
                  value={setPasswordForm.newPassword}
                  onChange={(e) =>
                    setSetPasswordForm({ ...setPasswordForm, newPassword: e.target.value })
                  }
                  disabled={passwordLoading}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowSetPasswordForm({
                                ...showSetPasswordForm,
                                new: !showSetPasswordForm.new,
                              })
                            }
                            size="small"
                            edge="end"
                          >
                            {showSetPasswordForm.new ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Confirm Password
                </Typography>
                <TextField
                  fullWidth
                  type={showSetPasswordForm.confirm ? 'text' : 'password'}
                  size="small"
                  placeholder="Confirm password"
                  value={setPasswordForm.confirmPassword}
                  onChange={(e) =>
                    setSetPasswordForm({ ...setPasswordForm, confirmPassword: e.target.value })
                  }
                  disabled={passwordLoading}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowSetPasswordForm({
                                ...showSetPasswordForm,
                                confirm: !showSetPasswordForm.confirm,
                              })
                            }
                            size="small"
                            edge="end"
                          >
                            {showSetPasswordForm.confirm ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSetPasswordDialog(false)} disabled={passwordLoading}>
            Cancel
          </Button>
          {setPasswordStep === 'request' ? (
            <Button
              onClick={handleRequestSetPassword}
              variant="contained"
              disabled={passwordLoading}
            >
              {passwordLoading ? 'Sending...' : 'Send Code'}
            </Button>
          ) : (
            <Button
              onClick={handleVerifyAndSetPassword}
              variant="contained"
              disabled={passwordLoading}
            >
              {passwordLoading ? 'Setting...' : 'Set Password'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <ChangeEmailAddressDialog
        open={openChangeEmailDialog}
        onClose={handleCloseChangeEmailDialog}
        onSuccess={handleEmailChangeSuccess}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.type}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};
export default ProfileSettings;
