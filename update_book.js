const fs = require('fs');
const path = 'rydex/src/app/book/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add Calendar icon
content = content.replace(
  'import { useState } from "react";',
  'import { useState } from "react";\nimport { Calendar } from "lucide-react";'
);

// Add haversine
content = content.replace(
  'export default function BookPage() {',
  `function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371;
  var dLat = (lat2-lat1) * (Math.PI/180);
  var dLon = (lon2-lon1) * (Math.PI/180); 
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
}

export default function BookPage() {`
);

// Add state
content = content.replace(
  'const [locating,  setLocating]  = useState(false);',
  `const [locating,  setLocating]  = useState(false);
  const [scheduleMode, setScheduleMode] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");
  const [submitting, setSubmitting] = useState(false);`
);

// Update canContinue
content = content.replace(
  'const canContinue = !!(pickup && drop && vehicle && mobile && pickupLat && pickupLng && dropLat && dropLng);',
  'const canContinue = !!(pickup && drop && vehicle && mobile && pickupLat && pickupLng && dropLat && dropLng && (!scheduleMode || scheduledTime));'
);

// Add handleContinue
content = content.replace(
  '/* ── SEARCH ── */',
  `const handleContinue = async () => {
    if (scheduleMode) {
      setSubmitting(true);
      const km = getDistanceFromLatLonInKm(pickupLat!, pickupLng!, dropLat!, dropLng!);
      const rates: any = { bike: 10, auto: 15, car: 20, loading: 25, truck: 40 };
      const base: any = { bike: 20, auto: 30, car: 50, loading: 100, truck: 500 };
      const estimatedFare = Math.round(base[vehicle as string] + km * rates[vehicle as string]);
      
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
      setSubmitting(false);
      if (res.ok) {
        alert("Ride scheduled successfully!");
        router.push("/bookings");
      } else {
        alert("Failed to schedule ride");
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
      });
      router.push("/search?" + url.toString());
    }
  };

  /* ── SEARCH ── */`
);

// Add Schedule Toggle and Time Picker
content = content.replace(
  '{/* ══ CTA ══ */}',
  `{/* ══ STEP 4 — SCHEDULE (Optional) ══ */}
            <motion.div variants={stepVariants} initial="hidden" animate="visible" transition={{ delay: 0.28 }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[9px] font-black">4</span>
                </div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Timing</p>
              </div>

              <div className="flex bg-zinc-100 p-1 rounded-xl mb-4">
                <button
                  onClick={() => setScheduleMode(false)}
                  className={\`flex-1 py-2 text-sm font-semibold rounded-lg transition-all \${!scheduleMode ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}\`}
                >
                  Ride Now
                </button>
                <button
                  onClick={() => setScheduleMode(true)}
                  className={\`flex-1 py-2 text-sm font-semibold rounded-lg transition-all \${scheduleMode ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}\`}
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

            {/* ══ CTA ══ */}`
);

// Update CTA button onClick and Text
content = content.replace(
  'disabled={!canContinue}',
  'disabled={!canContinue || submitting}'
);

content = content.replace(
  `onClick={() => router.push(
                  \`/search?pickup=\${encodeURIComponent(pickup)}&drop=\${encodeURIComponent(drop)}&vehicle=\${vehicle}&mobileNumber=\${encodeURIComponent(mobile)}&pickupLat=\${pickupLat}&pickupLng=\${pickupLng}&dropLat=\${dropLat}&dropLng=\${dropLng}\`
                )}`,
  'onClick={handleContinue}'
);

content = content.replace(
  '<span>Continue</span>',
  '<span>{submitting ? "Processing..." : scheduleMode ? "Confirm Schedule" : "Continue"}</span>'
);

fs.writeFileSync(path, content);
console.log("Updated book page");
