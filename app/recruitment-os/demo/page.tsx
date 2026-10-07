import type { Metadata } from "next";
import { RecruitmentDemo } from "@/components/recruitment/AppShell";
import "@/components/recruitment/recruitment.css";
export const metadata: Metadata = {
  title: "Recruitment OS — Interactive Demo | Anthēon",
  description:
    "Interactive construction recruitment product demonstration. Fictional workforce, simulated messaging and local browser state only.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/recruitment-os/demo" },
  openGraph: {
    title: "Recruitment OS — Interactive Demo | Anthēon",
    description:
      "Explore a complete construction recruitment workspace. Demo data only.",
    url: "/recruitment-os/demo",
  },
};
export default function DemoPage() {
  return <RecruitmentDemo />;
}
