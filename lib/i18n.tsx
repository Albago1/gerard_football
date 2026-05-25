"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Lang = "en" | "de";

export const translations = {
  en: {
    nav: {
      profile: "Profile",
      strengths: "Strengths",
      videos: "Videos",
      contact: "Contact",
      requestTrial: "Request Trial",
    },
    hero: {
      club: "SC Staaken — Berlin, Germany",
      availableBadge: "Available for trials",
      striker: "Striker",
      winger: "Left Winger",
      meta: "Berlin · Albania · Age 18",
      pitch: "18-year-old attacking player from Berlin, ready for the step into senior football.",
      cta1: "Invite for Trial",
      cta2: "Watch Highlights",
      scroll: "Scroll",
      stats: { height: "Height", weight: "Weight", rightFoot: "Right foot", leftFoot: "Left foot" },
    },
    about: {
      eyebrow: "Who He Is",
      heading1: "Player",
      heading2: "Profile",
      p1: "Gerard Gani is 18, based in Berlin, and plays for SC Staaken. He's a striker first, left winger when needed — his game is built around one thing: getting into positions to score and creating problems for defenders.",
      p2: "He's two-footed. Right foot rated 10/10, left at 8/10. That's not a marketing line — it means he can finish from both sides in tight spaces, cut inside or go wide, and keep defenders honest in every situation.",
      p3: "At 187 cm and 78 kg he's physically ready for senior football. He presses from the front, wins the ball back in dangerous areas, and doesn't jog back when the team loses possession. The defensive side of the game is not an afterthought for him.",
      quote: "He is available for trial immediately. No contract required to take a look — one training session is enough to judge.",
    },
    strengths: {
      eyebrow: "What I Bring",
      heading: "Key Strengths",
      items: [
        { title: "Finishing", desc: "Clinical in front of goal. Consistent under pressure with both feet — from range and tight angles." },
        { title: "Direct Runs", desc: "Aggressive vertical runs in behind the line. Exploits space and challenges the offside trap." },
        { title: "1v1 Attacking", desc: "Comfortable taking on defenders with pace and technique. Uses body feints and sharp change of direction." },
        { title: "Chance Creation", desc: "Reads the game to create dangerous situations — through individual actions and combination play." },
        { title: "Defensive Work Rate", desc: "Presses from the front, tracks back when needed. Contributes defensively and sets the tone for the team." },
        { title: "Two-Footed", desc: "Right 10/10 · Left 8/10. Equally dangerous from both sides — keeps defenders constantly guessing." },
      ],
    },
    snapshot: {
      eyebrow: "Player Profile",
      heading: "At a Glance",
      labels: { position: "Position", age: "Age", height: "Height", weight: "Weight", nationality: "Nationality", club: "Current Club", strongFoot: "Strong Foot", weakFoot: "Weak Foot" },
      values: { nationality: "Albanian", strongFoot: "Right", weakFoot: "Left" },
    },
    why: {
      eyebrow: "The Case for Gerard",
      heading: "Why Invite Gerard?",
      items: [
        { title: "Direct attacking profile", body: "He attacks with intent. Every run, every decision in the final third points forward — no hesitation when it matters. Give him space between the lines and he punishes it." },
        { title: "Two-footed finishing", body: "Right foot is his main weapon (10/10). Left foot finishes cleanly in tight spaces (8/10). That combination keeps defenders guessing in a way that one-footed players simply cannot." },
        { title: "Hungry to prove himself", body: "He's 18, he's at U18 level, and he knows what that means. He's not asking for a contract — he's asking for one training session. If it's not there, the club loses nothing." },
      ],
      cta1: "Seen enough?",
      cta2: "Give him one session on the pitch.",
      ctaBtn: "Arrange a Trial",
    },
    profile: {
      eyebrow: "Who He Is",
      heading1: "Player",
      heading2: "Profile",
      p1: "Gerard Gani is 18, based in Berlin, and plays for SC Staaken. He's a striker first, left winger when needed — his game is built around one thing: getting into positions to score and creating problems for defenders.",
      p2: "He's two-footed. Right foot rated 10/10, left at 8/10. That means he can finish from both sides in tight spaces, cut inside or go wide, and keep defenders honest in every situation.",
      p3: "At 187 cm and 78 kg he's physically ready for senior football. He presses from the front, wins the ball back in dangerous areas, and doesn't jog back when the team loses possession.",
      quote: "Available for trial immediately. No contract required — one training session is enough to judge.",
      statsEyebrow: "At a Glance",
      careerEyebrow: "Career Path",
      careerHeading: "Club History",
      labels: { position: "Position", age: "Age", height: "Height", weight: "Weight", nationality: "Nationality", club: "Current Club", strongFoot: "Strong Foot", weakFoot: "Weak Foot" },
      values: { nationality: "Albanian", strongFoot: "Right", weakFoot: "Left" },
    },
    heroReel: {
      eyebrow: "Best Highlights",
      heading: "Watch the Reel",
      cta: "Browse all footage",
      noClips: "Clips coming soon",
      replay: "Play again",
    },
    trial: {
      eyebrow: "The Proposition",
      quote: '"I only need one chance\nto show my level."',
      sub: "If it does not fit, the club loses nothing.",
      cta: "Invite Gerard for Trial",
      facts: ["Age 18", "Berlin Based", "Available Immediately", "No Transfer Fee", "Two-Footed"],
    },
    videos: {
      eyebrow: "Video Library",
      heading: "Footage",
      description: "Browse by category. Tap any clip to open the viewer. Swipe or use arrow keys to move between clips.",
      requestLink: "Request full match footage",
      footerTitle: "Want more footage before deciding?",
      footerDesc: "Full 90-minute match footage, training clips, and set-piece situations available immediately on request.",
      footerBtn: "Request Footage",
      swipeHint: "Swipe to navigate",
    },
    categories: {
      goals:    { label: "Finishing",    title: "Goals",                    description: "Finishing from range, tight angles, and 1v1 with the keeper." },
      assists:  { label: "Creativity",   title: "Assists & Chance Creation", description: "Link-up play, through balls, and created scoring opportunities." },
      dribbling:{ label: "Technical",    title: "Dribbling & 1v1",          description: "Taking on defenders, using pace and technique in tight spaces." },
      pressing: { label: "Work Rate",    title: "Pressing & Defensive Work",description: "Press triggers, ball recoveries, and defensive contribution." },
    },
    contact: {
      eyebrow: "Get in Touch",
      heading: "Contact",
      description: "Reach out directly to arrange a trial, request additional footage, or discuss any opportunity.",
      notes: { email: "Primary contact — responds within 24h", whatsapp: "Preferred — fastest response", phone: "Call or SMS", video: "Season 2024/25" },
    },
    footer: {
      tagline: "Gerard Gani · Attacking Player · SC Staaken · Berlin, Germany",
      verification: "All information on this page is real and can be verified on request.",
    },
    mobileCta: "Invite for Trial",
  },

  de: {
    nav: {
      profile: "Profil",
      strengths: "Stärken",
      videos: "Videos",
      contact: "Kontakt",
      requestTrial: "Probetraining",
    },
    hero: {
      club: "SC Staaken — Berlin, Deutschland",
      availableBadge: "Verfügbar für Probetraining",
      striker: "Stürmer",
      winger: "Linksaußen",
      meta: "Berlin · Albanien · 18 Jahre",
      pitch: "18-jähriger Angreifer aus Berlin, bereit für den Schritt in den Erwachsenenfußball.",
      cta1: "Zum Probetraining einladen",
      cta2: "Highlights ansehen",
      scroll: "Scrollen",
      stats: { height: "Größe", weight: "Gewicht", rightFoot: "Rechter Fuß", leftFoot: "Linker Fuß" },
    },
    about: {
      eyebrow: "Wer Er Ist",
      heading1: "Spieler",
      heading2: "Profil",
      p1: "Gerard Gani ist 18 Jahre alt, lebt in Berlin und spielt für SC Staaken. Er ist primär Stürmer, bei Bedarf auch Linksaußen — sein Spiel dreht sich um eines: in Abschlussposition zu kommen und Verteidigern Probleme zu bereiten.",
      p2: "Er ist beidfüßig. Rechter Fuß 10/10, linker Fuß 8/10. Das ist keine Marketingaussage — er kann von beiden Seiten in engen Räumen abschließen, nach innen ziehen oder außen gehen und Verteidiger in jeder Situation beschäftigen.",
      p3: "Mit 187 cm und 78 kg ist er körperlich bereit für den Erwachsenenfußball. Er presst von vorne, gewinnt den Ball in gefährlichen Zonen zurück und joggt nicht zurück, wenn das Team den Ball verliert. Der defensive Aspekt ist für ihn keine Nebensache.",
      quote: "Er ist sofort für ein Probetraining verfügbar. Kein Vertrag nötig — eine Trainingseinheit reicht zur Beurteilung.",
    },
    strengths: {
      eyebrow: "Was Ich Mitbringe",
      heading: "Schlüsselstärken",
      items: [
        { title: "Abschluss", desc: "Klinisch vor dem Tor. Konstant unter Druck mit beiden Füßen — aus der Distanz und aus engen Winkeln." },
        { title: "Direktläufe", desc: "Aggressive Tiefenläufe hinter die Abwehrlinie. Nutzt Räume und fordert die Abseitsfalle heraus." },
        { title: "1-gegen-1 Angriff", desc: "Sicher im Duell mit Verteidigern durch Tempo und Technik. Nutzt Körpertäuschungen und scharfe Richtungswechsel." },
        { title: "Chancenkreation", desc: "Liest das Spiel, um gefährliche Situationen zu kreieren — durch individuelle Aktionen und Kombinationsspiel." },
        { title: "Defensives Engagement", desc: "Presst von vorne, läuft zurück wenn nötig. Trägt defensiv bei und gibt das Tempo für das Team vor." },
        { title: "Beidfüßig", desc: "Rechts 10/10 · Links 8/10. Gleich gefährlich von beiden Seiten — hält Verteidiger ständig im Ungewissen." },
      ],
    },
    snapshot: {
      eyebrow: "Spielerprofil",
      heading: "Auf einen Blick",
      labels: { position: "Position", age: "Alter", height: "Größe", weight: "Gewicht", nationality: "Nationalität", club: "Aktueller Verein", strongFoot: "Starker Fuß", weakFoot: "Schwacher Fuß" },
      values: { nationality: "Albanisch", strongFoot: "Rechts", weakFoot: "Links" },
    },
    why: {
      eyebrow: "Der Fall für Gerard",
      heading: "Warum Gerard einladen?",
      items: [
        { title: "Direktes Angriffsprofil", body: "Er greift mit Absicht an. Jeder Lauf, jede Entscheidung im letzten Drittel zeigt nach vorne — keine Zögerlichkeit wenn es darauf ankommt. Gibt ihm Raum zwischen den Linien und er bestraft es." },
        { title: "Beidfüßiger Abschluss", body: "Rechter Fuß ist seine Hauptwaffe (10/10). Linker Fuß schließt sauber in engen Räumen ab (8/10). Diese Kombination hält Verteidiger in Ungewissheit, wie es einfüßige Spieler schlicht nicht können." },
        { title: "Hungrig, sich zu beweisen", body: "Er ist 18, spielt auf U18-Niveau und weiß, was das bedeutet. Er fragt nicht nach einem Vertrag — er bittet um eine Trainingseinheit. Wenn es nicht passt, verliert der Verein nichts." },
      ],
      cta1: "Genug gesehen?",
      cta2: "Gebt ihm eine Session auf dem Platz.",
      ctaBtn: "Probetraining vereinbaren",
    },
    profile: {
      eyebrow: "Wer Er Ist",
      heading1: "Spieler",
      heading2: "Profil",
      p1: "Gerard Gani ist 18 Jahre alt, lebt in Berlin und spielt für SC Staaken. Er ist primär Stürmer, bei Bedarf auch Linksaußen — sein Spiel dreht sich um eines: in Abschlussposition zu kommen und Verteidigern Probleme zu bereiten.",
      p2: "Er ist beidfüßig. Rechter Fuß 10/10, linker Fuß 8/10. Er kann von beiden Seiten in engen Räumen abschließen, nach innen ziehen oder außen gehen und Verteidiger in jeder Situation beschäftigen.",
      p3: "Mit 187 cm und 78 kg ist er körperlich bereit für den Erwachsenenfußball. Er presst von vorne, gewinnt den Ball in gefährlichen Zonen zurück und joggt nicht zurück, wenn das Team den Ball verliert.",
      quote: "Sofort für ein Probetraining verfügbar. Kein Vertrag nötig — eine Trainingseinheit reicht zur Beurteilung.",
      statsEyebrow: "Auf einen Blick",
      careerEyebrow: "Karriereweg",
      careerHeading: "Vereinshistorie",
      labels: { position: "Position", age: "Alter", height: "Größe", weight: "Gewicht", nationality: "Nationalität", club: "Aktueller Verein", strongFoot: "Starker Fuß", weakFoot: "Schwacher Fuß" },
      values: { nationality: "Albanisch", strongFoot: "Rechts", weakFoot: "Links" },
    },
    heroReel: {
      eyebrow: "Beste Highlights",
      heading: "Den Reel ansehen",
      cta: "Alle Videos durchsuchen",
      noClips: "Clips folgen in Kürze",
      replay: "Erneut abspielen",
    },
    trial: {
      eyebrow: "Das Angebot",
      quote: '"Ich brauche nur eine Chance,\num mein Niveau zu zeigen."',
      sub: "Wenn es nicht passt, verliert der Verein nichts.",
      cta: "Gerard zum Probetraining einladen",
      facts: ["18 Jahre", "Aus Berlin", "Sofort verfügbar", "Keine Ablöse", "Beidfüßig"],
    },
    videos: {
      eyebrow: "Videothek",
      heading: "Spielmaterial",
      description: "Nach Kategorie durchsuchen. Clip antippen zum Öffnen. Wischen oder Pfeiltasten zum Wechseln.",
      requestLink: "Vollständige Spielaufnahmen anfragen",
      footerTitle: "Mehr Material vor der Entscheidung?",
      footerDesc: "Vollständige 90-Minuten-Spielaufnahmen, Trainingsclips und Standardsituationen sofort auf Anfrage verfügbar.",
      footerBtn: "Material anfragen",
      swipeHint: "Wischen zum Navigieren",
    },
    categories: {
      goals:    { label: "Abschluss",   title: "Tore",                      description: "Abschlüsse aus der Distanz, engen Winkeln und 1v1 mit dem Torwart." },
      assists:  { label: "Kreativität", title: "Vorlagen & Chancen",         description: "Kombinationsspiel, Steilpässe und kreierte Torchancen." },
      dribbling:{ label: "Technik",     title: "Dribbling & 1v1",           description: "Verteidiger überwinden, Tempo und Technik in engen Räumen." },
      pressing: { label: "Arbeitsrate", title: "Pressing & Defensivarbeit", description: "Pressingauslöser, Ballrückgewinne und defensiver Beitrag." },
    },
    contact: {
      eyebrow: "Kontakt aufnehmen",
      heading: "Kontakt",
      description: "Direkt Kontakt aufnehmen, um ein Probetraining zu vereinbaren, zusätzliches Material anzufordern oder jede Möglichkeit zu besprechen.",
      notes: { email: "Hauptkontakt — Antwort innerhalb von 24h", whatsapp: "Bevorzugt — schnellste Antwort", phone: "Anruf oder SMS", video: "Saison 2024/25" },
    },
    footer: {
      tagline: "Gerard Gani · Angreifer · SC Staaken · Berlin, Deutschland",
      verification: "Alle Angaben auf dieser Seite sind real und können auf Anfrage verifiziert werden.",
    },
    mobileCta: "Zum Probetraining einladen",
  },
};

export type Translations = typeof translations.en;

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
});

// ── localStorage subscription (useSyncExternalStore) ─────────────────────────
// Subscribing this way instead of useEffect+useState avoids the React 19
// set-state-in-effect warning and is tearing-safe under concurrent rendering.

const STORAGE_KEY = "gg-lang";
const LANG_CHANGE_EVENT = "gg-lang-change";

function subscribe(callback: () => void) {
  // `storage` only fires for OTHER tabs/windows. We dispatch our own event
  // for same-tab updates so every consumer re-renders together.
  window.addEventListener("storage", callback);
  window.addEventListener(LANG_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(LANG_CHANGE_EVENT, callback);
  };
}

function getSnapshot(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "de" ? "de" : "en";
}

function getServerSnapshot(): Lang {
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem(STORAGE_KEY, l);
    window.dispatchEvent(new Event(LANG_CHANGE_EVENT));
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
