"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Lock,
  ArrowRight,
  Clock,
  IndianRupee,
  ImagePlus,
  AlertTriangle,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import PartnerEarningsChart from "./PartnerEarningChart";

/* ================= TYPES ================= */

type VendorStatus = "pending" | "approved" | "rejected";

type ReviewStatus = "pending" | "approved" | "rejected";

type VideoKycStatus =
  | "not_required"
  | "pending"
  | "in_progress"
  | "approved"
  | "rejected";

type PricingData = {
  baseFare?: number;
  pricePerKm?: number;
  waitingCharge?: number;
  imageUrl?: string;
  status?: ReviewStatus;
  rejectionReason?: string;
};

type Step = {
  id: number;
  title: string;
  route?: string;
};

/* ================= STEPS ================= */

const STEPS: Step[] = [
  { id: 1, title: "Vehicle", route: "/partner/onboard/vehicle" },
  { id: 2, title: "Documents", route: "/partner/onboard/documents" },
  { id: 3, title: "Bank", route: "/partner/onboard/bank" },
  { id: 4, title: "Review" },
  { id: 5, title: "Video KYC" },
  { id: 6, title: "Pricing" },
  { id: 7, title: "Final Review" },
  { id: 8, title: "Live" },
];

const TOTAL_STEPS = STEPS.length;

/* ================= DASHBOARD ================= */

export default function VendorDashboard({
  vendorStep,
  vendorStatus,
}: {
  vendorStep: number;
  vendorStatus: VendorStatus;
}) {
  const router = useRouter();
  const { userData } = useSelector((state: RootState) => state.user);

  const [showPricing, setShowPricing] = useState(false);
  const [pricing, setPricing] = useState<PricingData | null>(null);

  const requestKycAgain = async () => {
    try {
      await axios.patch("/api/partner/video-kyc/request");
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const getActiveStep = () => {
    const step = vendorStep + 1;

    if (step > 5 && userData?.videoKycStatus !== "approved") {
      return 5;
    }

    return Math.min(step, TOTAL_STEPS);
  };

  const activeStep = getActiveStep();

  const progressPercent = ((activeStep - 1) / (TOTAL_STEPS - 1)) * 100;

  const videoKycStatus: VideoKycStatus =
    userData?.videoKycStatus || "not_required";

  const roomId = userData?.videoKycRoomId;

  /* ================= LOAD PRICING ================= */

  useEffect(() => {
    axios
      .get("/api/partner/vehicle/pricing")
      .then((res) => setPricing(res.data.pricing))
      .catch(() => {});
  }, []);

  /* ================= NAVIGATION ================= */

  const goToStep = (step: Step) => {
    if (step.id === 6 && vendorStatus === "approved") {
      setShowPricing(true);
      return;
    }

    if (step.route && step.id <= activeStep) {
      router.push(step.route);
    }
  };

  /* ================= STATUS SECTION ================= */

  const renderStatus = () => {
    /* ===== DOCUMENT REVIEW REJECTED ===== */
    if (activeStep === 4 && vendorStatus === "rejected") {
      return (
        <RejectionCard
          title="Documents Rejected"
          reason={userData?.vendorRejectionReason}
          actionLabel="Update Documents"
          onAction={() => router.push("/partner/onboard/documents")}
        />
      );
    }

    /* ===== DOCUMENT REVIEW PENDING ===== */
    if (activeStep === 4 && vendorStatus === "pending") {
      return (
        <StatusCard
          icon={<Clock size={20} />}
          title="Documents Under Review"
          desc="Admin is verifying your documents. This usually takes 24 hours."
        />
      );
    }

    /* ===== VIDEO KYC STEP ===== */
    if (activeStep === 5) {
      if (videoKycStatus === "approved") {
        return (
          <StatusCard
            icon={<Check size={20} />}
            title="Video KYC Approved"
            desc="You're verified! You can now proceed to set your pricing."
          />
        );
      }

      if (videoKycStatus === "rejected") {
        return (
          <RejectionCard
            title="Video KYC Rejected"
            reason={userData?.videoKycRejectionReason}
            actionLabel="Request Again"
            onAction={requestKycAgain}
          />
        );
      }

      if (videoKycStatus === "in_progress" && roomId) {
        return (
          <ActionCard
            icon={<Video size={20} />}
            title="Admin Started Video KYC"
            button="Join Secure Call"
            onClick={() => router.push(`/video-kyc/${roomId}`)}
          />
        );
      }

      return (
        <StatusCard
          icon={<Clock size={20} />}
          title="Waiting for Admin"
          desc="Admin will initiate your Video KYC shortly."
        />
      );
    }

    /* ===== PRICING REVIEW ===== */
    if (activeStep === 7 && pricing?.status === "pending") {
      return (
        <StatusCard
          icon={<Clock size={20} />}
          title="Pricing Under Review"
          desc="Admin is reviewing your vehicle pricing models."
        />
      );
    }

    /* ===== PRICING REJECTED ===== */
    if (pricing?.status === "rejected") {
      return (
        <RejectionCard
          title="Pricing Rejected"
          reason={pricing.rejectionReason}
          actionLabel="Edit & Resubmit"
          onAction={() => setShowPricing(true)}
        />
      );
    }

    /* ===== LIVE ===== */
    if (activeStep === 8 && pricing?.status === "approved") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-panel border-blue-500/30 text-white rounded-3xl p-10 shadow-[0_0_40px_rgba(37,99,235,0.2)] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-blue-500/30 transition-colors pointer-events-none" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold tracking-wider mb-6">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              STATUS: ONLINE
            </div>
            <h2 className="text-4xl font-black mb-3">🚀 You&apos;re Live!</h2>
            <p className="text-slate-300 mb-8 max-w-lg">Your profile is active. You will now receive ride requests in your dashboard. Stay online to maximize earnings.</p>

            <button
              onClick={() => router.push("/vendor/orders")}
              className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold flex items-center gap-3 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all group-hover:gap-4"
            >
              Go to Driver Dashboard <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
      );
    }

    return null;
  };

  /* ================= UI ================= */

  return (
    <section className="min-h-screen bg-[#06080F] text-white px-4 pt-28 pb-20">
      <div className="max-w-7xl mx-auto space-y-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Partner Portal</h1>
          <p className="text-slate-400 mt-2 text-lg">
            Complete the onboarding steps to start earning.
          </p>
        </div>

        {/* PROGRESS UI */}
        <div className="premium-panel rounded-3xl p-8 md:p-10 border-white/5 overflow-x-auto relative">
          <div className="relative min-w-[800px] py-4">
            {/* Background Track */}
            <div className="absolute top-1/2 -translate-y-1/2 left-[3%] w-[94%] h-[4px] bg-slate-800 rounded-full" />

            {/* Glowing Active Track */}
            <motion.div
              animate={{ width: `${progressPercent * 0.94}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute top-1/2 -translate-y-1/2 left-[3%] h-[4px] bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]"
            />

            <div className="relative flex justify-between">
              {STEPS.map((step) => {
                const completed = activeStep > step.id;
                const active = activeStep === step.id;
                const locked = step.id > activeStep;

                let circleClass = "";
                let textClass = "";

                if (completed) {
                  circleClass = "bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]";
                  textClass = "text-blue-400";
                } else if (active) {
                  circleClass = "border-blue-500 bg-[#06080F] text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]";
                  textClass = "text-white";
                } else {
                  circleClass = "border-slate-800 bg-slate-900/50 text-slate-600";
                  textClass = "text-slate-600";
                }

                return (
                  <motion.div
                    key={step.id}
                    whileHover={!locked ? { y: -5 } : {}}
                    onClick={() => goToStep(step)}
                    className="flex flex-col items-center z-10 cursor-pointer w-20"
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${circleClass}`}
                    >
                      {completed ? (
                        <Check size={20} strokeWidth={3} />
                      ) : locked ? (
                        <Lock size={18} />
                      ) : (
                        <span className="font-bold text-lg">{step.id}</span>
                      )}
                    </div>

                    <p className={`mt-4 text-xs font-bold text-center tracking-wide uppercase ${textClass}`}>
                      {step.title}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {renderStatus()}
        
        {/* Only show earnings chart if active step is fairly far along or live */}
        {activeStep >= 6 && <PartnerEarningsChart />}
      </div>

      <PricingModal
        open={showPricing}
        onClose={() => setShowPricing(false)}
        pricing={pricing}
      />
    </section>
  );
}

/* ================= PRICING MODAL ================= */

function PricingModal({ open, onClose, pricing }: any) {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [baseFare, setBaseFare] = useState("");
  const [pricePerKm, setPricePerKm] = useState("");
  const [waitingCharge, setWaitingCharge] = useState("");
  const [loading, setLoading] = useState(false);

  const submitPricing = async () => {
    const formData = new FormData();
    if (image) formData.append("image", image);
    formData.append("baseFare", baseFare);
    formData.append("pricePerKm", pricePerKm);
    formData.append("waitingCharge", waitingCharge);

    setLoading(true);
    await axios.post("/api/partner/vehicle/pricing", formData);
    setLoading(false);
    window.location.reload();
  };

  useEffect(() => {
    if (pricing) {
      setTimeout(() => {
        setBaseFare(pricing.baseFare?.toString() || "");
        setPricePerKm(pricing.pricePerKm?.toString() || "");
        setWaitingCharge(pricing.waitingCharge?.toString() || "");
        setPreview(pricing.imageUrl || null);
      }, 0);
    }
  }, [pricing, open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 px-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="premium-glass bg-[#0F172A]/90 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-white/10"
          >
            <div className="p-6 border-b border-white/10 bg-white/5">
              <h2 className="text-xl font-bold text-white">Configure Pricing & Image</h2>
            </div>

            <div className="p-6 space-y-6">
              <label className="relative h-48 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-slate-900/50 transition-colors group">
                {!preview ? (
                  <>
                    <ImagePlus size={32} className="text-slate-500 group-hover:text-blue-400 transition-colors mb-3" />
                    <span className="text-sm font-medium text-slate-400 group-hover:text-blue-300">Upload Vehicle Photo</span>
                  </>
                ) : (
                  <img
                    src={preview}
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                )}

                <input
                  hidden
                  type="file"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setImage(e.target.files[0]);
                      setPreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                />
              </label>

              <PriceInput label="Base Fare" value={baseFare} onChange={setBaseFare} />
              <PriceInput label="Price per KM" value={pricePerKm} onChange={setPricePerKm} />
              <PriceInput label="Waiting charge / min" value={waitingCharge} onChange={setWaitingCharge} />
            </div>

            <div className="p-6 border-t border-white/10 flex gap-4 bg-white/5">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl py-3 text-sm font-bold text-slate-300 hover:bg-white/10 transition border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={submitPricing}
                disabled={loading}
                className="flex-[2] bg-blue-600 text-white rounded-xl py-3 text-sm font-bold hover:bg-blue-500 transition shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving Data..." : "Save Configuration"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ================= SMALL COMPONENTS ================= */

/* ================= STATUS CARD ================= */

function StatusCard({ icon, title, desc }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-panel rounded-3xl p-6 sm:p-8 border border-white/5 flex flex-col sm:flex-row gap-5 items-start sm:items-center relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 p-4 rounded-2xl shrink-0">
        {icon}
      </div>

      <div className="flex-1">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-slate-400 mt-2 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

/* ================= ACTION CARD ================= */

function ActionCard({ icon, title, button, onClick }: any) {
  return (
    <div className="premium-panel rounded-3xl p-6 sm:p-8 border border-blue-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden bg-blue-900/10">
      <div className="flex items-center gap-5">
        <div className="bg-blue-600 text-white p-4 rounded-2xl shrink-0 shadow-[0_0_15px_rgba(37,99,235,0.5)]">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>

      <button
        onClick={onClick}
        className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] transition hover:bg-blue-500"
      >
        {button}
      </button>
    </div>
  );
}

/* ================= REJECTION CARD ================= */

function RejectionCard({ title, reason, actionLabel, onAction }: any) {
  return (
    <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-6 sm:p-8 space-y-5 relative overflow-hidden">
      <div className="flex items-center gap-3 text-rose-400 font-bold text-lg">
        <AlertTriangle size={22} />
        {title}
      </div>

      <div className="bg-[#0F172A]/80 border border-rose-500/20 rounded-2xl p-5 text-slate-300 text-sm leading-relaxed backdrop-blur-sm">
        <span className="text-[10px] text-rose-400/80 uppercase font-bold tracking-wider block mb-1">Reason for Rejection</span>
        {reason || "No specific reason provided. Please contact support."}
      </div>

      {onAction && (
        <button
          onClick={onAction}
          className="w-full sm:w-auto px-8 py-3.5 bg-rose-600 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:bg-rose-500 transition"
        >
          {actionLabel || "Retry Submission"}
        </button>
      )}
    </div>
  );
}

function PriceInput({ label, value, onChange }: any) {
  return (
    <div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex items-center gap-3 border border-slate-700 rounded-xl px-4 py-3.5 bg-slate-900/50 focus-within:border-blue-500 focus-within:bg-slate-900 transition-colors">
        <IndianRupee size={16} className="text-slate-500" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent outline-none text-white font-medium placeholder-slate-600"
          placeholder="0.00"
        />
      </div>
    </div>
  );
}
