import { BsJournalCheck as TotalTaskIcon } from "react-icons/bs";
import { BsListCheck as CompleteTaskIcon } from "react-icons/bs";
import { BsClipboardData as ProgressTaskIcon } from "react-icons/bs";
import { FaBriefcase as ProjectIcon } from "react-icons/fa";
import { FaHome as DashboardIcon } from "react-icons/fa";
import { FaUsers as EmployeesIcon } from "react-icons/fa";
import { AiOutlineFundProjectionScreen as TotalProjectIcon } from "react-icons/ai";
import { BiTask as CompleteProjectIcon } from "react-icons/bi";
import { TbSubtask as ProgressProjectIcon } from "react-icons/tb";

export const menuItems = [
  { id: "dashboard", text: "Dashboard", icon: <DashboardIcon /> },
  {
    id: "projects",
    text: "Projects",
    icon: <ProjectIcon />,
    submenu: ["Projects", "Tasks", "Timesheet"],
  },
  {
    id: "employees",
    text: "Employees",
    icon: <EmployeesIcon />,
    submenu: ["Members", "Members Profile", "Attendace Employees"],
  },
];

export const users = [
  {
    "id": 1,
    "email": "trungtt089@gmail.com",
    "password": "123456",
    "name": "Trung",
    "role": "UI/UX Design",
    "avatar": "👨",
    "joinDate": "2024-01-15",
  },
  {
    "id": 2,
    "email": "quynh123@gmail.com",
    "password": "123456",
    "name": "Quynh",
    "role": "Website Design",
    "avatar": "👩",
    "joinDate": "2024-01-16",
  },
  {
    "id": 3,
    "email": "uyen11111@gmail.com",
    "password": "123456",
    "name": "Uyen",
    "role": "Mobile App Development",
    "avatar": "👩",
    "joinDate": "2024-01-17",
  }
];

export const projectMembers = [
  {
    "id": 1,
    "projectId": 1,
    "userId": 1,
    "role": "leader",
    "joinDate": "2025-01-01",
    "status": "active",
  },
  {
    "id": 2,
    "projectId": 1,
    "userId": 2,
    "role": "member",
    "joinDate": "2025-01-02",
    "status": "active",
  },
  {
    "id": 3,
    "projectId": 1,
    "userId": 3,
    "role": "member",
    "joinDate": "2025-01-03",
    "status": "active",
  }
];

export const taskCards = [
  {
    "icon": <TotalTaskIcon />,
    "title": "Total Task",
    "value": "122",
    "color": "#FFE082",
  },
  {
    "icon": <CompleteTaskIcon />,
    "title": "Completed Task",
    "value": "376",
    "color": "#FFE082",
  },
  {
    "icon": <ProgressTaskIcon />,
    "title": "Progress Task",
    "value": "74",
    "color": "#FFE082",
  },
];

export const projectCards = [
  {
    icon: <TotalProjectIcon />,
    title: "Total Projects",
    value: "122",
    color: "#FFE082",
  },
  {
    icon: <ProgressProjectIcon />,
    title: "Propressing Projects",
    value: "376",
    color: "#FFE082",
  },
  {
    icon: <CompleteProjectIcon />,
    title: "Completed Projects",
    value: "74",
    color: "#FFE082",
  },
];

export const projects = [
  {
    id: 1,
    title: "Website Project",
    description: "Build a project website for company",
    startDate: "2025-02-23",
    endDate: "2025-05-23",
    leaderId: 1,
    completion: 65,
  },
  {
    id: 2,
    title: "Mobile App Project",
    description: "Build a mobile app project for company",
    startDate: "2025-04-14",
    endDate: "2025-06-14",
    leaderId: 2,
    completion: 76,
  },
  {
    id: 3,
    title: "AI App Project",
    description: "Build an AI app project for company",
    startDate: "2025-09-14",
    endDate: "2025-12-14",
    leaderId: 3,
    completion: 16,
  },
];

export const tasks = [
  {
    id: 1,
    projectId: 1,
    title: "UI Design",
    description: "Build an user interface for web",
    startDate: "2025-02-23",
    endDate: "2025-04-23",
    assignedTo: [],
    status: "in-progress",
    priority: "high",
  },
  {
    id: 2,
    projectId: 1,
    title: "UX Design",
    description: "Make website simplier to use",
    startDate: "2025-02-23",
    endDate: "2025-04-23",
    assignedTo: [],
    status: "in-progress",
    priority: "low",
  },
  {
    id: 3,
    projectId: 2,
    title: "Java for Android Studio",
    description: "Display data in virtual phone",
    startDate: "2025-04-14",
    endDate: "2025-05-14",
    assignedTo: [],
    status: "completed",
    priority: "medium",
  },
  {
    id: 4,
    projectId: 3,
    title: "Python for AI App",
    description: "Make AI response with prompts",
    startDate: "2025-09-14",
    endDate: "2025-11-14",
    assignedTo: [],
    status: "completed",
    priority: "high",
  },
];
