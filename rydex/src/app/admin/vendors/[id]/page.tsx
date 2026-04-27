"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  Car,
  FileText,
  Landmark,
  ShieldCheck,
} from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

/* ================= PAGE ================= */

export default function AdminVendorReviewPage() {
  const { id } = useParams();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await axios.get(`/api/admin/vendors/${id}`);
      setData(res.data.vendor);
      setLoading(false);
    }
    load();
  }, [id]);

  const approveVendor = async () => {
    setActionLoading(true);
    await axios.post(`/api/admin/vendors/${id}/approve`);
    router.push("/admin/dashboard");
  };

  const rejectVendor = async () => {
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    await axios.post(`/api/admin/vendors/${id}/reject`, {
      reason: rejectReason,
    });
    router.push("/admin/dashboard");
  };

  if (loading)
    return (
      <div className="min-h-screen grid place-items-center text-slate-400">
        Loading vendor review…
      </div>
    );

  if (!data) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-white/10 border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full border-white/10 border flex items-center justify-center hover:bg-slate-800 transition"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex-1">
            <p className="font-semibold text-lg">{data.name}</p>
            <p className="text-xs text-slate-400">{data.email}</p>
          </div>

          <StatusBadge status={data.vendorStatus} />
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-3 gap-10">

        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-8">

          <AnimatedCard title="Vehicle Details" icon={<Car size={18} />}>
            <InfoRow label="Vehicle Type" value={data.vehicle?.type} />
            <InfoRow label="Registration Number" value={data.vehicle?.number} />
            <InfoRow label="Model" value={data.vehicle?.model} />
          </AnimatedCard>

          <AnimatedCard title="Documents" icon={<FileText size={18} />}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <DocPreview label="Aadhaar" url={data.documents?.aadhaarUrl} />
              <DocPreview label="License" url={data.documents?.licenseUrl} />
              <DocPreview label="RC" url={data.documents?.rcUrl} />
            </div>
          </AnimatedCard>

        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-8">

          <AnimatedCard title="Bank Details" icon={<Landmark size={18} />}>
            <InfoRow label="Account Holder" value={data.bank?.accountHolderName} />
            <InfoRow label="IFSC Code" value={data.bank?.ifsc} />
            <InfoRow label="UPI ID" value={data.bank?.upi || "—"} />
          </AnimatedCard>

          {data.vendorStatus === "pending" && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/60 border-white/10 border-white/10 text-white rounded-[32px] p-8 shadow-xl space-y-6"
            >
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck size={18} />
                Admin Decision
              </div>

              <p className="text-sm text-slate-400">
                Verify documents carefully before approving.
              </p>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => setShowApprove(true)}
                  className="py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white hover:from-sky-500 hover:to-indigo-500 font-semibold hover:opacity-90 transition"
                >
                  Approve Vendor
                </button>

                <button
                  onClick={() => setShowReject(true)}
                  className="py-3 rounded-2xl border-white/10 border font-semibold hover:bg-slate-800 transition"
                >
                  Reject Vendor
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* APPROVE MODAL */}
      <ConfirmModal
        open={showApprove}
        title="Approve Vendor?"
        description="Confirm all information has been verified."
        confirmText="Yes, Approve"
        loading={actionLoading}
        onClose={() => setShowApprove(false)}
        onConfirm={approveVendor}
      />

      {/* REJECT MODAL */}
      <RejectModal
        open={showReject}
        reason={rejectReason}
        setReason={setRejectReason}
        loading={actionLoading}
        onClose={() => setShowReject(false)}
        onConfirm={rejectVendor}
      />
    </div>
  );
}

/* ================= REUSABLE UI ================= */

function AnimatedCard({ title, icon, children }: any) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-slate-900/60 border-white/10 border-white/10 text-white rounded-[32px] p-8 shadow-xl space-y-6"
    >
      <div className="flex items-center gap-2 font-semibold">
        {icon}
        {title}
      </div>
      {children}
    </motion.div>
  );
}

function DocPreview({ label, url }: any) {
  const isImage = url?.match(/\.(jpg|jpeg|png|webp)$/i);
  const isPdf = url?.endsWith(".pdf");

  return (
    <div className="bg-slate-900/40 rounded-2xl border-white/10 border overflow-hidden shadow-sm">
      <div className="px-4 py-2 border-white/10 border-b text-sm font-semibold">
        {label}
      </div>

      <div className="h-52 flex items-center justify-center bg-slate-900/60 border-white/10 border-white/10 text-white">
        {!url && <span className="text-xs text-slate-500">Not uploaded</span>}

        {isImage && (
          <img src={url} className="w-full h-full object-cover" />
        )}

        {isPdf && <iframe src={url} className="w-full h-full" />}
      </div>

      {url && (
        <a
          href={url}
          target="_blank"
          className="block text-center text-xs py-2 font-medium hover:bg-slate-800"
        >
          Open full document
        </a>
      )}
    </div>
  );
}

function ConfirmModal({ open, title, description, confirmText, loading, onClose, onConfirm }: any) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-sky-600 hover:bg-sky-500/60 backdrop-blur-sm flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-slate-900/60 border-white/10 border-white/10 text-white rounded-3xl p-6 w-full max-w-sm"
          >
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="text-sm text-slate-400 mt-2">{description}</p>

            <div className="flex gap-3 mt-6">
              <button onClick={onClose} className="flex-1 py-2 rounded-xl border-white/10 border">
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RejectModal({ open, reason, setReason, loading, onClose, onConfirm }: any) {
  return (
    <ConfirmModal
      open={open}
      title="Reject Vendor"
      description={
        <textarea
          placeholder="Enter rejection reason (required)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full mt-3 border-white/10 border rounded-xl p-3 text-sm"
        />
      }
      confirmText="Reject"
      loading={loading}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}

function InfoRow({ label, value }: any) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold">{value || "—"}</span>
    </div>
  );
}

function StatusBadge({ status }: any) {
  if (status === "approved")
    return <Badge text="Approved" icon={<CheckCircle size={14} />} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" />;
  if (status === "rejected")
    return <Badge text="Rejected" icon={<XCircle size={14} />} className="bg-rose-500/10 text-rose-400 border border-rose-500/20" />;
  return <Badge text="Pending" icon={<Clock size={14} />} className="bg-amber-500/10 text-amber-400 border border-amber-500/20" />;
}

function Badge({ text, icon, className }: any) {
  return (
    <span className={`px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 ${className}`}>
      {icon}
      {text}
    </span>
  );
}
