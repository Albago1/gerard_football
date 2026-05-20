"use client";

import { JSX } from "react";
import { useLang } from "@/lib/i18n";

const IconMail = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 shrink-0" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>;
const IconWhatsApp = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 shrink-0" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>;
const IconPhone = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 shrink-0" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.35 2 2 0 0 1 3.63 1h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.5 5.5l.97-.97a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 21 15.46l.92 1.46z" /></svg>;
const IconVideo = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 shrink-0" aria-hidden="true"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>;

export default function Contact() {
  const { t } = useLang();
  const c = t.contact;

  const contacts: { icon: JSX.Element; label: string; value: string; href: string; note: string }[] = [
    { icon: <IconMail />,     label: "Email",     value: "gerard.gani2007@gmail.com", href: "mailto:gerard.gani2007@gmail.com", note: c.notes.email },
    { icon: <IconWhatsApp />, label: "WhatsApp",  value: "+49 176 807 23173",         href: "https://wa.me/4917680723173",      note: c.notes.whatsapp },
    { icon: <IconPhone />,    label: "Phone",     value: "+49 176 807 23173",         href: "tel:+4917680723173",               note: c.notes.phone },
    { icon: <IconVideo />,    label: "Highlights",value: "Watch full highlights",     href: "#videos",                          note: c.notes.video },
  ];

  return (
    <section id="contact" className="bg-[#0a0a0a] py-20 sm:py-28 border-t border-[#111]" aria-labelledby="contact-heading">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-[300px_1fr] gap-12 lg:gap-20 items-start">

          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-6 h-px bg-[#e11d48]" />
              <span className="text-zinc-500 text-xs font-semibold tracking-[0.25em] uppercase">{c.eyebrow}</span>
            </div>
            <h2 id="contact-heading" className="font-heading font-black text-white uppercase leading-none" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
              {c.heading}
            </h2>
            <p className="text-zinc-500 text-sm mt-6 leading-relaxed">{c.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {contacts.map(({ icon, label, value, href, note }) => (
              <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group flex items-start gap-4 bg-[#111] border border-[#1a1a1a] hover:border-[#e11d48]/40 p-5 sm:p-6 transition-all duration-200">
                <div className="text-[#e11d48] mt-0.5 transition-transform duration-200 group-hover:scale-110">{icon}</div>
                <div className="min-w-0">
                  <div className="text-zinc-600 text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5">{label}</div>
                  <div className="text-white font-semibold text-sm truncate">{value}</div>
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
