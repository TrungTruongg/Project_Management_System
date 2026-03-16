import { useState } from 'react';
import { Box } from '@mui/material';
import Sidebar from '../Sidebar';
import { Outlet } from 'react-router-dom';
import Header from '../Header';
import GeminiChatBox from '../ai/GeminiChatBot';

function Dashboard() {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    1: true,
    2: false,
  });

  const toggleMenu = (menuId: string) => {
    setOpenMenus((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'row',
        bgcolor: 'background.default',
      }}
    >
      <Sidebar openMenus={openMenus} toggleMenu={toggleMenu} />
      <GeminiChatBox />
      <Box
        sx={{
          flex: 1,
          height: '100vh',
          order: 1,
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            px: 4,
            pt: 4,
            position: 'sticky',
            top: 0,
            zIndex: 10,
            bgcolor: 'background.default',
            borderBottom: (theme) =>
                `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`,
          }}
        >
          <Header />
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', px: 4, py: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;
