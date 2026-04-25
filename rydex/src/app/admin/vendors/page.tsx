"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Loader2, UsersRound } from "lucide-react";
import axios from "axios";

export default function AdminVendorsIndexPage() {
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/admin/dashboard");
        setVendors(res.data?.pendingVendors || []);
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
          Loading vendors…
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
            <UsersRound size={22} />
            Vendors
          </h1>
          <p className="text-sm text-[var(--muted)] mt-2">
            Pending vendor onboarding verifications.
          </p>
        </div>
      </div>

      {vendors.length === 0 ? (
        <div className="premium-panel rounded-3xl p-8 text-[var(--muted)]">
          No pending vendors right now.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {vendors.map((v) => (
            <Link key={v._id} href={`/admin/vendors/${v._id}`}>
              <motion.div
                whileHover={{ y: -2 }}
                className="premium-panel rounded-3xl p-6 border border-[var(--border)] transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--muted-2)] font-semibold">
                      {v.email}
                    </p>
                    <p className="text-lg font-bold text-[var(--text)] truncate mt-1">
                      {v.name}
                    </p>
                    <p className="text-sm text-[var(--muted)] mt-2">
                      Vehicle type: {v.vehicleType || "—"}
                    </p>
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

