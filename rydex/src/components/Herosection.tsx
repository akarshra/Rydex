"use client";

import { RootState } from "@/redux/store";
import { motion, useScroll, useTransform } from "framer-motion";
import { Bike, Bus, Car, ShieldCheck, Sparkles, Truck, ArrowRight, MapPin, Navigation, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useRef, useState } from "react";

export default function HeroSection({
  onAuthRequired,
}: {
  onAuthRequired: () => void;
}) {
  const router = useRouter();
  const { userData } = useSelector((state: RootState) => state.user);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const handleBookNow = () => {
    if (!userData) {
      onAuthRequired();
      return;
    }
    router.push("/book");
  };

  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const handleAIBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) {
      onAuthRequired();
      return;
    }
    if (!aiQuery.trim() || aiLoading) return;
    setAiLoading(true);

    try {
      const res = await fetch("/api/ai/extract-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiQuery })
      });
      const data = await res.json();
      
      if (data && (data.pickup || data.dropoff || data.vehicleType)) {
        const params = new URLSearchParams();
        if (data.pickup) params.set("pickup", data.pickup);
        if (data.dropoff) params.set("dropoff", data.dropoff);
        if (data.vehicleType) params.set("vehicle", data.vehicleType);
        
        router.push(`/book?${params.toString()}`);
      } else {
        router.push("/book");
      }
    } catch (err) {
      console.error(err);
      router.push("/book");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <section ref={containerRef} className="relative isolate min-h-screen w-full overflow-hidden bg-[#020617] text-white flex flex-col justify-center">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-sky-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse duration-10000" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />

      {/* Floating Abstract Shapes */}
      <motion.div style={{ y: y1 }} className="absolute right-[10%] top-[20%] w-64 h-64 rounded-3xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-3xl rotate-12 -z-10" />
      <motion.div style={{ y: y2 }} className="absolute left-[5%] bottom-[20%] w-48 h-48 rounded-full border border-sky-500/10 bg-gradient-to-tr from-sky-500/10 to-transparent backdrop-blur-xl -rotate-12 -z-10" />

      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/80 to-[#020617] z-0" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-32 pb-20 lg:px-8 grid lg:grid-cols-[1fr_400px] gap-16 items-center">
        
        {/* Left Text Content */}
        <div className="flex flex-col items-start text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300 backdrop-blur-md"
          >
            <Sparkles size={14} className="text-sky-400" />
            Next-Gen Mobility
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="mt-8 text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.1]"
          >
            The ultimate <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400">
              booking engine.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 max-w-xl text-lg leading-8 text-slate-300"
          >
            From premium daily commutes to heavy logistics — connect instantly with top-tier verified partners on a secure, high-performance platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 w-full max-w-lg relative z-20"
          >
            <form onSubmit={handleAIBooking} className="relative flex items-center w-full">
              <div className="absolute left-4 text-sky-400">
                <Sparkles size={18} />
              </div>
              <input 
                type="text" 
                disabled={aiLoading}
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="AI: Try 'Book a bike from Airport to Downtown'" 
                className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-12 pr-16 text-sm text-white placeholder-slate-400 backdrop-blur-xl focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all disabled:opacity-50 shadow-2xl"
              />
              <button 
                disabled={aiLoading || !aiQuery.trim()}
                type="submit" 
                className="absolute right-2 bg-sky-500 text-white rounded-full p-2.5 hover:bg-sky-400 transition-colors disabled:opacity-50"
              >
                {aiLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <ArrowRight size={16} />}
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBookNow}
              className="group relative flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-bold text-slate-900 shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all hover:bg-slate-100 hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]"
            >
              Start Riding
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </motion.button>
            <Link
              href="/fleet"
              className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10"
            >
              Explore Fleet
              <Car size={16} className="text-slate-400 transition-colors group-hover:text-white" />
            </Link>
          </motion.div>
        </div>

        {/* Right Floating Booking Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
          className="relative perspective-[1000px] hidden lg:block"
        >
          <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-br from-sky-500/30 to-purple-500/30 blur-2xl opacity-50 animate-pulse" />
          
          <div className="relative rounded-[2rem] border border-white/10 bg-slate-900/60 p-8 backdrop-blur-2xl shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Navigation size={20} className="text-sky-400" /> Quick Search
            </h3>
            
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400" />
                <input 
                  type="text" 
                  placeholder="Enter pickup location" 
                  className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 transition-colors"
                />
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-sm bg-sky-400" />
                <input 
                  type="text" 
                  placeholder="Where to?" 
                  className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 transition-colors"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2 pt-2">
                {[
                  { icon: Car, label: "Car" },
                  { icon: Bike, label: "Bike" },
                  { icon: Truck, label: "Truck" },
                ].map((vehicle, i) => (
                  <button key={i} className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-sky-500/10 hover:border-sky-500/30 transition-all text-slate-400 hover:text-sky-300">
                    <vehicle.icon size={20} />
                    <span className="text-[10px] font-semibold uppercase">{vehicle.label}</span>
                  </button>
                ))}
              </div>

              <button 
                onClick={handleBookNow}
                className="w-full mt-4 bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(14,165,233,0.3)] hover:shadow-[0_15px_40px_rgba(14,165,233,0.5)] transition-all hover:-translate-y-1"
              >
                Find Vehicles <Search size={18} />
              </button>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Bottom Scrolling Features Line */}
      <div className="absolute bottom-0 left-0 w-full border-t border-white/10 bg-slate-950/50 backdrop-blur-md overflow-hidden py-4">
        <div className="flex w-max animate-marquee space-x-12 px-12">
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="flex space-x-12 items-center">
              {[
                "100% Verified Partners", "Instant Approvals", "24/7 Support Desk", "Dynamic Surge Pricing", "Encrypted Payments", "Real-time Tracking"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-semibold text-slate-400 uppercase tracking-widest">
                  <ShieldCheck size={16} className="text-sky-500/50" />
                  {text}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
