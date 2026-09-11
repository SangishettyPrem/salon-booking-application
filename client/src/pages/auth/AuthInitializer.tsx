import Loader from "@/components/common/Loader";
import { checkSession } from "@/redux/features/auth/auth.slice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux.hooks";
import { useEffect } from "react";

interface AuthInitializerProps {
  children: React.ReactNode;
}

const AuthInitializer = ({ children }: AuthInitializerProps) => {
  const dispatch = useAppDispatch();

  const { isInitializing } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkSession());
  }, [dispatch]);

  if (isInitializing) {
    return <Loader />;
  }

  return <>{children}</>;
};

export default AuthInitializer;
