import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "./context/UserContext";

const ProtectedRoute = () => {
  const { user, setUser } = useUser();
  let isAuth = localStorage.getItem("auth");

  useEffect(() => {
    if (isAuth && !user) {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
  }, [isAuth, user, setUser]);

  return isAuth === "true" ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;