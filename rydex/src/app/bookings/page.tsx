"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IndianRupee,
  Loader2,
  Car,
  Calendar,
  ChevronRight,
  MapPin,
  Phone,
  Navigation
} from "lucide-react";
import axios from "axios";

interface Booking {
  _id: string;
  pickupAddress: string;
  dropAddress: string;
  fare: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  createdAt: string;
  userMobileNumber?: string;
  driverMobileNumber?: string;
  vehicle?: {
    vehicleModel: string;
    imageUrl?: string;
  };
  driver?: {
    name: string;
  };
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get("/api/user/bookings");
        setBookings(res.data.bookings || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      started: "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]",
      completed: "bg-teal-500/10 text-teal-400 border-teal-500/20",
      requested: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      awaiting_payment: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      rejected: "bg-red-500/10 text-red-500 border-red-500/20",
      expired: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    };
    return colors[status] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).replace(",", "");
  };

  const filteredBookings = statusFilter === "All"
    ? bookings
    : bookings.filter(b => b.status === statusFilter.toLowerCase());

  return (
    <div className="min-h-screen w-full bg-[#06080F] text-white pt-24 pb-16">
      
      {/* HEADER */}
      <div className="border-b border-white/10 bg-[#06080F]/80 backdrop-blur-md sticky top-[72px] z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto py-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">My Bookings</h1>
              <p className="text-slate-400 text-sm mt-1">
                {bookings.length} {bookings.length === 1 ? "ride" : "rides"} found
              </p>
            </div>
            
            {/* COMPACT FILTER */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 appearance-none cursor-pointer hover:bg-white/10 transition-colors"
            >
              <option className="bg-[#0f172a] text-white">All</option>
              <option className="bg-[#0f172a] text-white">Started</option>
              <option className="bg-[#0f172a] text-white">Confirmed</option>
              <option className="bg-[#0f172a] text-white">Completed</option>
              <option className="bg-[#0f172a] text-white">Requested</option>
              <option className="bg-[#0f172a] text-white">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="max-w-3xl mx-auto">
          
          {/* LOADING STATE */}
          {loading && (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && filteredBookings.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="premium-glass rounded-3xl p-12 text-center"
            >
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-blue-500/20">
                <Car className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white">No bookings found</h3>
              <p className="text-slate-400 text-sm mt-2">Ready for a premium ride? Book one now!</p>
              <button 
                onClick={() => window.location.href = '/book'}
                className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-500 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              >
                Book a Ride
              </button>
            </motion.div>
          )}

          {/* BOOKINGS LIST */}
          {!loading && filteredBookings.length > 0 && (
            <div className="space-y-6">
              <AnimatePresence>
                {filteredBookings.map((booking, index) => (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="premium-panel rounded-3xl border border-white/5 overflow-hidden group hover:border-white/10 transition-colors">
                      
                      {/* VEHICLE INFO */}
                      <div className="flex items-center gap-4 p-5 border-b border-white/5 bg-white/5">
                        {/* VEHICLE IMAGE */}
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/10 p-1">
                          {booking.vehicle?.imageUrl ? (
                            <img 
                              src={booking.vehicle.imageUrl} 
                              alt={booking.vehicle.vehicleModel}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white/5 rounded-xl">
                              <Car className="w-8 h-8 text-slate-500" />
                            </div>
                          )}
                        </div>
                        
                        {/* VEHICLE DETAILS */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg text-white">
                              {booking.vehicle?.vehicleModel || "Standard Vehicle"}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.status)} uppercase tracking-wider`}>
                              {booking.status.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 mt-1">
                            {booking.driver?.name ? `Driver: ${booking.driver.name}` : "Driver assigning..."}
                          </p>
                        </div>
                      </div>

                      {/* ADDRESS SECTION */}
                      <div className="p-6 space-y-4">
                        {/* PICKUP */}
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1 w-8 h-8 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center relative z-10">
                            <MapPin className="w-4 h-4 text-green-400" />
                          </div>
                          <div className="flex-1 relative">
                            {/* Connector Line */}
                            <div className="absolute left-[-21px] top-6 bottom-[-30px] w-px bg-white/10" />
                            <span className="text-[10px] font-bold text-green-400 uppercase tracking-[0.2em] block mb-1">Pick Up Point</span>
                            <p className="text-sm text-slate-300 leading-relaxed">
                              {booking.pickupAddress}
                            </p>
                          </div>
                        </div>

                        {/* DROP */}
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1 w-8 h-8 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center relative z-10">
                            <MapPin className="w-4 h-4 text-rose-400" />
                          </div>
                          <div className="flex-1">
                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-[0.2em] block mb-1">Drop Off Point</span>
                            <p className="text-sm text-slate-300 leading-relaxed">
                              {booking.dropAddress}
                            </p>
                          </div>
                        </div>

                        {/* CONTACT NUMBERS SECTION */}
                        {(booking.userMobileNumber || booking.driverMobileNumber) && (
                          <div className="pt-4 mt-2 border-t border-white/5 grid grid-cols-2 gap-4">
                            {booking.userMobileNumber && (
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center border border-white/10">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Your Number</span>
                                  <p className="text-xs text-slate-300">{booking.userMobileNumber}</p>
                                </div>
                              </div>
                            )}
                            {booking.driverMobileNumber && (
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                                  <Phone className="w-3 h-3 text-blue-400" />
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold text-blue-400 block uppercase tracking-wider">Driver Contact</span>
                                  <p className="text-xs text-slate-200">{booking.driverMobileNumber}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* DATE, FARE & ACTION BAR */}
                      <div className="flex items-center py-4 px-6 bg-white/5 border-t border-white/5">
                        <div className="flex flex-col flex-1">
                          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(booking.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1 font-bold text-lg text-white">
                            <IndianRupee className="w-4 h-4" />
                            <span>{booking.fare}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col flex-1 items-center">
                          <span className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Payment</span>
                          <span className={`text-[10px] px-2.5 py-0.5 font-bold uppercase rounded-full ${
                            booking.paymentStatus === 'paid' 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {booking.paymentStatus || 'pending'}
                          </span>
                        </div>

                        <div className="flex items-center justify-end flex-1 gap-2">
                          {booking.status === "started" && (
                            <button
                              onClick={() => window.location.href = `/ride/${booking._id}/track`}
                              className="group flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)] transition hover:bg-blue-500"
                              title="Live Tracking"
                            >
                              <Navigation className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                            </button>
                          )}
                          <button
                            onClick={() => window.location.href = `/ride/${booking._id}`}
                            className="flex items-center h-10 gap-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-5 rounded-full transition-colors border border-white/5"
                          >
                            <span>Details</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}