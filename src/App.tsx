import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import Dashboard from "./components/dashboard/Dashboard";
import Login from "./components/Login";
import {
  createTheme,
  StyledEngineProvider,
  ThemeProvider,
} from "@mui/material/styles";
import { GlobalStyles } from "@mui/material";
import { UserProvider } from "./components/context/UserContext";
import Projects from "./components/project/Projects";
import Tasks from "./components/task/Tasks";
import MemberList from "./components/member/MemberList";
import DashboardContent from "./components/dashboard/DashboardContent";
import Register from "./components/Register";
import MemberProfile from "./components/member/MemberProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import TicketsView from "./components/ticket/TicketsView";
import TicketsDetail from "./components/ticket/TicketsDetail";
import TaskDetail from "./components/task/TaskDetail";
import ResourceManagement from "./components/resources/ResourceManagement";
import ProfileSettings from "./components/ProfileSettings";
import ViewLockedUsers from "./components/security/ViewLockedUsers";

function App() {
  const theme = createTheme({
    typography: {
      fontFamily: "Open Sans, sans-serif",
    },
  });
  return (
    <StyledEngineProvider enableCssLayer>
      <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
      <ThemeProvider theme={theme}>
        <UserProvider>
          <Router>
            <Routes>
              <Route element={<ProtectedRoute />} >
                <Route element={<Dashboard />}>
                  <Route path="/" element={<DashboardContent />} />
                  <Route path="/project" element={<Projects />} />
                  <Route path="/task" element={<Tasks />} />
                  <Route path="/task-detail" element={<TaskDetail />} />
                  <Route path="/member" element={<MemberList />} />
                  <Route path="/member-profile" element={<MemberProfile />} />
                  <Route path="/tickets-view" element={<TicketsView />} />
                  <Route path="/tickets-detail" element={<TicketsDetail />} />
                  <Route path="/resources" element={<ResourceManagement />} />
                  <Route path="/profile-settings" element={<ProfileSettings />} />
                  <Route
                    path="/view-locked-users"
                    element={<ProtectedRoute allowedRoles={["leader"]} />}
                  >
                    <Route index element={<ViewLockedUsers />} />
                  </Route>
                </Route>
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </Router>
        </UserProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;
