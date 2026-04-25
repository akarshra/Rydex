"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bike, Car, ChevronRight, LogOut, Menu, Truck, X, Star, Bell } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "next-auth/react";
import axios from "axios";
import { getSocket } from "@/lib/socket";

import AuthModal from "./AuthModal";
import ThemeToggle from "./ThemeToggle";
import { AppDispatch, RootState } from "@/redux/store";
import { setUserData } from "@/redux/userSlice";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Bookings", href: "/bookings" },
  { label: "Fleet", href: "/fleet" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);

  /* Notifications */
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const notifRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { userData } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (userData?.role !== "vendor") return;

    const fetchCounts = async () => {
      try {
        const res = await axios.get("/api/partner/bookings/counts");
        setPendingCount(res.data?.pending || 0);
        setActiveCount(res.data?.active || 0);
      } catch {
        setPendingCount(0);
        setActiveCount(0);
      }
    };

    fetchCounts();
  }, [userData]);

  /* Fetch & Listen to Notifications */
  useEffect(() => {
    if (!userData) return;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get("/api/notifications/get");
        setNotifications(res.data.notifications || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchNotifications();

    const socket = getSocket();
    socket.on("notification", (newNotif: any) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });

    return () => {
      socket.off("notification");
    };
  }, [userData]);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    // Let NextAuth clear cookies and redirect
    dispatch(setUserData(null));
    setProfileOpen(false);
    await signOut({ callbackUrl: "/" });
    router.refresh();
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await axios.patch("/api/notifications/mark-read", { notificationId: id });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.patch("/api/notifications/mark-read", { all: true });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const desktopNavItems = () => {
    if (userData?.role === "vendor") {
      return (
        <>
          <Link
            href="/partner/active-ride"
            className="relative text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            Active Ride
            {activeCount > 0 && (
              <span className="absolute -top-2 -right-5 w-6 h-6 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {activeCount}
              </span>
            )}
          </Link>

          <Link
            href="/partner/pending-requests"
            className="relative text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            Pending Requests
            {pendingCount > 0 && (
              <span className="absolute -top-2 -right-5 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {pendingCount}
              </span>
            )}
          </Link>

          <Link
            href="/partner/bookings"
            className="relative text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            My Bookings
          </Link>
        </>
      );
    }

    return NAV_ITEMS.map((item) => {
      const active = pathname === item.href;
      return (
        <Link
          key={item.label}
          href={item.href}
          className={[
            "text-sm font-medium transition",
            active ? "text-slate-900" : "text-slate-600 hover:text-slate-900",
          ].join(" ")}
        >
          {item.label}
        </Link>
      );
    });
  };

  const mobileNavItems = () => {
    if (userData?.role === "vendor") {
      return (
        <>
          <Link
            href="/partner/active-ride"
            className="flex justify-between items-center px-6 py-4 text-gray-700 hover:bg-gray-50"
            onClick={() => setMenuOpen(false)}
          >
            <span>Active Ride</span>
            {activeCount > 0 && (
              <span className="w-6 h-6 bg-green-500 text-xs rounded-full flex items-center justify-center font-bold text-white">
                {activeCount}
              </span>
            )}
          </Link>
          <Link
            href="/partner/pending-requests"
            className="flex justify-between items-center px-6 py-4 text-gray-700 hover:bg-gray-50"
            onClick={() => setMenuOpen(false)}
          >
            <span>Pending Requests</span>
            {pendingCount > 0 && (
              <span className="w-6 h-6 bg-red-500 text-xs rounded-full flex items-center justify-center font-bold text-white">
                {pendingCount}
              </span>
            )}
          </Link>
          <Link
            href="/partner/bookings"
            className="flex justify-between items-center px-6 py-4 text-gray-700 hover:bg-gray-50"
            onClick={() => setMenuOpen(false)}
          >
            <span>My Bookings</span>
          </Link>
        </>
      );
    }

    return NAV_ITEMS.map((item) => (
      <Link
        key={item.label}
        href={item.href}
        className="px-6 py-4 text-gray-700 hover:bg-gray-50"
        onClick={() => setMenuOpen(false)}
      >
        {item.label}
      </Link>
    ));
  };

  return (
    <>
      <header
        className={[
          "sticky top-0 z-50 w-full border-b transition",
          scrolled ? "bg-[var(--surface)] backdrop-blur" : "bg-[var(--surface-2)]",
        ].join(" ")}
      >
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Rydex" width={36} height={36} />
            <span className="font-semibold tracking-tight text-[var(--text)]">Rydex</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">{desktopNavItems()}</nav>

          <div className="flex items-center gap-2">
            {userData && (
              <div className="hidden md:block relative" ref={notifRef}>
                <button
                  onClick={() => setNotificationsOpen((v) => !v)}
                  className="p-2 rounded-xl transition hover:bg-[var(--surface-2)] text-[var(--text)] relative"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
                  )}
                </button>

                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                      className="absolute right-0 mt-2 w-80 rounded-2xl border overflow-hidden shadow-xl bg-[var(--surface-2)] border-[var(--border)] z-50 flex flex-col max-h-[400px]"
                    >
                      <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface)]">
                        <h3 className="font-bold text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllAsRead} className="text-xs text-blue-500 hover:text-blue-600 font-medium">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="flex-1 overflow-y-auto p-2">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-sm text-gray-400">No new notifications</div>
                        ) : (
                          notifications.map((n) => (
                            <div key={n._id} onClick={() => !n.isRead && handleMarkAsRead(n._id)} className={`p-3 rounded-xl mb-1 cursor-pointer transition-colors ${n.isRead ? "opacity-60" : "bg-blue-50/10 hover:bg-blue-50/20"}`}>
                              <p className="text-sm font-semibold">{n.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            {!userData ? (
              <button
                onClick={() => setAuthOpen(true)}
                className="hidden md:inline-flex px-4 py-2 rounded-xl text-white text-sm font-semibold transition shadow-[0_18px_45px_rgba(0,0,0,0.18)] bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] hover:opacity-95"
              >
                Sign in
              </button>
            ) : (
              <div className="hidden md:block relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="px-3 py-2 rounded-xl border text-sm font-medium transition bg-[var(--surface)] hover:bg-[var(--surface-2)] border-[var(--border)] text-[var(--text)]"
                >
                  {userData?.name || "Profile"}
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="absolute right-0 mt-2 w-72 rounded-2xl border overflow-hidden shadow-xl bg-[var(--surface-2)] border-[var(--border)]"
                    >
                      <ProfileContent
                        userData={userData}
                        handleLogout={handleLogout}
                        router={router}
                        mobile={false}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg border hover:bg-slate-50"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed top-[64px] inset-x-0 bg-white z-50 border-b md:hidden"
            >
              <div className="flex flex-col">{mobileNavItems()}</div>
              <div className="p-4 border-t">
                <div className="mb-3">
                  <ThemeToggle className="w-full" />
                </div>
                {!userData ? (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setAuthOpen(true);
                    }}
                    className="w-full px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
                  >
                    Sign in
                  </button>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-slate-50"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {profileOpen && userData && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setProfileOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            <motion.div
              initial={{ y: 400 }}
              animate={{ y: 0 }}
              exit={{ y: 400 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-50 md:hidden"
            >
              <ProfileContent userData={userData} handleLogout={handleLogout} router={router} mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

function ProfileContent({ userData, handleLogout, router, mobile }: any) {
  return (
    <div className={`${mobile ? "p-6 pb-10" : "p-5"}`}>
      <p className="font-semibold text-lg">{userData.name}</p>
      <p className="text-xs uppercase text-gray-500 mb-2">{userData.role}</p>
      
      {userData.averageRating !== undefined && userData.averageRating > 0 && (
        <div className="flex items-center gap-1 mb-4 text-amber-500">
          <Star size={14} className="fill-amber-500" />
          <span className="text-sm font-bold text-gray-900">{userData.averageRating}</span>
          <span className="text-xs text-gray-500">({userData.totalReviews || 0} reviews)</span>
        </div>
      )}

      {userData.role !== "vendor" && (
        <>
          <button
            onClick={() => router.push("/profile")}
            className="w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl"
          >
            <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
              <Star size={12} />
            </div>
            My Profile
            <ChevronRight size={16} className="ml-auto" />
          </button>
          
          <button
            onClick={() => router.push("/partner/onboard/vehicle")}
            className="w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl"
          >
            <VehicleStack />
            Become a Partner
            <ChevronRight size={16} className="ml-auto" />
          </button>
        </>
      )}

      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl mt-2"
      >
        <LogOut size={16} />
        Logout
      </button>
    </div>
  );
}

function VehicleStack() {
  return (
    <div className="flex -space-x-2">
      <Icon><Bike size={14} /></Icon>
      <Icon><Car size={14} /></Icon>
      <Icon><Truck size={14} /></Icon>
    </div>
  );
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
      {children}
    </div>
  );
}
