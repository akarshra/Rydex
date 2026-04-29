"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import AuthModal from "@/components/AuthModal";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

          <nav className="flex-1 flex items-center justify-center gap-8">
            <Link href="/" className="text-sm font-medium text-[var(--text)] hover:text-[var(--text-secondary)] transition">
              Home
            </Link>
            <Link href="/bookings" className="text-sm font-medium text-[var(--text)] hover:text-[var(--text-secondary)] transition">
              Booking
            </Link>
            <Link href="/fleet" className="text-sm font-medium text-[var(--text)] hover:text-[var(--text-secondary)] transition">
              Fleet
            </Link>
            <Link href="/rydex-black" className="text-sm font-medium text-amber-600 hover:text-amber-700 transition font-bold flex items-center gap-1">
              👑 Rydex Black
            </Link>
            <Link href="/faq" className="text-sm font-medium text-[var(--text)] hover:text-[var(--text-secondary)] transition">
              FAQ
            </Link>
            <Link href="/contact" className="text-sm font-medium text-[var(--text)] hover:text-[var(--text-secondary)] transition">
              Contact
            </Link>
          </nav>

          <button
            onClick={() => setAuthOpen(true)}
            className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90 transition"
          >
            Sign in
          </button>
        </div>
      </header>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
      />
    </>
  );
}
