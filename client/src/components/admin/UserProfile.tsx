import { Avatar, Box, Card, CircularProgress, IconButton, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import {
  ArrowBack,
  LocationCityOutlined,
  Mail,
  MailOutline,
  PhoneOutlined,
} from '@mui/icons-material';

function UserProfile() {
  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;

  useEffect(() => {
    if (userId) {
      fetchUsers();
    }
  }, [userId]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      // Process users
      const usersList = response.data;
      const foundUser = usersList.find((u: any) => u._id === userId);
      setProfileUser(foundUser);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <IconButton onClick={() => navigate(-1)}>
              <ArrowBack />
            </IconButton>
            <Typography
              variant="h4"
              sx={{ fontWeight: 600, color: '#172B4D', textTransform: 'capitalize' }}
            >
              {profileUser?.firstName} {profileUser?.lastName}
            </Typography>
          </Box>

          <Card
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              gap: 2,
              maxWidth: 261,
              border: '1px solid',
              borderRadius: 2,
              borderColor: '#0B120E24',
            }}
          >
            <Avatar
              src={profileUser?.avatar}
              sx={{
                width: 96,
                height: 96,
                fontSize: 16,
                color: 'white',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              {profileUser?.firstName?.[0]}
              {profileUser?.lastName?.[0]}
            </Avatar>

            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <MailOutline sx={{ width: 20, height: 20 }} />
                <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                  {profileUser?.email}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <PhoneOutlined sx={{ width: 20, height: 20, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                  +84 {profileUser?.phone}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <LocationCityOutlined sx={{ width: 20, height: 20, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                  {profileUser?.location}
                </Typography>
              </Box>
            </Box>
          </Card>
        </>
      )}
    </Box>
  );
}

export default UserProfile;
