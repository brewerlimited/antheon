import type { Metadata } from "next";
import { MotionHome } from "@/components/MotionHome";
import { IntroExperience } from "@/components/intro/IntroExperience";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return <IntroExperience><MotionHome /></IntroExperience>;
}
