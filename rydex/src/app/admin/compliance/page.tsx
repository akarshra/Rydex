"use client";

import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";

export default function AdminCompliance() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-red-400 font-semibold mb-1">
            Trust & Safety
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Compliance & Audit</h1>
          <p className="text-slate-400 mt-1 text-sm">Monitor document expirations, vendor ratings, and system audit logs.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_1fr] gap-6">
        
        {/* Alerts Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-[2rem] border border-red-500/20 bg-slate-900/40 p-6 md:p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6 relative z-10 text-white">
            <AlertTriangle size={20} className="text-red-400" />
            Action Required
          </h2>

          <div className="space-y-4 relative z-10">
            {[
              { title: "Insurance Expiring", entity: "Vehicle DL-1CA-4321", time: "Expires in 3 days", urgent: true },
              { title: "Low Rating Alert", entity: "Vendor John D. (3.2⭐)", time: "Below threshold", urgent: true },
              { title: "PUC Expiring", entity: "Vehicle MH-02-AB-1234", time: "Expires in 12 days", urgent: false },
            ].map((alert, i) => (
              <div key={i} className={`p-4 rounded-xl border ${alert.urgent ? 'bg-red-500/10 border-red-500/20' : 'bg-slate-950/50 border-white/5'} flex justify-between items-center`}>
                <div>
                  <h3 className="text-sm font-bold text-white">{alert.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{alert.entity}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md ${alert.urgent ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-slate-300'}`}>
                    {alert.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Audit Log */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-[2rem] border border-white/10 bg-slate-900/40 p-6 md:p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2 text-white">
              <FileText size={20} className="text-indigo-400" />
              System Audit Log
            </h2>
            <button className="text-xs text-sky-400 hover:text-sky-300 font-semibold transition-colors">
              Export CSV
            </button>
          </div>

          <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
            {[
              { action: "Vendor Approved", user: "Admin (Akarsh)", detail: "Approved KYC for Vendor ID: V-1290", time: "10 min ago" },
              { action: "Surge Adjusted", user: "System Auto", detail: "Downtown surge set to 1.8x", time: "1 hr ago" },
              { action: "Manual Refund", user: "Admin (Akarsh)", detail: "Refunded $12 to CUS-001", time: "2 hrs ago" },
              { action: "Vehicle Rejected", user: "Admin (Akarsh)", detail: "Rejected DL-4C-990 (Poor doc clarity)", time: "5 hrs ago" },
            ].map((log, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-slate-950 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <CheckCircle2 size={16} />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/5 bg-slate-950/50 shadow">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-200 text-sm">{log.action}</h3>
                    <time className="text-[10px] text-slate-500 font-mono">{log.time}</time>
                  </div>
                  <div className="text-xs text-slate-400 mb-2">{log.detail}</div>
                  <div className="text-[10px] text-sky-400/80 font-medium">By {log.user}</div>
                </div>
              </div>
            ))}
          </div>

        </motion.div>

      </div>
    </div>
  );
}
