import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HeroReel from "@/components/HeroReel";
import PlayerProfile from "@/components/PlayerProfile";
import WhyInvite from "@/components/WhyInvite";
import Strengths from "@/components/Strengths";
import VideoLibrary from "@/components/VideoLibrary";
import TrialRequest from "@/components/TrialRequest";
import Contact from "@/components/Contact";
import FootageCTA from "@/components/FootageCTA";
import Footer from "@/components/Footer";
import MobileCTA from "@/components/MobileCTA";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HeroReel />
        <PlayerProfile />
        <WhyInvite />
        <Strengths />
        <VideoLibrary />
        <TrialRequest />
        <Contact />
        <FootageCTA />
      </main>
      <Footer />
      <MobileCTA />
    </>
  );
}
