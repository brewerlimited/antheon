import { MotionHome } from "@/components/MotionHome";
import { IntroExperience } from "@/components/intro/IntroExperience";
import { JsonLd } from "@/components/public-content/JsonLd";
import { organisationGraph } from "@/lib/public-seo/structured-data";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata = pageMetadata({ title: "Anthēon — Ventures, Digital Products & Web Design", description: "Independent thinking. Distinctive businesses, digital products and website design. Explore the ventures and digital work of Anthēon Group, Buckinghamshire, UK.", path: "/" });

export default function Home() {
  return <><IntroExperience><MotionHome /></IntroExperience><JsonLd data={organisationGraph()} /></>;
}
