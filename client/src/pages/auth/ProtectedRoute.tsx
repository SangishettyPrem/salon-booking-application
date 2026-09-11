import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks/redux.hooks.js";
import Loader from "../../components/common/Loader";

export default function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAppSelector(
    (state) => state.auth,
  );
  const location = useLocation();

  if (isInitializing) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
