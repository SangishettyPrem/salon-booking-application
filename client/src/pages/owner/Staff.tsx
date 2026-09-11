import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Plus, Search, RotateCcw } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import StaffFormModal from "@/components/staff/StaffFormModal";
import type {
  StaffActionRequest,
  StaffMember,
  StaffRole,
} from "@/redux/features/staff/staff.types";
import { handleError, handleSuccess } from "@/utils/handleResponse";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux.hooks";
import {
  createStaff,
  deleteStaff,
  getStaff,
  updateStaff,
} from "@/redux/features/staff/staff.slice";
import Skeletons from "@/components/common/Skeletons";
import Error from "@/components/common/Error";
import RecordsNotFound from "@/components/common/RecordsNotFound";
import StaffCard from "@/components/staff/StaffCard";

const ROLE_FILTERS: ("All" | StaffRole)[] = [
  "All",
  "Senior Stylist",
  "Hair Specialist",
  "Color Master",
  "Skin & Spa Therapist",
  "Barber & Groomer",
  "Makeup Artist",
];

const Staff: React.FC = () => {
  const dispatch = useAppDispatch();
  const { salon } = useAppSelector((state) => state.salon);
  const { isLoading, isStaffFetched, error, staffList } = useAppSelector(
    (state) => state.staff,
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<"All" | StaffRole>("All");

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);

  // Fetch Live Staff Roster
  const loadStaff = useCallback(async () => {
    if (!salon?._id) return;
    try {
      await dispatch(getStaff(salon._id)).unwrap();
    } catch {}
  }, [dispatch, salon?._id]);

  useEffect(() => {
    if (salon?._id && !isStaffFetched) {
      loadStaff();
    }
  }, [salon?._id, isStaffFetched, loadStaff]);

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchesRole = selectedRole === "All" || s.role === selectedRole;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        s.name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.phone.includes(query) ||
        s.role.toLowerCase().includes(query);

      return matchesRole && matchesSearch;
    });
  }, [staffList, selectedRole, searchQuery]);

  // Actions
  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (member: StaffMember) => {
    setEditingStaff(member);
    setIsFormModalOpen(true);
  };

  const handleSaveStaff = async (staffData: StaffActionRequest) => {
    try {
      if (!salon?._id) return handleError("Salon not found!");
      await dispatch(
        createStaff({ request: staffData, salonId: salon._id }),
      ).unwrap();
      handleSuccess("Staff added successfully!");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsFormModalOpen(false);
      handleResetFilters();
    } catch (error: any) {
      handleError(error ?? "Failed to Add Staff. Try Again Later.");
    }
  };

  const handleUpdateStaff = async (staffData: StaffMember) => {
    try {
      if (!salon) return handleError("Bad Request!");
      await dispatch(
        updateStaff({
          request: staffData,
          staffId: staffData._id,
        }),
      ).unwrap();
      handleSuccess("Staff updated successfully!");
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsFormModalOpen(false);
      handleResetFilters();
    } catch (error: any) {
      handleError(error ?? "Failed to Update Staff. Try Again Later.");
    }
  };

  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;
    try {
      await dispatch(deleteStaff(staffToDelete._id)).unwrap();
      handleSuccess("Staff deleted successfully!");
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStaffToDelete(null);
      handleResetFilters();
    } catch (error: any) {
      handleError(error ?? "Failed to Delete Staff. Try Again Later.");
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedRole("All");
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-6 sm:space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeading
          title="Staff & Stylists"
          description="Manage your salon specialists, assigned treatments, and working roster."
        />
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-(--rose) text-white text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity shadow-xs shrink-0 cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Stylist</span>
        </button>
      </div>

      {/* 3. Search & Filter Controls */}
      <div className="p-4 sm:p-5 rounded-2xl bg-(--surface) border border-(--line) space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-(--muted)">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone, or specialty..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-(--paper) border border-(--line) text-sm text-(--ink) focus:outline-none focus:ring-2 focus:ring-(--rose) transition-all"
            />
          </div>

          {(searchQuery || selectedRole !== "All") && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-(--line) bg-(--soft) text-(--muted) hover:text-(--ink) text-xs font-semibold transition-colors shrink-0 cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Role Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {ROLE_FILTERS.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRole(role)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedRole === role
                  ? "bg-(--rose) text-white shadow-xs"
                  : "bg-(--soft) text-(--muted) hover:text-(--ink) border border-(--line)"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Skeletons />
      ) : error ? (
        <Error title="Staff" handleRefetch={loadStaff} error={error} />
      ) : filteredStaff.length === 0 ? (
        <RecordsNotFound
          title="No Staff Found"
          description={
            searchQuery || selectedRole !== "All"
              ? "There are no staff matching your active filters."
              : "Start by creating your first staff member."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredStaff.map((member) => (
            <div
              key={member._id}
              className="p-5 rounded-2xl bg-(--surface) border border-(--line) shadow-2xs hover:border-(--rose)/40 transition-all flex flex-col justify-between space-y-4"
            >
              <StaffCard
                member={member}
                handleOpenEditModal={handleOpenEditModal}
                setStaffToDelete={setStaffToDelete}
              />
            </div>
          ))}
        </div>
      )}

      {/* 5. Add / Edit Modal */}
      {isFormModalOpen && (
        <StaffFormModal
          isOpen={isFormModalOpen}
          staff={editingStaff}
          onClose={() => setIsFormModalOpen(false)}
          onSave={handleSaveStaff}
          onUpdate={handleUpdateStaff}
        />
      )}

      {/* 6. Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(staffToDelete)}
        title="Remove Stylist?"
        description={
          staffToDelete ? (
            <span>
              Are you sure you want to remove{" "}
              <strong className="text-(--ink)">{staffToDelete.name}</strong>{" "}
              from your salon team? All their future appointment assignments
              will need to be reallocated.
            </span>
          ) : undefined
        }
        confirmText="Remove Stylist"
        cancelText="Keep Stylist"
        variant="danger"
        onClose={() => setStaffToDelete(null)}
        onConfirm={handleDeleteStaff}
      />
    </div>
  );
};

export default Staff;
