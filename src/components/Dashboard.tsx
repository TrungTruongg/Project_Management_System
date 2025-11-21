import { useState } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

import DashboardContent from "./DashboardContent";
import Projects from "./Projects";
import MemberList from "./MemberList";
import Tasks from "./Tasks";

function Dashboard() {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    dashboard: true,
    projects: false,
  });

  const [activePage, setActivePage] = useState<string>("Dashboard");

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleMenuClick = (menuItem: string) => {
    setActivePage(menuItem);
  };

  const renderContent = () => {
    switch (activePage) {
      case "Project Dashboard":
        return <DashboardContent />;
      case "Projects":
        return <Projects />;
      case "Tasks":
        return <Tasks />;
      case "Members":
        return <MemberList />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", flexDirection: "row" }}>
      <Sidebar
        openMenus={openMenus}
        toggleMenu={toggleMenu}
        activePage={activePage}
        onMenuClick={handleMenuClick}
      />
      {renderContent()}
    </Box>
  );
}

export default Dashboard;
