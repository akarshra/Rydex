"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ArrowRight,
  Truck,
  Video,
} from "lucide-react";
import axios from "axios";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import AdminEarningsChart from "@/components/AdminEarning";
import StatusAreaChart from "@/components/AdminStatusChart";
import Footer from "@/components/Footer";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
/* ================= TYPES ================= */

type Stats = {
  totalVendors: number;
  approved: number;
  pending: number;
  rejected: number;
};

type TabType = "kyc" | "vendor" | "vehicle";

/* ================= PAGE ================= */

export default function AdminDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [vendorReviews, setVendorReviews] = useState<any[]>([]);
  const [vehicleReviews, setVehicleReviews] = useState<any[]>([]);
  const [videoKycReviews, setVideoKycReviews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("kyc");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [dashboardRes, kycRes] = await Promise.all([
        axios.get("/api/admin/dashboard"),
        axios.get("/api/admin/vendors/video-kyc/pending"),
      ]);

      setStats(dashboardRes.data.stats);
      setVendorReviews(dashboardRes.data.pendingVendors);
      setVehicleReviews(dashboardRes.data.pendingVehicles);
      setVideoKycReviews(kycRes.data || []);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !stats) {
    return (
      <div className="min-h-screen grid place-items-center text-slate-400">
        Loading admin dashboard...
      </div>
    );
  }

  return (
    <div className="w-full">

      {/* HEADER */}
      <header className="sticky top-0 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 z-40">
        <div className="max-w-7xl mx-auto h-20 px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/20 flex items-center justify-center text-lg font-bold text-white">
              A
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-sky-300/80">Premium Admin Suite</p>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">RYDEX Admin Dashboard</h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-xs text-sky-200 font-semibold flex items-center gap-2">
              <ShieldCheck size={14} /> Secure Mode
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80">
              Premium access enabled
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-[0_40px_120px_rgba(15,23,42,0.45)]"
        >
          <div className="grid gap-8 lg:grid-cols-[1.8fr_1.2fr] items-center">
            <div>
              <span className="inline-flex items-center rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-sky-200">
                Premium
              </span>
              <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-white">
                Elevated admin control with premium intelligence.
              </h2>
              <p className="mt-4 max-w-2xl text-sm text-slate-300 leading-7">
                Manage vendors, earnings, and compliance from a single premium console. Built for fast decisions, real-time operations, and high-confidence administrative workflows.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "Live KYC queue monitoring",
                  "Revenue pulse & growth insights",
                  "Fast vendor approvals",
                  "Service health alerts",
                ].map((item) => (
                  <div key={item} className="rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <motion.div
                whileHover={{ y: -6 }}
                className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-sky-950/80 p-6 shadow-[0_20px_60px_rgba(14,165,233,0.12)]"
              >
                <p className="text-xs uppercase tracking-[0.35em] text-sky-300/80 mb-4">Premium pulse</p>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-4xl font-extrabold text-white">98.7%</p>
                    <p className="text-sm text-slate-400 mt-2">Approval accuracy</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/70 px-3 py-2 text-xs font-semibold text-sky-200">
                    +22% growth
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -6 }}
                className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_60px_rgba(99,102,241,0.12)]"
              >
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400 mb-4">Action center</p>
                <div className="space-y-3 text-sm text-slate-200">
                  <p>• Review top vendor requests</p>
                  <p>• Approve pending vehicles</p>
                  <p>• Start video KYC instantly</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_0.9fr]">
          {/* KPI SECTION */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Kpi
              label="Total Vendors" value={stats.totalVendors}
              icon={<Users size={18} />} variant="totalVendors"
              trend="+12%" trendDir="up" sub="vs last month"
            />
            <Kpi
              label="Approved" value={stats.approved}
              icon={<CheckCircle2 size={18} />} variant="approved"
              trend="+8%" trendDir="up" sub="verified vendors"
            />
            <Kpi
              label="Pending" value={stats.pending}
              icon={<Clock size={18} />} variant="pending"
              trend="0%" trendDir="flat" sub="awaiting review"
            />
            <Kpi
              label="Rejected" value={stats.rejected}
              icon={<XCircle size={18} />} variant="rejected"
              trend="-3%" trendDir="down" sub="declined"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_40px_100px_rgba(15,23,42,0.35)]"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Premium overview</p>
                <h3 className="text-xl font-bold text-white">Traffic & vendor health</h3>
              </div>
              <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs uppercase tracking-[0.35em] text-sky-300">
                Live
              </span>
            </div>
            <StatusAreaChart stats={stats} />
          </motion.div>
        </section>

        <AdminEarningsChart />

        <section className="grid gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-sky-300/80">Premium controls</p>
              <h2 className="text-2xl font-bold text-white">Operational workflows</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Vendor directory", url: "/admin/vendors" },
                { label: "Vehicle approvals", url: "/admin/vehicles" },
                { label: "KYC queue", url: "/admin/dashboard" },
              ].map((item) => (
                <motion.button
                  key={item.label}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push(item.url)}
                  className="rounded-2xl border border-white/10 bg-slate-950/80 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <FeatureCard
              title="Premium feed"
              description="Monitor the highest-impact vendor applications and earnings signals." 
              icon={<Users size={18} />}
            />
            <FeatureCard
              title="Security alert"
              description="Get instant visibility into suspicious vendor or booking activity." 
              icon={<ShieldCheck size={18} />}
            />
            <FeatureCard
              title="Priority actions"
              description="One-click access to the most important approval and review workflows." 
              icon={<ArrowRight size={18} />}
            />
          </div>
        </section>

        <div className="bg-white/5 rounded-[2rem] border border-white/10 p-6 shadow-[0_40px_100px_rgba(15,23,42,0.25)]">
          <div className="grid gap-6 xl:grid-cols-3">
            <ActionStat title="Premium vendor growth" value="+24%" note="Last 30 days" />
            <ActionStat title="Fast approvals" value="72m" note="Average review time" />
            <ActionStat title="KYC success" value="93%" note="Validated in 24h" />
          </div>
        </div>

        <div className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.22)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Dashboard spotlight</p>
              <h3 className="text-xl font-bold text-white">Next level premium feature set</h3>
            </div>
            <span className="rounded-full bg-slate-900/70 px-3 py-1 text-xs uppercase tracking-[0.35em] text-slate-300">
              Enhanced
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
              <p className="text-sm text-slate-300">Advanced audit logs</p>
              <p className="mt-3 text-lg font-semibold text-white">Track every admin action in real time.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
              <p className="text-sm text-slate-300">Vendor health score</p>
              <p className="mt-3 text-lg font-semibold text-white">See which partners are most active and reliable.</p>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function TabButton({ active, onClick, children, icon, count }: any) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={`relative flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 select-none
        ${active
          ? "bg-neutral-950 text-white shadow-lg shadow-black/20"
          : "text-gray-500 hover:bg-gray-100 hover:text-slate-200"
        }`}
    >
      <span className={`flex items-center ${active ? "text-white" : "text-slate-400"}`}>
        {icon}
      </span>

      <span className="hidden sm:inline">{children}</span>

      <span className={`min-w-[22px] h-5 px-1.5 text-[11px] font-bold rounded-full flex items-center justify-center transition-all
        ${active
          ? "bg-slate-200 text-slate-900"
          : count > 0
          ? "bg-rose-500/100 text-white"
          : "bg-gray-200 text-slate-400"
        }`}
      >
        {count}
      </span>
    </motion.button>
  );
}

const KYC_STATUS: Record<string, { label: string; pill: string; dot: string }> = {
  pending:     { label: "Pending",     pill: "bg-amber-500/10 text-amber-400 border border-amber-200",   dot: "bg-amber-500/100" },
  in_progress: { label: "In Progress", pill: "bg-sky-500/10  text-sky-400  border border-blue-200",    dot: "bg-sky-500/100" },
  completed:   { label: "Completed",   pill: "bg-emerald-500/10 text-green-800 border border-green-200",   dot: "bg-emerald-500/100" },
};

const AVATAR_COLORS = [
  "bg-purple-500/100/20 text-purple-400",
  "bg-teal-500/20 text-teal-400",
  "bg-sky-500/20 text-sky-400",
  "bg-pink-500/20 text-pink-400",
];

function ContentList({ data, type }: any) {
  const router = useRouter();

  const startKyc = async (vendorId: string) => {
    try {
      const res = await axios.patch(`/api/admin/vendors/video-kyc/start/${vendorId}`);
      if (res.data.roomId) router.push(`/video-kyc/${res.data.roomId}`);
    } catch (err) {
      console.error("Start KYC error:", err);
    }
  };

  if (data.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="bg-slate-900/40 rounded-2xl py-16 text-center border border-dashed border-white/10 shadow-sm"
      >
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={22} className="text-emerald-400" />
        </div>
        <p className="font-bold text-slate-200 text-base">All caught up!</p>
        <p className="text-sm text-slate-400 mt-1">No pending items right now.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1 mb-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          {type === "kyc" ? "Video KYC Queue" : type === "vendor" ? "Vendor Review Queue" : "Vehicle Review Queue"}
        </p>
        <p className="text-xs text-slate-400">{data.length} item{data.length > 1 ? "s" : ""}</p>
      </div>

      {data.map((item: any, i: number) => {
        const name     = item.name || item.ownerName || "—";
        const email    = item.email || item.ownerEmail || "—";
        const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
        const avColor  = AVATAR_COLORS[i % AVATAR_COLORS.length];
        const s        = KYC_STATUS[item.videoKycStatus] ?? KYC_STATUS.pending;

        return (
          <motion.div key={item._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -3, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
            className="bg-slate-900/40 border border-white/10 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 shadow-sm transition-shadow"
          >
            {/* Avatar + Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${avColor}`}>
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-slate-200 truncate">{name}</p>
                <p className="text-xs text-slate-400 truncate">{email}</p>
                {type === "kyc" && (
                  <span className={`mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${s.pill}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="shrink-0">
              {type === "kyc" ? (
                item.videoKycStatus === "in_progress" ? (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                    onClick={() => router.push(`/video-kyc/${item.videoKycRoomId}`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                  >
                    <Video size={13} /> Join Call
                  </motion.button>
                ) : (
                  <motion.button whileTap={{ scale: 0.96 }}
                    onClick={() => startKyc(item._id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-sm font-semibold transition-colors"
                  >
                    <Video size={13} /> Start KYC
                  </motion.button>
                )
              ) : (
                <motion.button whileTap={{ scale: 0.96 }}
                  onClick={() => router.push(type === "vendor" ? `/admin/vendors/${item._id}` : `/admin/vehicles/${item._id}`)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-sm font-semibold transition-colors"
                >
                  Review <ArrowRight size={13} />
                </motion.button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

const KPI_CONFIG: Record<string, {
  iconBg: string; iconColor: string; trendBg: string; trendText: string; cardHover: string;
}> = {
  totalVendors: {
    iconBg: "bg-purple-500/10", iconColor: "text-purple-400",
    trendBg: "bg-purple-500/10", trendText: "text-purple-300",
    cardHover: "hover:shadow-purple-100/60",
  },
  approved: {
    iconBg: "bg-sky-500/10", iconColor: "text-sky-400",
    trendBg: "bg-emerald-500/10", trendText: "text-green-800",
    cardHover: "hover:shadow-blue-100/60",
  },
  pending: {
    iconBg: "bg-amber-500/10", iconColor: "text-amber-400",
    trendBg: "bg-gray-100", trendText: "text-gray-600",
    cardHover: "hover:shadow-amber-100/60",
  },
  rejected: {
    iconBg: "bg-rose-500/10", iconColor: "text-rose-400",
    trendBg: "bg-rose-500/10", trendText: "text-rose-400",
    cardHover: "hover:shadow-red-100/60",
  },
};

function Kpi({
  label,
  value,
  icon,
  trend,
  trendDir = "up",
  sub,
  variant = "totalVendors",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  trend?: string;
  trendDir?: "up" | "down" | "flat";
  sub?: string;
  variant?: keyof typeof KPI_CONFIG;
}) {
  const cfg = KPI_CONFIG[variant];

  const trendIcon =
    trendDir === "up"   ? <TrendingUp size={11} />   :
    trendDir === "down" ? <TrendingDown size={11} />  :
    <Minus size={11} />;

  const trendColor =
    trendDir === "up"   ? "bg-emerald-500/10 text-green-800" :
    trendDir === "down" ? "bg-rose-500/10 text-rose-400"     :
    "bg-slate-800/50 text-slate-400";

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 20px 48px rgba(0,0,0,0.10)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`bg-slate-900/40 rounded-2xl p-5 border border-white/10 shadow-sm
        cursor-default relative overflow-hidden group ${cfg.cardHover}`}
    >
      {/* subtle tinted bg on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
        rounded-2xl ${cfg.iconBg}`} style={{ zIndex: 0 }} />

      <div className="relative z-10">
        {/* Top row: icon + trend badge */}
        <div className="flex items-start justify-between mb-4">
          <motion.div
            whileHover={{ rotate: -6, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400 }}
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${cfg.iconBg} ${cfg.iconColor}`}
          >
            {icon}
          </motion.div>

          {trend && (
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold
              px-2 py-1 rounded-full ${trendColor}`}>
              {trendIcon}
              {trend}
            </span>
          )}
        </div>

        {/* Label */}
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
          {label}
        </p>

        {/* Value — count-up animation */}
        <motion.p
          className="text-3xl font-extrabold text-white leading-tight"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {value}
        </motion.p>

        {/* Footer */}
        {sub && (
          <div className="flex items-center justify-between mt-3 pt-3
            border-t border-white/10">
            <p className="text-[11px] text-slate-400">{sub}</p>
            <Clock size={11} className="text-gray-300" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.25)]"
    >
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950/80 text-sky-300">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
    </motion.div>
  );
}

function ActionStat({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
      <p className="text-sm uppercase tracking-[0.35em] text-slate-500">{title}</p>
      <p className="mt-4 text-3xl font-bold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{note}</p>
    </div>
  );
}
