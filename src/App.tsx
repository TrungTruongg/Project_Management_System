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
import Projects from "./components/project/Projects";
import Tasks from "./components/task/Tasks";
import MemberList from "./components/member/MemberList";
import DashboardContent from "./components/dashboard/DashboardContent";

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
        <Router>
          <Routes>
            <Route element={<Dashboard />}>
              <Route path="/" element={<DashboardContent />} />
              <Route path="/project" element={<Projects />} />
              <Route path="/task" element={<Tasks />} />
              <Route path="/member" element={<MemberList />} />
            </Route>

            <Route path="/login" element={<Login />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;
