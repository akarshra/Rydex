const fs = require('fs');

const file = 'src/app/ride/[id]/page.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// 1. Add handleSosSubmit
const sosHandler = `
  const handleSosSubmit = async () => {
    setIsSosSubmitting(true);
    try {
      await fetch(\`/api/booking/\${id}/sos\`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: sosType }),
      });
      setSosSuccess(true);
      setTimeout(() => {
        setSosModalOpen(false);
        setSosSuccess(false);
        setSosType("");
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSosSubmitting(false);
    }
  };
`;

const fetchBookingLineIdx = lines.findIndex(l => l.includes("const fetchBooking = async () => {"));
if (fetchBookingLineIdx !== -1) {
  lines.splice(fetchBookingLineIdx, 0, sosHandler);
}

// 2. Extract SOS MODAL
const sosStart = lines.findIndex(l => l.includes("{/* ══ SOS MODAL ══ */}"));
let sosEnd = -1;
if (sosStart !== -1) {
    for (let i = sosStart; i < lines.length; i++) {
        if (lines[i].includes("</AnimatePresence>")) {
            sosEnd = i;
            break;
        }
    }
}

if (sosStart !== -1 && sosEnd !== -1) {
    const sosLines = lines.splice(sosStart, sosEnd - sosStart + 1);
    
    // Insert it into RidePage return
    // RidePage return ends with:
    // 325:         </motion.div>
    // 326:       </div>
    // 327:     </div>
    // 328:   );
    // 329: }
    
    const endRidePageIdx = lines.findIndex(l => l.trim() === "</div>" && lines[l+1]?.trim() === "</div>" && lines[l+2]?.trim() === ");");
    // simpler: search for "/* ══ COMPLETED — FULL SCREEN ══ */"
    const completedIdx = lines.findIndex(l => l.includes("COMPLETED FULL SCREEN"));
    if (completedIdx !== -1) {
        // Find the `); }` before it
        for (let i = completedIdx; i >= 0; i--) {
            if (lines[i].trim() === ");") {
                // insert before `);`
                lines.splice(i - 2, 0, ...sosLines); // insert before the last two `</div>`
                break;
            }
        }
    }
}

fs.writeFileSync(file, lines.join('\n'));
console.log("Fixed ride page!");
