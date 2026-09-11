import React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Home,
  ArrowLeft,
  Search,
  Scissors,
  Sparkles,
  Compass,
} from "lucide-react";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-(--rose)/10 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-(--peach)/10 rounded-full blur-2xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-xl w-full text-center space-y-8 relative z-10">
        {/* Badge & Floating Icon */}
        <div className="flex flex-col items-center space-y-3">
          <div className="size-20 rounded-3xl bg-(--surface) border border-(--line) shadow-lg flex items-center justify-center text-(--rose) relative">
            <Scissors size={34} className="rotate-[-20deg]" />
            <span className="absolute -top-1.5 -right-1.5 size-6 rounded-full bg-(--rose) text-white flex items-center justify-center text-xs">
              <Sparkles size={13} />
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-(--rose) bg-(--rose)/10 border border-(--rose)/20">
            Error 404
          </span>
        </div>

        {/* 404 Display & Typography */}
        <div className="space-y-3">
          <h1 className="text-7xl sm:text-8xl font-extrabold tracking-tight text-(--ink) font-serif">
            4<span className="text-(--rose)">0</span>4
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold text-(--ink)">
            Oops! Page Not Found
          </h2>
          <p className="text-sm sm:text-base text-(--muted) max-w-md mx-auto leading-relaxed">
            The page you are looking for might have been moved, renamed, or is
            temporarily unavailable. Let's get you back on track!
          </p>
        </div>

        {/* Primary Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-(--rose) text-white text-sm font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <Home size={17} />
            <span>Back to Home</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-(--line) bg-(--surface) hover:bg-(--soft) text-(--ink) text-sm font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft size={17} />
            <span>Go Back</span>
          </button>
        </div>

        {/* Quick Links Suggestions */}
        <div className="pt-8 border-t border-(--line)">
          <p className="text-xs font-semibold uppercase tracking-wider text-(--muted) mb-4">
            Popular Destinations
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <Link
              to="/"
              className="p-3.5 rounded-xl bg-(--surface) border border-(--line) hover:border-(--rose)/40 transition-all flex items-center gap-3 group"
            >
              <div className="size-9 rounded-lg bg-(--soft) flex items-center justify-center text-(--rose) shrink-0 group-hover:scale-105 transition-transform">
                <Search size={17} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-(--ink) group-hover:text-(--rose) transition-colors">
                  Explore Salons
                </p>
                <p className="text-[11px] text-(--muted) truncate">
                  Find top-rated stylists near you
                </p>
              </div>
            </Link>

            <Link
              to="/owner"
              className="p-3.5 rounded-xl bg-(--surface) border border-(--line) hover:border-(--rose)/40 transition-all flex items-center gap-3 group"
            >
              <div className="size-9 rounded-lg bg-(--soft) flex items-center justify-center text-(--rose) shrink-0 group-hover:scale-105 transition-transform">
                <Compass size={17} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-(--ink) group-hover:text-(--rose) transition-colors">
                  Salon Workspace
                </p>
                <p className="text-[11px] text-(--muted) truncate">
                  Manage bookings & staff
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
