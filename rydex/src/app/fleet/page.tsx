import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import ThreeScene from "@/components/ThreeScene";
import VehicleCategoriesSlider from "@/components/VehicleCategoriesSlider";

export default function FleetPage() {
  return (
    <div className="w-full min-h-screen bg-[#090a0f] text-white">
      <Nav />
      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">
          Fleet
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
          Explore every vehicle category in one place.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
          Browse bikes, cars, SUVs, vans, and trucks with a premium booking experience built for fast decisions.
        </p>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { k: "Instant availability", v: "See what’s nearby and ready right now, grouped by category." },
            { k: "Transparent pricing", v: "Upfront fare estimate and distance-based pricing for each vehicle." },
            { k: "Verified partners", v: "Admin-reviewed vendors and vehicle listings for quality and safety." },
          ].map((x) => (
            <div key={x.k} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">{x.k}</p>
              <p className="mt-3 text-sm leading-7 text-white/70">{x.v}</p>
            </div>
          ))}
        </section>

        <div className="mt-12">
          <VehicleCategoriesSlider />
        </div>

        <section className="mt-14 rounded-[2rem] border border-white/10 bg-white/5 p-8 md:p-10">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            What’s included in each booking
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-3 text-sm text-white/70">
              <p className="font-semibold text-white">For riders</p>
              <ul className="space-y-2">
                <li>- Pickup + drop address confirmation</li>
                <li>- Live booking status updates</li>
                <li>- Ride screen with tracking + chat (if enabled)</li>
              </ul>
            </div>
            <div className="space-y-3 text-sm text-white/70">
              <p className="font-semibold text-white">For partners</p>
              <ul className="space-y-2">
                <li>- Vendor dashboard to manage rides</li>
                <li>- Vehicle pricing configuration & review</li>
                <li>- Earnings tracking and payouts workflow</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            Live 3D vehicle preview
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
            A lightweight preview experience to make browsing feel premium. (Model + lighting can be customized per brand.)
          </p>
          <div className="mt-6">
            <ThreeScene />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
