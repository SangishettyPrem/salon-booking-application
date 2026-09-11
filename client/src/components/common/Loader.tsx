import React from "react";
import { Loader2 } from "lucide-react";

interface LoaderProps {
  isFullPageRequired?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ isFullPageRequired = true }) => {
  return (
    <div
      className={`${
        isFullPageRequired ? "h-screen w-screen" : "h-[50vh] w-full"
      } flex flex-col justify-center items-center gap-3 bg-(--paper)`}
    >
      <Loader2
        size={36}
        className="animate-spin text-(--rose) stroke-[2.25]"
        aria-label="Loading…"
      />
    </div>
  );
};

export default Loader;
