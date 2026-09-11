import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks/redux.hooks";
import type { ReactNode } from "react";
import type { Role } from "@/redux/features/auth/auth.types";
import Loader from "@/components/common/Loader";

interface RoleRouteProps {
  allowedRoles: Role[];
  children: ReactNode;
}

const RoleRoute = ({ allowedRoles, children }: RoleRouteProps) => {
  const { user, isInitializing } = useAppSelector((state) => state.auth);

  if (isInitializing) return <Loader />;

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to={"/unauthorized"} replace />;
  }

  return children;
};

export default RoleRoute;
