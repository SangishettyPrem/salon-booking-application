import { Link } from "react-router-dom";
import type { QuickActionItem } from "@/shared/types/dashboard.types";

interface QuickActionsProps {
  actions: QuickActionItem[];
}

const QuickActions = ({ actions }: QuickActionsProps) => {
  return (
    <div className="p-5 rounded-2xl bg-(--surface) border border-(--line)">
      <h3 className="text-xs font-bold uppercase tracking-wider text-(--muted) mb-3">
        Quick Actions
      </h3>
      <div className="flex flex-wrap items-center gap-3">
        {actions.map((action) => (
          <Link
            key={action.path + action.label}
            to={action.path}
            className={
              action.variant === "primary"
                ? "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-(--rose) text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                : "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-(--soft) text-(--ink) border border-(--line) text-sm font-semibold hover:bg-(--line)/40 transition-colors"
            }
          >
            {action.icon}
            <span>{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
