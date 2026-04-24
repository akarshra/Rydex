"use client";

import { motion } from "framer-motion";
import { Users, Search, MoreHorizontal, ShieldAlert, Star, MessageSquare } from "lucide-react";

const MOCK_CUSTOMERS = [
  { id: "CUS-001", name: "Sarah Connor", email: "sarah@example.com", rides: 42, spent: "$1,240", rating: 4.9, status: "active" },
  { id: "CUS-002", name: "John Smith", email: "john@example.com", rides: 12, spent: "$320", rating: 4.2, status: "active" },
  { id: "CUS-003", name: "Mike Ross", email: "mike@example.com", rides: 89, spent: "$3,100", rating: 5.0, status: "premium" },
  { id: "CUS-004", name: "Emma Watson", email: "emma@example.com", rides: 3, spent: "$45", rating: 3.1, status: "flagged" },
];

export default function AdminCustomers() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-indigo-400 font-semibold mb-1">
            Rider Directory
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Customer Management</h1>
          <p className="text-slate-400 mt-1 text-sm">Manage users, view ride history, and handle support tickets.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email or ID..." 
            className="bg-slate-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white w-full sm:w-64 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main Table */}
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/40 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-slate-950/50">
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Rider</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Total Rides</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Spent</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Rating</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_CUSTOMERS.map((customer, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={customer.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{customer.name}</p>
                          <p className="text-xs text-slate-500">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-300">{customer.rides}</td>
                    <td className="p-4 text-sm font-medium text-slate-300">{customer.spent}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star size={14} className="fill-amber-400" />
                        <span className="text-sm font-semibold text-white">{customer.rating}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        customer.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        customer.status === 'premium' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Support Sidebar */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MessageSquare size={18} className="text-sky-400" />
            Active Tickets
          </h2>
          
          {[
            { id: "TK-102", issue: "Refund requested for cancelled trip", user: "Emma Watson", time: "1h ago" },
            { id: "TK-101", issue: "Driver was late", user: "John Smith", time: "3h ago" },
          ].map((ticket, i) => (
            <motion.div 
              key={ticket.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-sky-500/30 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-sky-400">{ticket.id}</span>
                <span className="text-[10px] text-slate-500 uppercase">{ticket.time}</span>
              </div>
              <p className="text-sm font-medium text-slate-200 line-clamp-2 mb-2">{ticket.issue}</p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Users size={12} />
                <span>{ticket.user}</span>
              </div>
            </motion.div>
          ))}

          <button className="w-full py-3 rounded-xl border border-dashed border-white/20 text-sm font-semibold text-slate-400 hover:text-white hover:border-white/40 transition-colors">
            View All Tickets
          </button>
        </div>
      </div>
    </div>
  );
}
