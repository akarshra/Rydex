import AdminSidebar from "@/components/AdminSidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Console | Rydex",
  description: "Rydex Premium Admin Dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <AdminSidebar />
      <div className="flex-1 h-screen overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
