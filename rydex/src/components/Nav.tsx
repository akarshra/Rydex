"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

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

          <div className="flex-1" />
        </div>
      </header>


    </>
  );
}
