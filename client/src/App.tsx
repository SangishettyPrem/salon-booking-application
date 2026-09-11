import AuthInitializer from "./pages/auth/AuthInitializer.js";
import { useAppDispatch, useAppSelector } from "./redux/hooks/redux.hooks.js";
import AppRoutes from "./routes/AppRoutes.js";
import { Toaster } from "react-hot-toast";
import { ServerDown, SessionExpired } from "./routes/index.js";
import { useEffect } from "react";
import { setTheme } from "./redux/features/app/app.slice.js";
import VerifyEmailModal from "./components/common/VerifyEmailModal.js";

const App = () => {
  const { serverDown, sessionExpired } = useAppSelector((state) => state.app);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const theme = localStorage.getItem("glowbook_theme");
    if (theme) {
      dispatch(setTheme(theme));
      document.documentElement.dataset.theme = theme;
    } else {
      dispatch(setTheme("light"));
      document.documentElement.dataset.theme = "light";
    }
  }, [dispatch]);

  if (serverDown) return <ServerDown />;
  if (sessionExpired) return <SessionExpired />;

  return (
    <AuthInitializer>
      <AppRoutes />
      <VerifyEmailModal />
      <Toaster />
    </AuthInitializer>
  );
};

export default App;
