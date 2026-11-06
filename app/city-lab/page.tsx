import type { Metadata } from "next";
import { CityLab } from "@/components/city-lab/CityLab";

export const metadata: Metadata = {
  title: "Possibility Avenue — Anthēon City Study",
  description: "From the first character to a world of possibility. An interactive Anthēon city study.",
  robots: { index: false, follow: false },
};

export default function CityLabPage() { return <CityLab />; }
