export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-[#111111] py-8">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <a
          href="#"
          className="font-heading font-black text-white text-sm tracking-[0.2em] uppercase hover:opacity-70 transition-opacity"
          aria-label="Back to top"
        >
          GG<span className="text-[#e11d48]">.</span>
        </a>

        <p className="text-zinc-700 text-xs text-center">
          Gerard Gani · Attacking Player · SC Staaken U18 · Berlin, Germany
        </p>

        <p className="text-zinc-700 text-xs">© 2025</p>
      </div>

      {/* Verification note */}
      <div className="border-t border-[#0f0f0f] mt-6 pt-6 max-w-6xl mx-auto px-5 sm:px-8 text-center">
        <p className="text-zinc-700 text-xs">
          All information on this page is real and can be verified on request.
        </p>
      </div>
    </footer>
  );
}
