import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { Providers } from "./providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "SoulCars.pk — Collector Cars, Carefully Curated",
  description: "Pakistan's marketplace for rare, vintage and collector automobiles.",
  openGraph: {
    title: "SoulCars.pk",
    description: "Find the car you were meant to drive.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Serif+Display&display=swap"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
      {/* Google Analytics — stays dormant until NEXT_PUBLIC_GA_ID is set in the env */}
      {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
    </html>
  );
}
