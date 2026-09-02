import { Contact } from "@/components/Contact";
import { DigitalServices } from "@/components/DigitalServices";
import { Footer } from "@/components/Footer";
import { GroupBrandStrip } from "@/components/GroupBrandStrip";
import { GroupIntro } from "@/components/GroupIntro";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Principles } from "@/components/Principles";
import { SelectedWork } from "@/components/SelectedWork";
import { Ventures } from "@/components/Ventures";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <GroupIntro />
        <Ventures />
        <DigitalServices />
        <Principles />
        <SelectedWork />
        <GroupBrandStrip />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
