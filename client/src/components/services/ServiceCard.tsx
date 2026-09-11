import type { Service } from "@/redux/features/services/services.types";
import { formatCurrency } from "@/utils";
import { Clock, Edit3, Trash2 } from "lucide-react";

interface ServiceCardProps {
  service: Service;
  handleOpenEditModal: (service: Service) => void;
  setServiceToDelete: (service: Service | null) => void;
}

const ServiceCard = ({
  service,
  handleOpenEditModal,
  setServiceToDelete,
}: ServiceCardProps) => {
  return (
    <div>
      {/* Card Top: Category & Tags */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-(--rose) bg-(--rose)/10 border border-(--rose)/20 px-2.5 py-0.5 rounded-full">
            {service.category}
          </span>
        </div>

        <div>
          <h3 className="text-base font-bold text-(--ink)">{service.name}</h3>
          <p className="text-xs text-(--muted) line-clamp-2 mt-1 leading-relaxed">
            {service.description || "No description provided."}
          </p>
        </div>
      </div>

      {/* Card Middle: Price & Duration */}
      <div className="p-3 rounded-xl bg-(--paper) border border-(--line) flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] text-(--muted) uppercase font-semibold block">
            Price
          </span>
          <span className="text-base font-extrabold text-(--ink)">
            {formatCurrency(service.price)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-(--muted) font-medium">
          <Clock size={14} className="text-(--rose)" />
          <span>{service.durationMinutes} mins</span>
        </div>
      </div>

      {/* Card Bottom: Status & Actions */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleOpenEditModal(service)}
            className="size-8 rounded-lg text-(--muted) hover:text-(--ink) hover:bg-(--soft) flex items-center justify-center transition-colors cursor-pointer"
            title="Edit Service"
          >
            <Edit3 size={15} />
          </button>
          <button
            type="button"
            onClick={() => setServiceToDelete(service)}
            className="size-8 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 flex items-center justify-center transition-colors cursor-pointer"
            title="Delete Service"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
