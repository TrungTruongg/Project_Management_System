import { FaHome as DashboardIcon } from "react-icons/fa";
import { FaUsers as EmployeesIcon } from "react-icons/fa";
import { IoTicket as TicketIcon } from "react-icons/io5";
import { TiAttachment as AttachmentIcon } from "react-icons/ti";
import { FiGrid as BoardIcon } from "react-icons/fi";

export const menuItems = [
  { id: "dashboard", text: "Dashboard", icon: <DashboardIcon /> },
  {
    id: "board",
    text: "Board",
    icon: <BoardIcon />,
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
];

