"use client";

import { motion } from "framer-motion";
import { Search, CreditCard, Car, ShieldCheck } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      id: "01",
      title: "Find Your Ride",
      description: "Enter your destination and browse through our expansive fleet of verified vehicles.",
      icon: <Search className="w-6 h-6 text-sky-400" />,
      color: "from-sky-500/20 to-blue-500/5",
    },
    {
      id: "02",
      title: "Secure Booking",
      description: "Confirm your trip with transparent pricing and secure, encrypted payment options.",
      icon: <CreditCard className="w-6 h-6 text-indigo-400" />,
      color: "from-indigo-500/20 to-purple-500/5",
    },
    {
      id: "03",
      title: "Meet Your Driver",
      description: "Track your driver in real-time. All partners undergo strict background checks.",
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      color: "from-emerald-500/20 to-teal-500/5",
    },
    {
      id: "04",
      title: "Enjoy the Journey",
      description: "Sit back and relax in a premium, well-maintained vehicle right to your doorstep.",
      icon: <Car className="w-6 h-6 text-purple-400" />,
      color: "from-purple-500/20 to-fuchsia-500/5",
    },
  ];

  return (
    <section className="relative py-24 sm:py-32 bg-[#020617] overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-indigo-500/10 blur-[120px] pointer-events-none rounded-[100%]" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-sky-300 mb-6"
          >
            How it works
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            Seamless mobility, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">redefined.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-slate-400"
          >
            Experience the future of transportation with our 4-step premium booking process.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i, type: "spring", stiffness: 100 }}
              className="relative group"
            >
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-b ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
              
              <div className="relative h-full p-8 rounded-3xl bg-slate-900/50 border border-white/5 backdrop-blur-md hover:border-white/20 transition-colors">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                  <span className="text-4xl font-black text-white/5 group-hover:text-white/10 transition-colors">
                    {step.id}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
