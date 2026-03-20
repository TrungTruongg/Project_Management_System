import { Dashboard, People, Settings, AssignmentOutlined } from '@mui/icons-material';

export const menuSections = [
  {
    title: 'Main',
    items: [{ text: 'Dashboard', icon: <Dashboard />, path: '/admin', id: 'overview' }],
  },
  {
    title: 'Active Tasks',
    items: [{ text: 'Tasks', icon: <AssignmentOutlined />, path: '/admin/tasks', id: 'tasks' }],
  },
  {
    title: 'Users',
    items: [
      {
        text: 'Users',
        icon: <People />,
        path: '/admin/users',
        id: 'users',
      },
    ],
  },
  // {
  //   title: 'System',
  //   items: [{ text: 'Security', icon: <Security />, path: '/admin/security', id: 'security' }],
  // },
  {
    title: 'Configuration',
    items: [{ text: 'Settings', icon: <Settings />, path: '/admin/settings', id: 'settings' }],
  },
];
