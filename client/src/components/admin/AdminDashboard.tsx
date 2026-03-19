import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Chip } from '@mui/material';
import { PersonAdd, Apps, Language } from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import api from '../api/axiosConfig';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    rovoUsage: 0,
    activeUsersMonthly: 1,
    openRequests: 0,
  });

  // Data giả cho charts (thay bằng API thực)
  const rovoUsageData = [
    { date: '24 thg 11', value: 0 },
    { date: '25 thg 1', value: 0 },
    { date: '26 thg 1', value: 0 },
    { date: '27 thg 1', value: 0 },
    { date: '28 thg 1', value: 0 },
    { date: '29 thg 1', value: 0 },
    { date: '30 thg 1', value: 0 },
  ];

  const activeUsersData = [
    { date: 'thg 10 2025', value: 0 },
    { date: 'thg 11 2025', value: 0.2 },
    { date: 'thg 12 2025', value: 0.8 },
  ];

  const requestsData = [{ date: 'Jira', value: 0 }];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Quick action cards ở phần "Thao tác nhanh"
  const quickActions = [
    {
      icon: <PersonAdd sx={{ fontSize: 24 }} />,
      title: 'Mời người dùng',
      description: '',
    },
    {
      icon: <Apps sx={{ fontSize: 24 }} />,
      title: 'Thêm ứng dụng',
      description: '',
    },
    {
      icon: <Language sx={{ fontSize: 24 }} />,
      title: 'Xác minh miền',
      description: '',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600, color: '#172B4D' }}>
        My-Task Overview
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#172B4D' }}>
          Quick start
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <Card
                elevation={0}
                sx={{
                  border: '1px solid #DFE1E6',
                  borderRadius: 1,
                  cursor: 'pointer',
                  height: '32px',
                }}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                  }}
                >
                  <Box sx={{ textAlign: 'center', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box>{action.icon}</Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {action.title}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#172B4D' }}>
          Chart Overview
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid #DFE1E6',
                borderRadius: 2,
                height: '100%',
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ color: '#5E6C84', mb: 1 }}>
                      Useage limit
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {stats.rovoUsage}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#5E6C84' }}>
                      used in the last 7 days
                    </Typography>
                  </Box>
                  <Button size="small" sx={{ textTransform: 'none', color: '#0052CC' }}>
                    View useage
                  </Button>
                </Box>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={rovoUsageData}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#0052CC"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Active users */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid #DFE1E6',
                borderRadius: 2,
                height: '100%',
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ color: '#5E6C84', mb: 1 }}>
                      Users active each month
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stats.activeUsersMonthly}
                      </Typography>
                      <Chip
                        label="0% FROM BEGIN TO NOW"
                        size="small"
                        sx={{
                          bgcolor: '#FFEBE6',
                          color: '#BF2600',
                          fontSize: 10,
                          fontWeight: 700,
                          height: 20,
                        }}
                      />
                    </Box>
                  </Box>
                  <Button size="small" sx={{ textTransform: 'none', color: '#0052CC' }}>
                    User Management
                  </Button>
                </Box>
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={activeUsersData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0052CC" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0052CC" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#0052CC"
                      fillOpacity={1}
                      fill="url(#colorUsers)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 3: Yêu cầu mở */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid #DFE1E6',
                borderRadius: 2,
                height: '100%',
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ color: '#5E6C84', mb: 1 }}>
                      Yêu cầu mở về quyền truy cập ứng dụng
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {stats.openRequests}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        mt: 2,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          bgcolor: '#F4F5F7',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                        }}
                      >
                        pmsbytrung
                      </Typography>
                    </Box>
                  </Box>
                  <Button size="small" sx={{ textTransform: 'none', color: '#0052CC' }}>
                    Duyệt xét yêu cầu
                  </Button>
                </Box>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={requestsData}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#0052CC"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
