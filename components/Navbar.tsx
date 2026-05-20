"use client";

import { useState, useEffect } from "react";
import { useLang, type Lang } from "@/lib/i18n";

const navHrefs = ["#about", "#strengths", "#videos", "#contact"] as const;

export default function Navbar() {
  const { lang, setLang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: t.nav.profile,   href: "#about" },
    { label: t.nav.strengths, href: "#strengths" },
    { label: t.nav.videos,    href: "#videos" },
    { label: t.nav.contact,   href: "#contact" },
  ];

  const otherLang: Lang = lang === "en" ? "de" : "en";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || menuOpen
            ? "bg-[#080808]/98 backdrop-blur-md border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            onClick={close}
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

          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <button
              type="button"
              onClick={() => setLang(otherLang)}
              className="text-zinc-500 hover:text-white text-[11px] font-bold uppercase tracking-[0.15em] transition-colors duration-200 flex items-center gap-1"
              aria-label={`Switch to ${otherLang === "en" ? "English" : "Deutsch"}`}
            >
              <span className={lang === "de" ? "text-white" : ""}>DE</span>
              <span className="text-zinc-700">|</span>
              <span className={lang === "en" ? "text-white" : ""}>EN</span>
            </button>

            {/* Desktop CTA */}
            <a
              href="#contact"
              className="hidden md:block bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-bold px-5 py-2.5 uppercase tracking-[0.15em] transition-colors duration-200"
            >
              {t.nav.requestTrial}
            </a>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <span
                className={`block w-5 h-px bg-white transition-all duration-300 origin-center ${
                  menuOpen ? "rotate-45 translate-y-[7px]" : ""
                }`}
              />
              <span
                className={`block w-5 h-px bg-white transition-all duration-300 ${
                  menuOpen ? "opacity-0 scale-x-0" : ""
                }`}
              />
              <span
                className={`block w-5 h-px bg-white transition-all duration-300 origin-center ${
                  menuOpen ? "-rotate-45 -translate-y-[7px]" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mobile menu — drops below the header bar */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            menuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
          aria-hidden={!menuOpen}
        >
          <nav
            className="flex flex-col border-t border-white/5 px-5 py-6 gap-1"
            aria-label="Mobile navigation"
          >
            {navLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={close}
                className="text-zinc-300 hover:text-white text-sm font-semibold tracking-[0.15em] uppercase py-3 border-b border-white/5 last:border-0 transition-colors duration-200"
              >
                {label}
              </a>
            ))}

            <a
              href="#contact"
              onClick={close}
              className="mt-4 bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-bold px-5 py-3 uppercase tracking-[0.15em] transition-colors duration-200 text-center"
            >
              {t.nav.requestTrial}
            </a>
          </nav>
        </div>
      </header>

      {/* Backdrop — closes menu when tapping outside on mobile */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}
    </>
  );
}
