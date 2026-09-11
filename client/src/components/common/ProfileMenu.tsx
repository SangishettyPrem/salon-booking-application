import { useState, useEffect, useRef } from "react";
import { UserRound, User, LogOut } from "lucide-react"; // Assuming you are using lucide-react
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux.hooks";
import { logout, setLogout } from "@/redux/features/auth/auth.slice";
import { useNavigate } from "react-router-dom";

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const navigate = useNavigate();

  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // Close the menu if the user clicks outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await dispatch(logout());
      await new Promise((resolve) => setTimeout(resolve, 2000));
      dispatch(setLogout());
      setIsLoggingOut(false);
      window.location.href = "/";
    } catch (error) {
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    // 'relative' is crucial here so the absolute dropdown positions itself relative to this wrapper
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <div
        className="profile-pill cursor-pointer p-2 rounded-full transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <UserRound />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-(--paper) rounded-md shadow-lg z-50 overflow-hidden">
          {/* User Details Section */}
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-medium">
              {user?.name ?? "Alex Johnson"}
            </p>
            <p className="text-xs truncate">
              {user?.email ?? "alex.johnson@example.com"}
            </p>
          </div>

          {/* Menu Actions */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/profile");
              }}
              className="w-full text-left px-4 py-2 text-sm flex items-center gap-2"
            >
              <User size={16} />
              Profile Details
            </button>

            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="w-full text-left px-4 py-2 text-sm text-red-600 flex items-center gap-2"
            >
              <LogOut size={16} />
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
