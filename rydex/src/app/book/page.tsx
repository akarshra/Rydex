"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, MapPin, Navigation,
  Bike, Car, Truck, LocateFixed, Phone,
  CheckCircle2, ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Calendar, Home, Briefcase, Plus, X, Wind, Music, VolumeX, Luggage, Baby, Dog } from "lucide-react";
import { SurgePredictor } from "@/components/SurgePredictor";

type Place = {
  id: string; name: string; city?: string; state?: string;
  country?: string; countrycode?: string; lat: number; lng: number;
};
type VehicleType = "bike" | "auto" | "car" | "loading" | "truck";
type DispatchTier = "standard" | "priority" | "wait_save";
type Stop = { address: string; lat: number | null; lng: number | null; results: Place[] };

const VEHICLES = [
  { id: "bike",    label: "Bike",    Icon: Bike,  desc: "Quick & affordable" },
  { id: "auto",    label: "Auto",    Icon: Car,   desc: "Everyday rides"     },
  { id: "car",     label: "Car",     Icon: Car,   desc: "Comfort rides"      },
  { id: "loading", label: "Loading", Icon: Truck, desc: "Small cargo"        },
  { id: "truck",   label: "Truck",   Icon: Truck, desc: "Heavy transport"    },
];

const TIER_CONFIG: Record<DispatchTier, { label: string; desc: string; multiplier: number }> = {
  standard: { label: "Standard", desc: "Regular dispatch", multiplier: 1 },
  priority: { label: "Priority", desc: "Fastest dispatch (+15%)", multiplier: 1.15 },
  wait_save: { label: "Wait & Save", desc: "Discount for waiting (-20%)", multiplier: 0.8 },
};

const stepVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function BookPage() {
  const router = useRouter();

  const [pickup,   setPickup]   = useState("");
  const [drop,     setDrop]     = useState("");
  const [vehicle,  setVehicle]  = useState<VehicleType | null>(null);
  const [mobile,   setMobile]   = useState("");

  const [pickupResults, setPickupResults] = useState<Place[]>([]);
  const [dropResults,   setDropResults]   = useState<Place[]>([]);
  const [pickupCountry, setPickupCountry] = useState<string | null>(null);

  const [pickupLat, setPickupLat] = useState<number | null>(null);
  const [pickupLng, setPickupLng] = useState<number | null>(null);
  const [dropLat,   setDropLat]   = useState<number | null>(null);
  const [dropLng,   setDropLng]   = useState<number | null>(null);
  const [locating,  setLocating]  = useState(false);
  const [scheduleMode, setScheduleMode] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* Premium states */
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [dispatchTier, setDispatchTier] = useState<DispatchTier>("standard");
  const [ridePreferences, setRidePreferences] = useState<any>(null);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    fetch("/api/saved-places").then(r => r.json()).then(d => setSavedPlaces(d.places || []));
    fetch("/api/ride-preferences").then(r => r.json()).then(d => setRidePreferences(d.preferences || null));
  }, []);

  const canContinue = !!(pickup && drop && vehicle && mobile && pickupLat && pickupLng && dropLat && dropLng && (!scheduleMode || scheduledTime));

  function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = (lat2-lat1) * (Math.PI/180);
    const dLon = (lon2-lon1) * (Math.PI/180); 
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; 
  }

  const handleContinue = async () => {
    if (scheduleMode) {
      setSubmitting(true);
      const km = getDistanceFromLatLonInKm(pickupLat!, pickupLng!, dropLat!, dropLng!);
      const rates: any = { bike: 10, auto: 15, car: 20, loading: 25, truck: 40 };
      const base: any = { bike: 20, auto: 30, car: 50, loading: 100, truck: 500 };
      const estimatedFare = Math.round(base[vehicle as string] + km * rates[vehicle as string]);
      
      try {
        const res = await fetch("/api/booking/schedule/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vehicleType: vehicle,
            pickupAddress: pickup,
            dropAddress: drop,
            pickupLocation: { type: "Point", coordinates: [pickupLng, pickupLat] },
            dropLocation: { type: "Point", coordinates: [dropLng, dropLat] },
            scheduledTime: new Date(scheduledTime).toISOString(),
            estimatedFare
          })
        });
        
        if (res.ok) {
          alert("Ride scheduled successfully!");
          router.push("/bookings");
        } else {
          alert("Failed to schedule ride");
        }
      } catch (e) {
        alert("Network error while scheduling");
      } finally {
        setSubmitting(false);
      }
    } else {
      const url = new URLSearchParams({
        pickup, drop,
        vehicle:    vehicle || "",
        pickupLat:  String(pickupLat),
        pickupLng:  String(pickupLng),
        dropLat:    String(dropLat),
        dropLng:    String(dropLng),
        mobileNumber: mobile,
        dispatchTier,
      });
      if (stops.length > 0) {
        url.set("stops", JSON.stringify(stops.filter(s => s.address && s.lat && s.lng).map(s => ({
          address: s.address,
          location: { type: "Point", coordinates: [s.lng, s.lat] }
        }))));
      }
      if (ridePreferences) {
        url.set("ridePrefs", JSON.stringify({
          temperature: ridePreferences.temperature,
          musicGenre: ridePreferences.musicGenre,
          quietRide: ridePreferences.quietRide,
          luggageAssistance: ridePreferences.luggageAssistance,
          childSeat: ridePreferences.childSeat,
          petFriendly: ridePreferences.petFriendly,
        }));
      }
      router.push("/search?" + url.toString());
    }
  };

  /* ── SEARCH ── */
  const searchAddress = async (q: string, setResults: (r: Place[]) => void, restrict?: string | null) => {
    if (!q || q.trim().length < 3) { setResults([]); return; }
    try {
      const res  = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q.trim())}&limit=8&lang=en`);
      const data = await res.json();
      let results: Place[] = (data?.features ?? []).map((f: any) => ({
        id: String(f.properties.osm_id),
        name: f.properties.name,
        city: f.properties.city,
        state: f.properties.state,
        country: f.properties.country,
        countrycode: f.properties.countrycode?.toLowerCase(),
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
      }));
      if (restrict) results = results.filter(p => p.countrycode === restrict);
      setResults(results);
    } catch { setResults([]); }
  };

  const fmt = (p: Place) => [p.name, p.city, p.state, p.country].filter(Boolean).join(", ");

  /* ── GPS ── */
  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res  = await fetch(`https://photon.komoot.io/reverse?lat=${coords.latitude}&lon=${coords.longitude}&limit=1`);
          const data = await res.json();
          if (data?.features?.length) {
            const p    = data.features[0].properties;
            const addr = [p.name, p.street, p.city, p.state, p.country].filter(Boolean).join(", ");
            setPickup(addr);
            setPickupCountry(p.countrycode?.toLowerCase() || null);
            setPickupLat(coords.latitude);
            setPickupLng(coords.longitude);
            setPickupResults([]);
          }
        } finally { setLocating(false); }
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  /* ── PROGRESS ── */
  const progress = [!!vehicle, !!(mobile.length >= 10), !!pickup, !!drop].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >

        {/* ── HEADER ── */}
        <div className="flex items-center gap-4 mb-6 px-1">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => router.back()}
            className="w-11 h-11 rounded-2xl bg-white border border-zinc-200 shadow-sm flex items-center justify-center hover:bg-zinc-50 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={17} className="text-zinc-900" />
          </motion.button>
          <div className="flex-1 min-w-0">
            <h1 className="text-zinc-900 text-xl font-black tracking-tight">Book a Ride</h1>
            <p className="text-zinc-400 text-xs mt-0.5">Fill in the details below</p>
          </div>
          {/* Progress dots */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {[0, 1, 2, 3].map(i => (
              <motion.div
                key={i}
                animate={{ width: i < progress ? 20 : 8, background: i < progress ? "#09090b" : "#d4d4d8" }}
                transition={{ duration: 0.3 }}
                className="h-2 rounded-full"
              />
            ))}
          </div>
        </div>

        {/* ── CARD ── */}
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden">

          {/* Top strip */}
          <div className="h-1 bg-zinc-900 w-full" />

          <div className="p-6 space-y-7">

            {/* ══ STEP 1 — VEHICLE ══ */}
            <motion.div variants={stepVariants} initial="hidden" animate="visible" transition={{ delay: 0.05 }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[9px] font-black">1</span>
                </div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Choose Vehicle</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {VEHICLES.map((v, i) => {
                  const active = vehicle === v.id;
                  return (
                    <motion.button
                      key={v.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.07 + i * 0.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setVehicle(v.id as VehicleType)}
                      className={`relative p-3.5 rounded-2xl border flex items-center gap-3 text-left transition-all duration-200 ${
                        active
                          ? "bg-zinc-900 border-zinc-900 shadow-lg"
                          : "bg-zinc-50 border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        active ? "bg-white" : "bg-zinc-200"
                      }`}>
                        <v.Icon size={18} className={active ? "text-zinc-900" : "text-zinc-600"} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-bold truncate ${active ? "text-white" : "text-zinc-900"}`}>{v.label}</p>
                        <p className={`text-[10px] truncate ${active ? "text-zinc-400" : "text-zinc-400"}`}>{v.desc}</p>
                      </div>
                      {active && (
                        <motion.div
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="absolute top-2.5 right-2.5"
                        >
                          <CheckCircle2 size={13} className="text-white fill-white/20" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* DIVIDER */}
            <div className="h-px bg-zinc-100" />

            {/* ══ STEP 2 — MOBILE ══ */}
            <motion.div variants={stepVariants} initial="hidden" animate="visible" transition={{ delay: 0.15 }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[9px] font-black">2</span>
                </div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Mobile Number</p>
              </div>

              <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 focus-within:border-zinc-900 focus-within:bg-white transition-all">
                <div className="w-8 h-8 rounded-xl bg-zinc-200 flex items-center justify-center flex-shrink-0">
                  <Phone size={14} className="text-zinc-600" />
                </div>
                <input
                  type="tel"
                  value={mobile}
                  onChange={e => setMobile(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter your mobile number"
                  inputMode="numeric"
                  maxLength={15}
                  className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none"
                />
                <AnimatePresence>
                  {mobile.length >= 10 && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-50 flex-shrink-0" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-zinc-400 text-[10px] mt-1.5 ml-1">Ride updates will be sent to this number</p>
            </motion.div>

            {/* DIVIDER */}
            <div className="h-px bg-zinc-100" />

            {/* ══ STEP 3 — LOCATIONS ══ */}
            <motion.div variants={stepVariants} initial="hidden" animate="visible" transition={{ delay: 0.22 }} className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[9px] font-black">3</span>
                </div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Route</p>
              </div>

              {/* Saved Places Quick Select */}
              {savedPlaces.length > 0 && (
                <div className="flex gap-2 mb-2">
                  {savedPlaces.filter((sp: any) => sp.label === "home" || sp.label === "work").map((place: any) => (
                    <button
                      key={place._id}
                      onClick={() => {
                        setPickup(place.address);
                        setPickupLat(place.lat);
                        setPickupLng(place.lng);
                        setPickupCountry(null);
                      }}
                      className="flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors"
                    >
                      {place.label === "home" ? <Home size={12} /> : <Briefcase size={12} />}
                      {place.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Route visual connector */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-visible">

                {/* PICKUP INPUT */}
                <div className="relative z-20">
                  <div className="flex items-center gap-3 px-4 py-3.5 focus-within:bg-white rounded-t-2xl transition-colors">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-3 h-3 rounded-full bg-zinc-900 border-2 border-white shadow" />
                      <div className="w-px h-5 bg-zinc-300 mt-1" />
                    </div>
                    <input
                      value={pickup}
                      onChange={e => { setPickup(e.target.value); searchAddress(e.target.value, setPickupResults); }}
                      placeholder="Pickup location"
                      className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none"
                    />
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={useCurrentLocation}
                      disabled={locating}
                      className="w-8 h-8 rounded-xl bg-zinc-200 hover:bg-zinc-300 transition-colors flex items-center justify-center flex-shrink-0"
                    >
                      <LocateFixed size={14} className={`text-zinc-700 ${locating ? "animate-spin" : ""}`} />
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {pickupResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-2xl shadow-xl max-h-52 overflow-y-auto z-50"
                      >
                        {pickupResults.map((p, i) => (
                          <motion.button
                            key={p.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => {
                              setPickup(fmt(p));
                              setPickupCountry(p.countrycode || null);
                              setPickupLat(p.lat); setPickupLng(p.lng);
                              setPickupResults([]);
                            }}
                            className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0"
                          >
                            <MapPin size={13} className="text-zinc-400 flex-shrink-0" />
                            <span className="text-sm text-zinc-800 font-medium truncate">{fmt(p)}</span>
                            <ChevronRight size={13} className="text-zinc-300 flex-shrink-0 ml-auto" />
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* MULTI-STOP INPUTS */}
                <AnimatePresence>
                  {stops.map((stop, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative z-10"
                    >
                      <div className="h-px bg-zinc-200 mx-4" />
                      <div className="flex items-center gap-3 px-4 py-3.5 focus-within:bg-white transition-colors">
                        <div className="flex-shrink-0">
                          <div className="w-3 h-3 rounded-full bg-zinc-400 border-2 border-white shadow" />
                        </div>
                        <input
                          value={stop.address}
                          onChange={e => {
                            const newStops = [...stops];
                            newStops[idx] = { ...stop, address: e.target.value };
                            setStops(newStops);
                            searchAddress(e.target.value, (results) => {
                              const ns = [...stops];
                              ns[idx] = { ...stop, results };
                              setStops(ns);
                            });
                          }}
                          placeholder={`Stop ${idx + 1}`}
                          className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none"
                        />
                        <button
                          onClick={() => setStops(stops.filter((_, i) => i !== idx))}
                          className="text-zinc-400 hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      {stop.results.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-2xl shadow-xl max-h-40 overflow-y-auto z-50"
                        >
                          {stop.results.map((p, i) => (
                            <button
                              key={p.id}
                              onClick={() => {
                                const ns = [...stops];
                                ns[idx] = { address: fmt(p), lat: p.lat, lng: p.lng, results: [] };
                                setStops(ns);
                              }}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-zinc-50 border-b border-zinc-100 last:border-0"
                            >
                              <MapPin size={12} className="text-zinc-400" />
                              <span className="text-sm text-zinc-800 font-medium truncate">{fmt(p)}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* ADD STOP BUTTON */}
                {stops.length < 2 && (
                  <div className="px-4 py-2">
                    <button
                      onClick={() => setStops([...stops, { address: "", lat: null, lng: null, results: [] }])}
                      className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      <Plus size={12} /> Add stop
                    </button>
                  </div>
                )}

                {/* SEPARATOR */}
                <div className="h-px bg-zinc-200 mx-4" />

                {/* DROP INPUT */}
                <div className="relative z-10">
                  <div className="flex items-center gap-3 px-4 py-3.5 focus-within:bg-white rounded-b-2xl transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 rounded-sm bg-zinc-900 border-2 border-white shadow" />
                    </div>
                    <input
                      value={drop}
                      onChange={e => { setDrop(e.target.value); searchAddress(e.target.value, setDropResults, pickupCountry); }}
                      disabled={!pickupCountry}
                      placeholder={pickupCountry ? "Drop location" : "Select pickup first"}
                      className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none disabled:opacity-50"
                    />
                    <Navigation size={14} className="text-zinc-300 flex-shrink-0" />
                  </div>

                  <AnimatePresence>
                    {dropResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-2xl shadow-xl max-h-52 overflow-y-auto z-50"
                      >
                        {dropResults.map((p, i) => (
                          <motion.button
                            key={p.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => {
                              setDrop(fmt(p));
                              setDropLat(p.lat); setDropLng(p.lng);
                              setDropResults([]);
                            }}
                            className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0"
                          >
                            <Navigation size={13} className="text-zinc-400 flex-shrink-0" />
                            <span className="text-sm text-zinc-800 font-medium truncate">{fmt(p)}</span>
                            <ChevronRight size={13} className="text-zinc-300 flex-shrink-0 ml-auto" />
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* ══ STEP 4 — DISPATCH TIER ══ */}
            <motion.div variants={stepVariants} initial="hidden" animate="visible" transition={{ delay: 0.25 }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[9px] font-black">4</span>
                </div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Dispatch Option</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(TIER_CONFIG) as DispatchTier[]).map((tier) => {
                  const active = dispatchTier === tier;
                  return (
                    <button
                      key={tier}
                      onClick={() => setDispatchTier(tier)}
                      className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl text-xs font-semibold transition-all border ${
                        active
                          ? "bg-zinc-900 text-white border-zinc-900"
                          : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      <span className="font-bold">{TIER_CONFIG[tier].label}</span>
                      <span className={`text-[10px] mt-0.5 ${active ? "text-zinc-300" : "text-zinc-400"}`}>{TIER_CONFIG[tier].desc}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* ══ STEP 5 — RIDE PREFERENCES ══ */}
            {ridePreferences && (
              <motion.div variants={stepVariants} initial="hidden" animate="visible" transition={{ delay: 0.26 }}>
                <button
                  onClick={() => setShowPreferences(!showPreferences)}
                  className="flex items-center justify-between w-full mb-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[9px] font-black">5</span>
                    </div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Ride Preferences</p>
                  </div>
                  <span className="text-xs font-semibold text-zinc-400">{showPreferences ? "Hide" : "Show"}</span>
                </button>
                <AnimatePresence>
                  {showPreferences && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-zinc-600">
                          <Wind size={14} /> Temperature: <span className="font-semibold capitalize">{ridePreferences.temperature}</span>
                        </div>
                        {ridePreferences.musicGenre && (
                          <div className="flex items-center gap-2 text-xs text-zinc-600">
                            <Music size={14} /> Music: <span className="font-semibold">{ridePreferences.musicGenre}</span>
                          </div>
                        )}
                        {ridePreferences.quietRide && (
                          <div className="flex items-center gap-2 text-xs text-zinc-600">
                            <VolumeX size={14} /> <span className="font-semibold">Quiet ride requested</span>
                          </div>
                        )}
                        {ridePreferences.luggageAssistance && (
                          <div className="flex items-center gap-2 text-xs text-zinc-600">
                            <Luggage size={14} /> <span className="font-semibold">Luggage assistance</span>
                          </div>
                        )}
                        {ridePreferences.childSeat && (
                          <div className="flex items-center gap-2 text-xs text-zinc-600">
                            <Baby size={14} /> <span className="font-semibold">Child seat needed</span>
                          </div>
                        )}
                        {ridePreferences.petFriendly && (
                          <div className="flex items-center gap-2 text-xs text-zinc-600">
                            <Dog size={14} /> <span className="font-semibold">Pet friendly</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ══ STEP 6 — SCHEDULE (Optional) ══ */}
            <motion.div variants={stepVariants} initial="hidden" animate="visible" transition={{ delay: 0.28 }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[9px] font-black">6</span>
                </div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Timing</p>
              </div>

              <div className="flex bg-zinc-100 p-1 rounded-xl mb-4">
                <button
                  onClick={() => setScheduleMode(false)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!scheduleMode ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}
                >
                  Ride Now
                </button>
                <button
                  onClick={() => setScheduleMode(true)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${scheduleMode ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}
                >
                  Schedule Later
                </button>
              </div>

              <AnimatePresence>
                {scheduleMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 focus-within:border-zinc-900 focus-within:bg-white transition-all">
                      <div className="w-8 h-8 rounded-xl bg-zinc-200 flex items-center justify-center flex-shrink-0">
                        <Calendar size={14} className="text-zinc-600" />
                      </div>
                      <input
                        type="datetime-local"
                        value={scheduledTime}
                        onChange={e => setScheduledTime(e.target.value)}
                        min={new Date(Date.now() + 30 * 60000).toISOString().slice(0, 16)}
                        className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 outline-none"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* DIVIDER */}
            <div className="h-px bg-zinc-100" />

            {/* ══ SURGE PREDICTOR ══ */}
            {pickup && drop && pickupLat && pickupLng && dropLat && dropLng && (
              <motion.div 
                variants={stepVariants} 
                initial="hidden" 
                animate="visible" 
                transition={{ delay: 0.28 }}
              >
                <SurgePredictor
                  startLocation={pickup}
                  endLocation={drop}
                  startCoords={{ lat: pickupLat, lng: pickupLng }}
                  endCoords={{ lat: dropLat, lng: dropLng }}
                  basePrice={250}
                  currentSurge={1.2}
                />
              </motion.div>
            )}

            {/* DIVIDER */}
            <div className="h-px bg-zinc-100" />

            {/* ══ CTA ══ */}
            <motion.div
              variants={stepVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}
            >
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={canContinue ? { scale: 1.02 } : {}}
                disabled={!canContinue || submitting}
                onClick={handleContinue}
                className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-black disabled:opacity-35 text-white font-black text-sm tracking-wide flex items-center justify-center gap-2.5 transition-colors shadow-lg disabled:shadow-none"
              >
                <span>{submitting ? "Processing..." : scheduleMode ? "Confirm Schedule" : "Continue"}</span>
                <motion.div
                  animate={canContinue ? { x: [0, 4, 0] } : {}}
                  transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1 }}
                >
                  <ArrowRight size={17} />
                </motion.div>
              </motion.button>

              {/* Completion hint */}
              <AnimatePresence>
                {!canContinue && (
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-center text-zinc-400 text-[10px] font-medium mt-2.5 tracking-wide"
                  >
                    {!vehicle ? "Select a vehicle to continue" :
                     mobile.length < 10 ? "Enter a valid mobile number" :
                     !pickup ? "Enter pickup location" :
                     !drop ? "Enter drop location" : ""}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

          </div>
        </div>

        {/* Bottom hint */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-center text-zinc-400 text-[10px] mt-4 tracking-wide"
        >
          Rides are subject to driver availability
        </motion.p>

      </motion.div>
    </div>
  );
}