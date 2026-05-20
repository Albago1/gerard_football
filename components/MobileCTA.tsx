"use client";

import { useState, useEffect } from "react";

export default function MobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden transition-transform duration-300 ease-in-out ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!visible}
    >
      {/* Fade edge at top */}
      <div className="h-8 bg-gradient-to-t from-[#080808] to-transparent pointer-events-none" />
      <a
        href="#contact"
        tabIndex={visible ? 0 : -1}
        className="flex items-center justify-center gap-3 bg-[#e11d48] text-white font-heading font-black text-sm uppercase tracking-[0.2em] py-5 w-full active:bg-[#be123c] transition-colors"
      >
        Invite for Trial
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  );
}
