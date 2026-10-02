import type { Metadata } from "next";
import type { Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geist = localFont({
  src: "../public/fonts/geist-latin.woff2",
  variable: "--font-geist",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://antheon.co.uk"),
  title: "Anthēon — Ideas into what’s next",
  description:
    "Anthēon Group is an independent UK venture and digital development group building businesses, digital products and selected web experiences for ambitious companies.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Anthēon Group | Ventures, Digital Products & Web Design",
    description:
      "Anthēon Group is an independent UK venture and digital development group building businesses, digital products and selected web experiences for ambitious companies.",
    url: "https://antheon.co.uk",
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
    <html lang="en" data-scroll-behavior="smooth">
      <body className={geist.variable}>
        {children}
      </body>
    </html>
  );
}
