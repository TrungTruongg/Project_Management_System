import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import Dashboard from "./components/dashboard/Dashboard";
import Login from "./components/auth/Login";
import {
  createTheme,
  StyledEngineProvider,
  ThemeProvider,
} from "@mui/material/styles";
import { CssBaseline, GlobalStyles } from "@mui/material";
import { UserProvider } from "./components/context/UserContext";
import { SearchProvider } from "./components/context/SearchContext";
import Projects from "./components/project/Projects";
import Tasks from "./components/task/Tasks";
import MemberList from "./components/member/MemberList";
import DashboardContent from "./components/dashboard/DashboardContent";
import Register from "./components/auth/Register";
import MemberProfile from "./components/member/MemberProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import TaskDetail from "./components/task/TaskDetail";
import ProfileSettings from "./components/ProfileSettings";
import ViewLockedUsers from "./components/security/ViewLockedUsers";
import SupportsView from "./components/ticket/SupportsView";
import SupportsDetail from "./components/ticket/SupportsDetail";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AttachmentManagement from "./components/attachment/AttachmentManagement";
import PasswordAuthentication from "./components/auth/PasswordAuthentication";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  const theme = createTheme({
    typography: {
      fontFamily: "Open Sans, sans-serif",
    },
    colorSchemes: {
      light: {
        palette: {
          background: {
            default: '#ffffff',
          },
        },
      },
      dark: {
        palette: {
          background: {
            default: '#121212',
          },
        },
      },
    },
  });

  return (
    <StyledEngineProvider enableCssLayer>
      <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
      <ThemeProvider theme={theme} defaultMode="light">
        <CssBaseline />
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <UserProvider>
            <SearchProvider>
              <Router>
                <Routes>
                  <Route element={<ProtectedRoute />}>
                    <Route element={<Dashboard />}>
                      <Route path="/" element={<DashboardContent />} />
                      <Route path="/project" element={<Projects />} />
                      <Route path="/task" element={<Tasks />} />
                      <Route path="/task-detail" element={<TaskDetail />} />
                      <Route path="/member" element={<MemberList />} />
                      <Route path="/member-profile" element={<MemberProfile />} />
                      <Route path="/supports-view" element={<SupportsView />} />
                      <Route path="/supports-detail" element={<SupportsDetail />} />
                      <Route path="/attachments" element={<AttachmentManagement />} />
                      <Route
                        path="/profile-settings"
                        element={<ProfileSettings />}
                      />
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
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/2-step-authentication" element={<PasswordAuthentication />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                </Routes>
              </Router>
            </SearchProvider>
          </UserProvider>
        </GoogleOAuthProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;
