import {
  Dashboard,
  People,
  Security,
  Settings,
  HelpOutline,
  Email,
  Contacts,
} from '@mui/icons-material';

export const menuSections = [
  {
    title: 'Main',
    items: [{ text: 'Dashboard', icon: <Dashboard />, path: '/admin', id: 'overview' }],
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
  {
    title: 'System',
    items: [{ text: 'Security', icon: <Security />, path: '/admin/security', id: 'security' }],
  },
  {
    title: 'Configuration',
    items: [
      { text: 'Settings', icon: <Settings />, path: '/admin/settings', id: 'settings' },
      { text: 'Support', icon: <HelpOutline />, path: '/admin/support', id: 'support' },
      { text: 'Email', icon: <Email />, path: '/admin/email', id: 'email' },
      { text: 'Contact', icon: <Contacts />, path: '/admin/contacts', id: 'contacts' },
    ],
  },
];

