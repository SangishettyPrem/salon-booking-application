import React, { useState, useEffect, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  CreditCard,
  Store,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Coins,
  BarChart3,
  Search,
  User,
  Ticket,
} from "lucide-react";
import { useAppSelector } from "@/redux/hooks/redux.hooks";

export interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string | number;
  exact?: boolean;
}

export interface NavSection {
  items: NavItem[];
}

export interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const roleNavPresets: Record<string, NavSection[]> = {
  owner: [
    {
      items: [
        {
          label: "Dashboard",
          path: "/owner",
          icon: LayoutDashboard,
          exact: true,
        },
        { label: "Bookings", path: "/owner/bookings", icon: Calendar },
        { label: "Services", path: "/owner/services", icon: Scissors },
        { label: "Staff", path: "/owner/staff", icon: Users },
        { label: "Payments", path: "/owner/payments", icon: CreditCard },
        { label: "Salon Profile", path: "/owner/profile", icon: Store },
      ],
    },
  ],
  customer: [
    {
      items: [
        { label: "Find Salons", path: "/", icon: Search, exact: true },
        { label: "My Bookings", path: "/bookings", icon: Calendar },
      ],
    },
    {
      items: [{ label: "My Profile", path: "/profile", icon: User }],
    },
  ],
  staff: [
    {
      items: [
        { label: "Schedule", path: "/staff", icon: Clock, exact: true },
        { label: "Appointments", path: "/staff/bookings", icon: Calendar },
        { label: "My Clients", path: "/staff/clients", icon: Users },
        { label: "Earnings", path: "/staff/earnings", icon: Coins },
      ],
    },
    {
      items: [{ label: "My Profile", path: "/profile", icon: User }],
    },
  ],
  admin: [
    {
      items: [
        {
          label: "Platform Pulse",
          path: "/admin",
          icon: LayoutDashboard,
          exact: true,
        },
        { label: "Salons", path: "/admin/salons", icon: Store },
        { label: "Users & Staff", path: "/admin/users", icon: Users },
        { label: "Bookings", path: "/admin/bookings", icon: Calendar },
      ],
    },
    {
      items: [
        { label: "Coupons & Offers", path: "/admin/coupons", icon: Ticket },
        { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
      ],
    },
  ],
};

const Sidebar = ({ mobileOpen, setMobileOpen }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const { user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  const closeDrawer = () => setMobileOpen(false);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  // Determine active role
  const activeRole = (user?.role || "customer").toLowerCase();

  // Navigation sections based on role
  const navSections = useMemo(() => {
    return roleNavPresets[activeRole] || roleNavPresets.customer;
  }, [activeRole]);

  // Reusable Navigation List component
  const renderNavList = (isCollapsedMode: boolean, isMobileView: boolean) => {
    return (
      <div className="flex-1 space-y-4 overflow-y-auto px-3 py-4 scrollbar-thin">
        {navSections.map((section, index) => (
          <div key={index} className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isExact =
                item.exact !== undefined
                  ? item.exact
                  : item.path === "/owner" ||
                    item.path === "/" ||
                    item.path === "/staff" ||
                    item.path === "/admin";

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={isExact}
                  onClick={() => {
                    if (isMobileView) closeDrawer();
                  }}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--rose) ${
                      isCollapsedMode
                        ? "justify-center size-11 mx-auto"
                        : "px-3.5 py-2.5 text-sm font-medium"
                    } ${
                      isActive
                        ? "bg-(--rose)/10 text-(--rose) font-semibold shadow-xs"
                        : "text-(--muted) hover:bg-(--soft) hover:text-(--ink)"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active indicator bar */}
                      {isActive && !isCollapsedMode && (
                        <span
                          className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-(--rose)"
                          aria-hidden="true"
                        />
                      )}

                      {/* Icon */}
                      <Icon
                        size={19}
                        className={`shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                          isActive
                            ? "text-(--rose)"
                            : "text-(--muted) group-hover:text-(--ink)"
                        }`}
                      />

                      {/* Label */}
                      {!isCollapsedMode && (
                        <span className="truncate">{item.label}</span>
                      )}

                      {/* Badge */}
                      {!isCollapsedMode && item.badge && (
                        <span className="ml-auto rounded-full bg-(--rose)/15 px-2 py-0.5 text-[11px] font-bold text-(--rose)">
                          {item.badge}
                        </span>
                      )}

                      {/* Collapsed Tooltip (Desktop Only) */}
                      {isCollapsedMode && (
                        <span
                          role="tooltip"
                          className="pointer-events-none absolute left-full ml-3.5 hidden rounded-lg bg-(--ink) px-2.5 py-1.5 text-xs font-semibold text-white whitespace-nowrap opacity-0 shadow-lg transition-opacity duration-150 group-hover:block group-hover:opacity-100 z-50"
                        >
                          {item.label}
                          <span
                            className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-(--ink)"
                            aria-hidden="true"
                          />
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. LAPTOP & DESKTOP SIDEBAR (Visible on lg+ screens)                      */}
      {/* ========================================================================= */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 h-screen sticky top-0 border-r border-(--line) bg-(--surface) text-(--ink) transition-all duration-300 ease-in-out z-20 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Desktop Header */}
        <div
          className={`flex h-19 items-center border-b border-(--line) px-4 transition-all ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!isCollapsed ? (
            <>
              <span className=" text-xs font-bold uppercase tracking-wider text-(--muted) ">
                Welcome{" "}
                <span className=" text-(--rose)">{user?.name || ""}</span>
              </span>
              <button
                type="button"
                onClick={toggleCollapse}
                aria-label="Collapse sidebar"
                className="flex size-8 items-center justify-center rounded-lg text-(--muted) transition-colors hover:bg-(--soft) hover:text-(--ink) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--rose)"
              >
                <ChevronLeft size={18} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={toggleCollapse}
              aria-label="Expand sidebar"
              className="flex size-8 items-center justify-center rounded-lg text-(--muted) transition-colors hover:bg-(--soft) hover:text-(--ink) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--rose)"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>

        {/* Desktop Nav Items */}
        {renderNavList(isCollapsed, false)}
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE & TABLET DRAWER (Screens below lg)                              */}
      {/* ========================================================================= */}
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity duration-300 lg:hidden ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Slide-out Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-72 max-w-[85vw] h-full bg-(--surface) text-(--ink) shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex h-16 items-center justify-between border-b border-(--line) px-4">
          <span className="truncate text-xs font-bold uppercase tracking-wider text-(--muted)">
            {`Welcome ${user?.name || ""}`}
          </span>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close navigation menu"
            className="flex size-9 items-center justify-center rounded-lg text-(--muted) hover:bg-(--soft) hover:text-(--ink) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--rose)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Nav Items (Always full labels in mobile drawer) */}
        {renderNavList(false, true)}
      </aside>
    </>
  );
};

export default Sidebar;
