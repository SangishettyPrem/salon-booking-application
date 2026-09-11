import { Link } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks/redux.hooks";

const Footer = () => {
  const { user } = useAppSelector((state) => state.auth);
  const isOwner = user?.role === "owner";

  if (user) return;

  return (
    <footer>
      <div className="footer-wrap">
        <div className="flex flex-col w-fit">
          <strong>{isOwner ? "Partner portal" : "For everyone"}</strong>
          <div className="flex flex-col">
            {isOwner ? (
              <Link to="/owner">Dashboard</Link>
            ) : (
              <>
                <Link to="/">Find a salon</Link>
                <Link to="/register">List your salon</Link>
              </>
            )}
          </div>
        </div>
        <div>
          <strong>Need help?</strong>
          <a href="mailto:hello@glowbook.local">hello@glowbook.local</a>
          <span>Every day, 9am–8pm</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
