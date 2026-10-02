import type { Metadata } from "next";
import { MotionHome } from "@/components/MotionHome";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return <MotionHome />;
}
