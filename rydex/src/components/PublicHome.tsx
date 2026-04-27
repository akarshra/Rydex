"use client";

import { useState } from "react";
import HeroSection from "@/components/Herosection";
import VehicleCategoriesSlider from "@/components/VehicleCategoriesSlider";
import HowItWorks from "@/components/HowItWorks";
import AuthModal from "@/components/AuthModal";
import ThreeScene from "@/components/ThreeScene";

export default function PublicHome() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <HeroSection onAuthRequired={() => setAuthOpen(true)} />
      
      <div className="bg-[#020617]">
        <VehicleCategoriesSlider />
        
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <HowItWorks />

        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <section className="py-24 relative overflow-hidden">
          <div className="absolute right-0 top-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Live 3D Preview
              </h2>
              <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
                Interact with our premium fleet models in real-time.
              </p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-xl p-4 shadow-2xl">
              <ThreeScene />
            </div>
          </div>
        </section>
      </div>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
      />
    </>
  );
}
