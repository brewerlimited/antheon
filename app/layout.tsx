import type { Metadata } from "next";
import type { Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://antheon.co.uk"),
  title: "Anthēon Group | Ventures, Digital Products & Web Design",
  description:
    "Anthēon Group is an independent UK venture and digital development group building businesses, digital products and selected web experiences for ambitious companies.",
  alternates: {
    canonical: "/",
  },
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
