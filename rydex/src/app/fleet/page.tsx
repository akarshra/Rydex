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

        <div className="mt-12">
          <VehicleCategoriesSlider />
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            Live 3D vehicle preview
          </h2>
          <div className="mt-6">
            <ThreeScene />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
