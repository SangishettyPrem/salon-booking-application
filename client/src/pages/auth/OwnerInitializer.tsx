import Loader from "@/components/common/Loader";
import { fetchSalonByOwner } from "@/redux/features/salon/salon.slice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux.hooks";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

const OwnerInitializer = () => {
  const dispatch = useAppDispatch();

  const role = useAppSelector((state) => state.auth.user?.role);

  const { isInitilazing, isSalonFetched } = useAppSelector(
    (state) => state.salon,
  );

  useEffect(() => {
    if (role === "owner" && !isSalonFetched) {
      dispatch(fetchSalonByOwner());
    }
  }, [role, isSalonFetched, dispatch]);

  if (role === "owner" && !isSalonFetched) {
    return <Loader />;
  }

  if (isInitilazing) {
    return <Loader />;
  }

  return <Outlet />;
};

export default OwnerInitializer;
