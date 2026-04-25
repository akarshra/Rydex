"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CarFront, ChevronRight, IndianRupee, Loader2 } from "lucide-react";
import axios from "axios";

export default function AdminVehiclesIndexPage() {
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/admin/dashboard");
        setVehicles(res.data?.pendingVehicles || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] grid place-items-center text-[var(--muted)]">
        <div className="flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" />
          Loading vehicles…
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)] font-semibold mb-1">
            Reviews
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text)] flex items-center gap-2">
            <CarFront size={22} />
            Vehicles
          </h1>
          <p className="text-sm text-[var(--muted)] mt-2">
            Pending vehicle pricing/image approvals.
          </p>
        </div>
      </div>

      {vehicles.length === 0 ? (
        <div className="premium-panel rounded-3xl p-8 text-[var(--muted)]">
          No pending vehicles right now.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {vehicles.map((v) => (
            <Link key={v._id} href={`/admin/vehicles/${v._id}`}>
              <motion.div
                whileHover={{ y: -2 }}
                className="premium-panel rounded-3xl p-6 border border-[var(--border)] transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--muted-2)] font-semibold">
                      {v.ownerName} • {v.ownerEmail}
                    </p>
                    <p className="text-lg font-bold text-[var(--text)] truncate mt-1">
                      {String(v.vehicleType || "Vehicle")}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-sm text-[var(--muted)]">
                      <span className="inline-flex items-center gap-1">
                        <IndianRupee size={14} />
                        Base: ₹{v.baseFare}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <IndianRupee size={14} />
                        /km: ₹{v.pricePerKm}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="text-[var(--muted)] flex-shrink-0" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

