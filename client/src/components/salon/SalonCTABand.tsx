import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SalonCTABand = () => {
  const navigate = useNavigate();
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl from-(--ink) via-(--ink)/90 to-neutral-900 text-white p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 relative z-10 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-(--rose)">
            Are You a Salon Owner?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Grow your client base with GlowBook.
          </h2>
          <p className="text-xs sm:text-sm text-(--ink)/80">
            Manage your services, staff roster, appointments, and instant online
            Razorpay payouts in one elegant dashboard.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/register")}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-(--rose) text-white text-xs sm:text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shrink-0 cursor-pointer relative z-10"
        >
          <span>List Your Salon</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
};

export default SalonCTABand;
