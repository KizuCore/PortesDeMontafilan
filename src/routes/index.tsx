import { AirbnbCalendar } from "@/components/home/AirbnbCalendar";
import { Amenities } from "@/components/home/Amenities";
import { Contact } from "@/components/home/Contact";
import { Faq } from "@/components/home/Faq";
import { Footer } from "@/components/home/Footer";
import { Gallery } from "@/components/home/Gallery";
import { Hero } from "@/components/home/Hero";
import { Intro } from "@/components/home/Intro";
import { MobileReserveButton } from "@/components/home/MobileReserveButton";
import { Nav } from "@/components/home/Nav";
import { Region } from "@/components/home/Region";
import { Reviews } from "@/components/home/Reviews";
import { Spaces } from "@/components/home/Spaces";
import { WhyHere } from "@/components/home/WhyHere";

export function Home() {
  return (
    <main className="bg-background pb-24 text-foreground sm:pb-0">
      <Nav />
      <Hero />
      <Intro />
      <Spaces />
      <Amenities />
      <Gallery />
      <Region />
      <WhyHere />
      <Reviews />
      <AirbnbCalendar />
      <Faq />
      <Contact />
      <Footer />
      <MobileReserveButton />
    </main>
  );
}
