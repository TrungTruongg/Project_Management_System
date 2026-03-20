import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import axios from 'axios';

const ResetPasswordDialog = ({ open, onClose, selectedUser }: any) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendResetLink = async () => {
    if (!selectedUser?._id) {
      setError('User ID is missing');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/api/users/send-reset-link', {
        userId: selectedUser._id,
      });

      if (response.data.success) {
        setSuccess(response.data.message);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(response.data.error || 'Failed to send reset link');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to send reset link. Please try again.';
      setError(errorMsg);
      console.error('Error sending reset link:', err);
    } finally {
      setLoading(false);
    }
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" component="div">
          Reset User Password
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: 'white',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Box>
          <Typography fontSize="15px" fontWeight="bold" sx={{ mb: 2 }}>
            Confirm Action for {selectedUser?.firstName} {selectedUser?.lastName}
          </Typography>
          <Typography fontSize="14px">
            A secure password reset link will be automatically generated and sent to{' '}
            <span className="font-bold text-primary">{selectedUser?.email}</span>. Their
            current credentials will remain active until the user completes the reset process.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="small"
          sx={{ textTransform: 'uppercase' }}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSendResetLink}
          variant="contained"
          color="primary"
          size="small"
          disabled={loading}
          sx={{
            textTransform: 'uppercase',
          }}
        >
          {loading ? 'Processing...' : 'Send Reset Link'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResetPasswordDialog;
