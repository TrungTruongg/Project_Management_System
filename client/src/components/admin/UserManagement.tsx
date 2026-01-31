import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Chip } from '@mui/material';
import api from '../api/axiosConfig';

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.isActive).length;
  const totalLeaders = users.filter((user) => user.role === 'leader').length;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const quickActions = [
    {
      title: 'Total users',
      description: '',
      total: totalUsers,
    },
    {
      title: 'Active users',
      description: '',
      total: activeUsers,
    },
    {
      title: 'Leaders',
      description: '',
      total: totalLeaders,
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600, color: '#172B4D' }}>
        Users
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography fontSize="14px" sx={{ mb: 2, color: '#292A2E' }}>
          Any user invited to your organization can access your app. Manage app access for
          individual users or set app access permissions to control other ways users can access your
          app. Go to app access settings.
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid size={{ xs: 10, md: 4 }} key={index}>
              <Card
                elevation={0}
                sx={{
                  border: '1px solid #DFE1E6',
                  borderRadius: 2,
                  cursor: 'pointer',
                }}
              >
                <CardContent
                  sx={{
                    p: 2,
                    '&:last-child': { pb: 2 },
                  }}
                >
                    <Typography fontSize="14px" sx={{ color: '#292A2E' }}>
                      {action.title}
                    </Typography>
                    <Typography fontSize="20px" sx={{ fontWeight: 500, color: '#292A2E' }}>
                      {action.total}
                    </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      
    </Box>
  );
};

export default UserManagement;
