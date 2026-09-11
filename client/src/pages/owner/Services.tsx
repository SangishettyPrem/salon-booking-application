import { useState, useMemo, useEffect, useCallback } from "react";
import { Plus, Search, RotateCcw } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import ServiceFormModal from "@/components/services/ServiceFormModal";
import { handleError, handleSuccess } from "@/utils/handleResponse";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux.hooks";
import {
  createService,
  deleteService,
  fetchServicesBySalon,
  updateService,
} from "@/redux/features/services/services.slice";
import type {
  Service,
  ServiceCategory,
} from "@/redux/features/services/services.types";
import Skeletons from "@/components/common/Skeletons";
import Error from "@/components/common/Error";
import RecordsNotFound from "@/components/common/RecordsNotFound";
import ServiceCard from "@/components/services/ServiceCard";

const CATEGORY_TABS: ("All" | ServiceCategory)[] = [
  "All",
  "Haircut & Styling",
  "Beard & Grooming",
  "Skin & Facials",
  "Hair Color & Highlights",
  "Spa & Massage",
  "Bridal & Makeover",
];

const Services = () => {
  const { error, isLoading, isServicesFetched, services } = useAppSelector(
    (state) => state.services,
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<
    "All" | ServiceCategory
  >("All");
  const dispatch = useAppDispatch();
  const { salon } = useAppSelector((state) => state.salon);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  // Fetch Services from Live Backend
  const loadServices = useCallback(async () => {
    try {
      if (!salon?._id) {
        return handleError("Bad Request!");
      }
      await dispatch(fetchServicesBySalon({ salonId: salon._id })).unwrap();
    } catch {}
  }, []);

  useEffect(() => {
    if (isServicesFetched) return;
    loadServices();
  }, [dispatch]);

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesCategory =
        selectedCategory === "All" || s.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        s.name.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  // Actions
  const handleOpenAddModal = () => {
    setEditingService(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (service: Service) => {
    setEditingService(service);
    setIsFormModalOpen(true);
  };

  const handleSaveService = async (service: Service) => {
    try {
      if (service._id) {
        await dispatch(
          updateService({ serviceId: service._id, service }),
        ).unwrap();
      } else {
        if (!salon?._id) {
          return handleError("Bad Request!");
        }
        await dispatch(createService({ salonId: salon._id, service })).unwrap();
      }
      handleSuccess("Service saved successfully");
      await new Promise((resolve) => setTimeout(resolve, 800));
      handleClose();
    } catch (error: any) {
      return handleError(error ?? "Failed to save service");
    }
  };

  const handleDeleteService = async () => {
    try {
      if (!serviceToDelete?._id) {
        return handleError("Bad Request!");
      }
      await dispatch(deleteService(serviceToDelete._id)).unwrap();
      handleSuccess("Service deleted successfully");
      await new Promise((resolve) => setTimeout(resolve, 800));
      handleClose();
    } catch (error: any) {
      return handleError(error ?? "Failed to delete service");
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  const handleClose = () => {
    setIsFormModalOpen(false);
    setEditingService(null);
    setServiceToDelete(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-6 sm:space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeading
          title="Services Catalog"
          description="Manage treatments, pricing, and service offerings for your salon."
        />
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-(--rose) text-white text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity shadow-xs shrink-0 cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Service</span>
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-(--surface) border border-(--line) space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-(--muted)">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search service name, category, or description..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-(--paper) border border-(--line) text-sm text-(--ink) focus:outline-none focus:ring-2 focus:ring-(--rose) transition-all"
            />
          </div>

          {(searchQuery || selectedCategory !== "All") && (
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

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-(--rose) text-white shadow-xs"
                  : "bg-(--soft) text-(--muted) hover:text-(--ink) border border-(--line)"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Skeletons />
      ) : error ? (
        <Error title="Services" handleRefetch={loadServices} error={error} />
      ) : filteredServices.length === 0 ? (
        <RecordsNotFound
          title="No Services Found"
          description={
            searchQuery || selectedCategory !== "All"
              ? "There are no services matching your active filters."
              : "Start by creating your first salon service."
          }
        />
      ) : (
        <>
          <span className="text-sm font-semibold text-(--rose) p-2 m-0 flex justify-end">
            {filteredServices.length} Services Available
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredServices.map((service) => (
              <div
                key={service._id}
                className="p-5 rounded-2xl bg-(--paper) border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-2xs hover:border-(--rose)/40"
              >
                <ServiceCard
                  handleOpenEditModal={handleOpenEditModal}
                  service={service}
                  setServiceToDelete={setServiceToDelete}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {/* 5. Add / Edit Service Modal */}
      <ServiceFormModal
        isOpen={isFormModalOpen}
        service={editingService}
        onClose={handleClose}
        onSave={handleSaveService}
      />

      {/* 6. Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(serviceToDelete)}
        title="Delete Service?"
        description={
          serviceToDelete ? (
            <span>
              Are you sure you want to delete{" "}
              <strong className="text-(--ink)">{serviceToDelete.name}</strong>?
              This service will no longer be available for customer bookings.
            </span>
          ) : undefined
        }
        confirmText="Delete Service"
        cancelText="Keep Service"
        variant="danger"
        onClose={handleClose}
        onConfirm={handleDeleteService}
      />
    </div>
  );
};

export default Services;
