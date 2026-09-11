import type { StaffMember } from "@/redux/features/staff/staff.types";
import { Edit3, Mail, Phone, Trash2 } from "lucide-react";

interface StaffCardProps {
  member: StaffMember;
  handleOpenEditModal: (staff: StaffMember) => void;
  setStaffToDelete: (staff: StaffMember) => void;
}

const StaffCard = ({
  member,
  handleOpenEditModal,
  setStaffToDelete,
}: StaffCardProps) => {
  return (
    <div>
      {/* Top: Avatar, Name, Role & Status */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-(--soft) border border-(--line) text-(--rose) font-bold flex items-center justify-center text-base shrink-0 shadow-inner">
              {member.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <h3 className="font-bold text-sm text-(--ink)">{member.name}</h3>
              <p className="text-xs text-(--muted) font-medium">
                {member.role}
              </p>
            </div>
          </div>
        </div>

        {/* Contacts */}
        <div className="space-y-1 text-xs text-(--muted)">
          <div className="flex items-center gap-2">
            <Phone size={13} className="text-(--rose) shrink-0" />
            <span>+91 {member.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={13} className="text-(--rose) shrink-0" />
            <span className="truncate">{member.email}</span>
          </div>
        </div>

        {/* Assigned Services Pills */}
        {member.assignedServices && member.assignedServices.length > 0 && (
          <div className="pt-2">
            <p className="text-[10px] uppercase font-bold text-(--muted) tracking-wider mb-1.5">
              Assigned Specialties
            </p>
            <div className="flex flex-wrap gap-1">
              {member.assignedServices.slice(0, 3).map((serviceName, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-(--soft) text-(--ink) border border-(--line) truncate max-w-36"
                >
                  {serviceName}
                </span>
              ))}
              {member.assignedServices.length > 3 && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold text-(--rose) bg-(--rose)/10">
                  +{member.assignedServices.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleOpenEditModal(member)}
            className="size-8 rounded-lg text-(--muted) hover:text-(--ink) hover:bg-(--soft) flex items-center justify-center transition-colors cursor-pointer"
            title="Edit Stylist"
          >
            <Edit3 size={15} />
          </button>
          <button
            type="button"
            onClick={() => setStaffToDelete(member)}
            className="size-8 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 flex items-center justify-center transition-colors cursor-pointer"
            title="Remove Stylist"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffCard;
