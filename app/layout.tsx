import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { MoneyProvider } from "@/context/MoneyContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });

import Script from "next/script";

export const metadata: Metadata = {
  title: "MoneySense — Make money make sense",
  description: "A simpler way to explore, spend, grow and decide with your money."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className="dark scroll-smooth">
      <head>
        <Script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${inter.variable} ${jakarta.variable} bg-[#070B14] text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950`}>
        <MoneyProvider>{children}</MoneyProvider>
      </body>
    </html>
  );
}
