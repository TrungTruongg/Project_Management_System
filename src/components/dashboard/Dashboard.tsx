import { useState } from "react";
import { Box } from "@mui/material";
import Sidebar from "../Sidebar";
import { Outlet } from "react-router-dom";

function Dashboard() {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    1: true,
    2: false,
  });

  const toggleMenu = (menuId: string) => {
    setOpenMenus((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", flexDirection: "row" }}>
      <Sidebar openMenus={openMenus} toggleMenu={toggleMenu} />
      <Outlet />
    </Box>
  );
}

export default Dashboard;
