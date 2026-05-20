import { JSX } from "react";

/*
 * REPLACE: Fill in Gerard's actual contact details.
 * Search the file for "REPLACE" and update each value.
 */

type ContactItem = {
  icon: JSX.Element;
  label: string;
  value: string;
  href: string;
  note: string;
};

const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 shrink-0" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 shrink-0" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.35 2 2 0 0 1 3.63 1h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.5 5.5l.97-.97a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 21 15.46l.92 1.46z" />
  </svg>
);

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 shrink-0" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <path d="M17.5 6.5h.01" strokeLinecap="round" />
  </svg>
);

const IconVideo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 shrink-0" aria-hidden="true">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" />
  </svg>
);

const contacts: ContactItem[] = [
  {
    icon: <IconMail />,
    label: "Email",
    value: "REPLACE — add email address", // REPLACE: e.g. "gerard@example.com"
    href: "mailto:REPLACE",               // REPLACE: e.g. "mailto:gerard@example.com"
    note: "Primary contact — responds within 24h",
  },
  {
    icon: <IconPhone />,
    label: "Phone / WhatsApp",
    value: "REPLACE — add phone number",  // REPLACE: e.g. "+49 151 12345678"
    href: "tel:REPLACE",                  // REPLACE: e.g. "tel:+4915112345678"
    note: "WhatsApp preferred",
  },
  {
    icon: <IconInstagram />,
    label: "Instagram",
    value: "REPLACE — add @handle",       // REPLACE: e.g. "@gerard.gani"
    href: "https://instagram.com/REPLACE", // REPLACE: e.g. "https://instagram.com/gerard.gani"
    note: "Latest clips & updates",
  },
  {
    icon: <IconVideo />,
    label: "Highlight Video",
    value: "Watch full highlights",
    href: "#videos",                       // REPLACE: link directly to your video URL once uploaded
    note: "Season 2024/25",
  },
];

const IconDownload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" aria-hidden="true">
    <path d="M12 3v12" strokeLinecap="round" />
    <path d="M8 11l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 17v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
  </svg>
);

export default function Contact() {
  return (
    <section
      id="contact"
      className="bg-[#0a0a0a] py-20 sm:py-28 border-t border-[#111]"
      aria-labelledby="contact-heading"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-[300px_1fr] gap-12 lg:gap-20 items-start">

          {/* Left col */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-6 h-px bg-[#e11d48]" />
              <span className="text-zinc-500 text-xs font-semibold tracking-[0.25em] uppercase">
                Get in Touch
              </span>
            </div>
            <h2
              id="contact-heading"
              className="font-heading font-black text-white uppercase leading-none"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
            >
              Contact
            </h2>
            <p className="text-zinc-500 text-sm mt-6 leading-relaxed">
              Reach out directly to arrange a trial, request additional footage,
              or discuss any opportunity.
            </p>

            {/* Download player profile */}
            <div className="mt-10">
              {/* REPLACE: Update href to your PDF player profile link once created */}
              <a
                href="#"
                className="inline-flex items-center gap-2.5 border border-[#222] hover:border-zinc-500 text-zinc-400 hover:text-white text-xs font-semibold px-5 py-3 uppercase tracking-[0.12em] transition-colors duration-200"
                aria-label="Download player profile PDF"
              >
                <IconDownload />
                Download Player Profile
              </a>
              {/* REPLACE: Remove this note once PDF is uploaded */}
              <p className="text-zinc-700 text-xs mt-2 italic">
                PDF not yet uploaded — add link above
              </p>
            </div>
          </div>

          {/* Right col — contact cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {contacts.map(({ icon, label, value, href, note }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group flex items-start gap-4 bg-[#111] border border-[#1a1a1a] hover:border-[#e11d48]/40 p-5 sm:p-6 transition-all duration-200"
              >
                <div className="text-[#e11d48] mt-0.5 transition-transform duration-200 group-hover:scale-110">
                  {icon}
                </div>
                <div className="min-w-0">
                  <div className="text-zinc-600 text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5">
                    {label}
                  </div>
                  <div className="text-white font-semibold text-sm truncate">
                    {value}
                  </div>
                  <div className="text-zinc-600 text-xs mt-1">{note}</div>
                </div>
              </a>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
