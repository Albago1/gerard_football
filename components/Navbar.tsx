"use client";

import { useState, useEffect } from "react";

const navLinks = [
  { label: "Profile", href: "#about" },
  { label: "Strengths", href: "#strengths" },
  { label: "Videos", href: "#videos" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#080808]/95 backdrop-blur-md border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        {/* Logo mark */}
        <a
          href="#"
          className="font-heading font-black text-white text-xl tracking-[0.2em] uppercase hover:opacity-80 transition-opacity"
          aria-label="Gerard Gani – back to top"
        >
          GG<span className="text-[#e11d48]">.</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-zinc-400 hover:text-white text-xs font-semibold tracking-[0.15em] uppercase transition-colors duration-200"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <a
          href="#trial"
          className="bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-bold px-5 py-2.5 uppercase tracking-[0.15em] transition-colors duration-200"
        >
          Request Trial
        </a>
      </div>
    </header>
  );
}
