import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { useAppSelector } from "@/redux/hooks/redux.hooks";
import Sidebar from "@/components/common/Sidebar";

const MainLayout = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { salon } = useAppSelector((state) => state.salon);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col bg-(--paper)">
      <div className="flex flex-1 min-h-0">
        {user && !(user.role === "owner" && !salon) && (
          <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        )}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar setMobileOpen={setMobileOpen} />
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
