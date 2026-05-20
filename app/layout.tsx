import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

const barlow = Barlow_Condensed({
  weight: ["400", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-barlow",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gerard Gani – Attacking Player | ST / LW | Berlin",
  description:
    "18-year-old striker and left winger from SC Staaken U18, Berlin. Two-footed attacking player available for trials. Direct, goal-oriented, strong finishing.",
  keywords: [
    "Gerard Gani",
    "footballer",
    "attacking player",
    "striker",
    "left winger",
    "Berlin",
    "trial",
    "SC Staaken",
    "Albanian footballer",
    "U18 Berlin",
    "Fussball Probespieler",
  ],
  openGraph: {
    title: "Gerard Gani – Attacking Player | Berlin",
    description:
      "18-year-old striker / left winger from SC Staaken U18. Two-footed, direct, goal-oriented. Available for trial.",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gerard Gani – Attacking Player | Berlin",
    description:
      "18-year-old striker / LW. SC Staaken U18. Available for trial.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${barlow.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
