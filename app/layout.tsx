import type { Metadata } from "next";
import type { Viewport } from "next";
import localFont from "next/font/local";
import { PublicMeasurement } from "@/components/measurement/PublicMeasurement";
import { IntroBootstrap } from "@/components/intro/IntroBootstrap";
import "./globals.css";

const geist = localFont({
  src: "../public/fonts/geist-latin.woff2",
  variable: "--font-geist",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.antheon.co.uk"),
  title: "Anthēon — Ideas into what’s next",
  description:
    "Anthēon Group is an independent UK venture and digital development group building businesses, digital products and selected web experiences for ambitious companies.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Anthēon Group | Ventures, Digital Products & Web Design",
    description:
      "Anthēon Group is an independent UK venture and digital development group building businesses, digital products and selected web experiences for ambitious companies.",
    url: "https://www.antheon.co.uk",
    siteName: "Anthēon Group",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Anthēon Group social preview.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anthēon Group | Ventures, Digital Products & Web Design",
    description:
      "Anthēon Group is an independent UK venture and digital development group building businesses, digital products and selected web experiences for ambitious companies.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head><IntroBootstrap /></head>
      <body className={geist.variable}>
        {children}
        <PublicMeasurement enabled={process.env.SITE_ANALYTICS_ENABLED === "true" && (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production")} measurementId={process.env.GA4_MEASUREMENT_ID || ""} enhancedMeasurementDisabled={process.env.GA4_ENHANCED_MEASUREMENT_DISABLED === "true"} />
      </body>
    </html>
  );
}
