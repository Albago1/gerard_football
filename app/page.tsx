import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HeroReel from "@/components/HeroReel";
import PlayerSnapshot from "@/components/PlayerSnapshot";
import About from "@/components/About";
import WhyInvite from "@/components/WhyInvite";
import Strengths from "@/components/Strengths";
import VideoLibrary from "@/components/VideoLibrary";
import TrialRequest from "@/components/TrialRequest";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import MobileCTA from "@/components/MobileCTA";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HeroReel />
        <PlayerSnapshot />
        <About />
        <WhyInvite />
        <Strengths />
        <VideoLibrary />
        <TrialRequest />
        <Contact />
      </main>
      <Footer />
      <MobileCTA />
    </>
  );
}
