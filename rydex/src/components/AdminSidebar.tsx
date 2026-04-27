"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Users,
  IndianRupee,
  ShieldCheck,
  CarFront,
  UsersRound,
  LogOut,
  Ticket,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { setUserData } from "@/redux/userSlice";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
  { label: "Live Operations", href: "/admin/operations", icon: <Map size={20} /> },
  { label: "Customers", href: "/admin/customers", icon: <Users size={20} /> },
  { label: "Finance", href: "/admin/finance", icon: <IndianRupee size={20} /> },
  { label: "Compliance", href: "/admin/compliance", icon: <ShieldCheck size={20} /> },
  { label: "Vehicles", href: "/admin/vehicles", icon: <CarFront size={20} /> },
  { label: "Vendors", href: "/admin/vendors", icon: <UsersRound size={20} /> },
  { label: "Promos", href: "/admin/promos", icon: <Ticket size={20} /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();

  return (
    <aside className="w-64 flex-shrink-0 min-h-screen bg-slate-950/90 backdrop-blur-2xl border-r border-white/10 sticky top-0 flex flex-col z-50">
      <div className="h-20 flex items-center px-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/20 flex items-center justify-center text-sm font-bold text-white">
            A
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">RYDEX</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 flex flex-col gap-2">
        <p className="px-2 text-xs uppercase tracking-[0.35em] text-slate-500 mb-2 font-semibold">
          Premium Console
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-sky-500/20 to-indigo-500/5 text-sky-300 border border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.1)]"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <div className={`${isActive ? "text-sky-400" : "text-slate-500"}`}>
                  {item.icon}
                </div>
                <span className="font-semibold text-sm">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <motion.button
          whileHover={{ x: 4 }}
          onClick={async () => {
            dispatch(setUserData(null));
            await signOut({ callbackUrl: "/" });
          }}
          className="flex items-center gap-3 px-3 py-3 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-semibold text-sm">Sign Out</span>
        </motion.button>
      </div>
    </aside>
  );
}
