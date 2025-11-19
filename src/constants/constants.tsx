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
    submenu: ["Staff", "Staff Profile", "Attendace Staff"],
  },
];

export const employees = [
  {
    id: 1,
    name: "Trung",
    role: "UI/UX Designer",
    avatar: "👨",
    tasks: "04",
    projects: "04",
  },
  {
    id: 2,
    name: "Quynh",
    role: "Quality Assurance",
    avatar: "👩",
    tasks: "04",
    projects: "04",
  },
  {
    id: 3,
    name: "Uyen",
    role: "Website Designer",
    avatar: "👩",
    tasks: "04",
    projects: "04",
  },
  {
    id: 4,
    name: "Khoa",
    role: "Developer",
    avatar: "👨‍💼",
    tasks: "04",
    projects: "04",
  },
  {
    id: 5,
    name: "Luan",
    role: "QA/QC Engineer",
    avatar: "👨‍💼",
    tasks: "04",
    projects: "04",
  },
  {
    id: 6,
    name: "Ngan",
    role: "Mobile developer",
    avatar: "👩",
    tasks: "04",
    projects: "04",
  },
];

export const taskCards = [
  {
    icon: <TotalTaskIcon />,
    title: "Total Task",
    value: "122",
    color: "#FFE082",
  },
  {
    icon: <CompleteTaskIcon />,
    title: "Completed Task",
    value: "376",
    color: "#FFE082",
  },
  {
    icon: <ProgressTaskIcon />,
    title: "Progress Task",
    value: "74",
    color: "#FFE082",
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
      title: 'Box of Crayons',
      dateStart: '23-02-2021',
      deadline: '1 Month',
      leader: 'Peter',
      avatar: '👨',
      completion: 65,
      stage: 'MEDIUM',
      stageColor: '#FFA726'
    },
    {
      title: 'Fast Cad',
      dateStart: '14-04-2021',
      deadline: '2 Month',
      leader: 'Benjamin',
      avatar: '👨‍🦰',
      completion: 76,
      stage: 'MEDIUM',
      stageColor: '#FFA726'
    },
    {
      title: 'Gob Geeklords',
      dateStart: '16-03-2021',
      deadline: '10 Month',
      leader: 'Evan',
      avatar: '👨‍💼',
      completion: 60,
      stage: 'LOW',
      stageColor: '#66BB6A'
    },
    {
      title: 'Java Dalia',
      dateStart: '17-03-2021',
      deadline: '8 Month',
      leader: 'Connor',
      avatar: '👩',
      completion: 48,
      stage: 'MEDIUM',
      stageColor: '#FFA726'
    },
    {
      title: 'Practice to Perfect',
      dateStart: '12-02-2021',
      deadline: '1 Month',
      leader: 'Colin',
      avatar: '👨',
      completion: 80,
      stage: 'LOW',
      stageColor: '#66BB6A'
    },
    {
      title: 'Rhinestone',
      dateStart: '18-02-2021',
      deadline: '2 Month',
      leader: 'Adam',
      avatar: '👨‍🦱',
      completion: 90,
      stage: 'HIGH',
      stageColor: '#EF5350'
    },
    {
      title: 'Social Geek Made',
      dateStart: '10-01-2021',
      deadline: '4 Month',
      leader: 'Keith',
      avatar: '👨‍💼',
      completion: 78,
      stage: 'MEDIUM',
      stageColor: '#FFA726'
    }
  ];
