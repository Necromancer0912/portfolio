import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/chrome";

// The same pairing as the reference: Geist for everything read,
// Geist Mono for labels, numbers and buttons.
const sans = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Sayan Das — models that listen, packets that arrive",
  description:
    "M.Tech CSE student at IIIT Delhi. Speech and language models, network protocols and retrieval systems.",
  openGraph: {
    title: "Sayan Das — models that listen, packets that arrive",
    description: "Speech and language models, network protocols, retrieval systems.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <noscript>
          <style>{`[data-hero] .hero-in,.reveal,.mask>span,.pill{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
