import React, { useEffect, useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import {
  Sparkles,
  Star,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux.hooks";
import SalonCard from "@/components/salon/SalonCard";
import heroImg from "@/assets/images/hero.png";
import SalonCTABand from "@/components/salon/SalonCTABand";
import { getAllSalon } from "@/redux/features/salon/salon.slice";
import { getSalonKey } from "@/utils";
import Skeletons from "@/components/common/Skeletons";
import Error from "@/components/common/Error";
import RecordsNotFound from "@/components/common/RecordsNotFound";

const ITEMS_PER_PAGE = 6;

const HomePage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { isSalonsLoading, salons, error, pagination } = useAppSelector(
    (state) => state.salon,
  );
  const dispatch = useAppDispatch();

  if (user?.role === "owner") {
    return <Navigate to="/owner" replace />;
  }

  const [currentPage, setCurrentPage] = useState<number>(1);

  const currentKey = useMemo(
    () => getSalonKey(currentPage, ITEMS_PER_PAGE),
    [currentPage],
  );

  // Fetch salons for current page and filters
  const fetchSalon = (pageToFetch: number = currentPage) => {
    dispatch(
      getAllSalon({
        page: pageToFetch,
        limit: ITEMS_PER_PAGE,
      }),
    );
  };

  // Fetch when page changes, skipping network request if key is already cached
  useEffect(() => {
    const key = getSalonKey(currentPage, ITEMS_PER_PAGE);
    if (!salons?.[key]) {
      fetchSalon(currentPage);
    }
  }, [currentPage, dispatch]);

  const handleRefetch = () => {
    fetchSalon(currentPage);
  };

  // Salons to display for the active page
  const displayedSalons = useMemo(() => {
    return salons?.[currentKey] || [];
  }, [salons, currentKey]);

  // Pagination calculations from backend
  const totalItems = pagination?.total || 0;
  const totalPages = pagination?.pages || 1;

  const scrollToSalons = () => {
    const el = document.getElementById("featured-salons");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    scrollToSalons();
  };

  return (
    <div className="w-full space-y-12 sm:space-y-16 pb-16">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-20 bg-linear-to-b from-(--soft)/60 via-(--surface) to-transparent border-b border-(--line)/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-(--rose)/10 text-(--rose) border border-(--rose)/20 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={14} />
                <span>Your Next Favourite Salon Experience</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-(--ink) tracking-tight leading-[1.15]">
                Feel good,{" "}
                <span className="text-(--rose) italic font-serif">
                  right on time.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-(--muted) max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Discover premier local salons, choose certified stylists you
                trust, and instantly secure your appointment with secure online
                payment.
              </p>
            </div>

            {/* Right Photo Mosaic */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-(--line) aspect-4/3 sm:aspect-16/10 lg:aspect-square">
                <img
                  src={heroImg}
                  alt="Modern salon interior"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

                {/* Floating Tag Top */}
                <div className="absolute top-4 left-4 p-3 rounded-2xl bg-white/95 text-neutral-900 shadow-xl backdrop-blur-xs flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
                    <Star size={18} className="fill-amber-500" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold block">
                      4.9 / 5.0 Rating
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      15,000+ happy clients
                    </span>
                  </div>
                </div>

                {/* Floating Tag Bottom */}
                <div className="absolute bottom-4 right-4 p-3 rounded-2xl bg-white/95 text-neutral-900 shadow-xl backdrop-blur-xs flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold block">
                      Verified Salons
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SALON FEED SECTION                                                     */}
      {/* ========================================================================= */}
      <section
        id="featured-salons"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-(--line) pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-(--rose)">
              Explore & Book
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-(--ink) tracking-tight">
              Featured Salons in {"Your City"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-(--muted) font-medium">
              {totalItems} salons available
            </span>
          </div>
        </div>

        {/* Loading Skeletons */}
        {isSalonsLoading ? (
          <Skeletons />
        ) : error && displayedSalons.length === 0 ? (
          <Error handleRefetch={handleRefetch} error={error} title="Salons" />
        ) : displayedSalons.length === 0 ? (
          <RecordsNotFound
            title="No Salons Found"
            description="We couldn't find any salons matching your search terms. Try adjusting your city, treatment category, or clear the filters."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedSalons.map((salon, index) => (
                <SalonCard key={salon._id || index} salon={salon} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-8 border-t border-(--line) flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-(--muted) font-medium">
                  Showing{" "}
                  <strong className="text-(--ink)">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                  </strong>{" "}
                  to{" "}
                  <strong className="text-(--ink)">
                    {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
                  </strong>{" "}
                  of <strong className="text-(--ink)">{totalItems}</strong>{" "}
                  salons
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-(--line) bg-(--surface) text-xs font-bold text-(--ink) hover:bg-(--soft) disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={15} />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => handlePageChange(pageNum)}
                          className={`size-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            currentPage === pageNum
                              ? "bg-(--rose) text-white shadow-xs"
                              : "border border-(--line) bg-(--surface) text-(--ink) hover:bg-(--soft)"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ),
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-(--line) bg-(--surface) text-xs font-bold text-(--ink) hover:bg-(--soft) disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 3. SALON OWNER CTA BAND                                                   */}
      {/* ========================================================================= */}
      <SalonCTABand />
    </div>
  );
};

export default HomePage;
