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
    <div className="flex min-h-screen bg-[#020617] text-white overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.14),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.16),_transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
      <AdminSidebar />
      <div className="flex-1 h-screen overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
