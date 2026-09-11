import { Store } from "lucide-react";
import React from "react";

interface NotFoundProps {
  title: string;
  description: string;
}

const RecordsNotFound: React.FC<NotFoundProps> = ({ title, description }) => {
  return (
    <div className="py-16 text-center rounded-3xl bg-(--surface) border border-(--line) p-8 space-y-4">
      <div className="size-16 mx-auto rounded-2xl bg-(--soft) flex items-center justify-center text-(--muted)">
        <Store size={30} />
      </div>
      <h3 className="text-xl font-bold text-(--ink)">{title}</h3>
      <p className="text-xs sm:text-sm text-(--muted) max-w-md mx-auto">
        {description}
      </p>
    </div>
  );
};

export default RecordsNotFound;
