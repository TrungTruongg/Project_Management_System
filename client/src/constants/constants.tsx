import { FaBriefcase as ProjectIcon } from "react-icons/fa";
import { FaHome as DashboardIcon } from "react-icons/fa";
import { FaUsers as EmployeesIcon } from "react-icons/fa";
import { IoTicket as TicketIcon } from "react-icons/io5";
import { TiAttachment as AttachmentIcon } from "react-icons/ti";
// import { MdSecurity as SecurityIcon } from "react-icons/md";

export const menuItems = [
  { id: "dashboard", text: "Dashboard", icon: <DashboardIcon /> },
  {
    id: "board",
    text: "Board",
    icon: <ProjectIcon />,
  },
  {
    id: "supports",
    text: "Supports",
    icon: <TicketIcon />,
  },
  {
    id: "members",
    text: "Members",
    icon: <EmployeesIcon />,
  },
  { id: "attachments", text: "Attachments", icon: <AttachmentIcon /> },
  // { id: "locked-users", text: "Locked Users", icon: <SecurityIcon /> },
];

