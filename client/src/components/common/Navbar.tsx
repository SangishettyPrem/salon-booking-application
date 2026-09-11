import { setTheme } from "@/redux/features/app/app.slice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux.hooks";
import { Menu, Moon, Sparkles, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import ProfileMenu from "./ProfileMenu";

export interface NavbarProps {
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Navbar = ({ setMobileOpen }: NavbarProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const { theme } = useAppSelector((state) => state.app);
  const dispatch = useAppDispatch();

  const toggleTheme = () => {
    dispatch(setTheme(theme === "light" ? "dark" : "light"));
    document.documentElement.dataset.theme =
      theme === "light" ? "dark" : "light";
    localStorage.setItem(
      "glowbook_theme",
      theme === "light" ? "dark" : "light",
    );
  };

  return (
    <header className="site-header">
      <div className="nav-wrap">
        <div className="flex items-center gap-3">
          {user && (
            <button
              type="button"
              className="icon-button lg:hidden!"
              aria-label="Open sidebar menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
          )}
          <Link className="brand" to="/">
            <span className="brand-mark">
              <Sparkles size={18} />
            </span>
            <span>
              glow
              <span>book</span>
            </span>
          </Link>
        </div>
        <div className="nav-actions">
          <button
            className="icon-button"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            {theme === "light" ? <Sun /> : <Moon />}
          </button>
          {user ? (
            <ProfileMenu />
          ) : (
            <>
              <Link className="text-button" to="/login">
                Sign in
              </Link>
              <Link className="button small hide-small" to="/register">
                Join GlowBook
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
