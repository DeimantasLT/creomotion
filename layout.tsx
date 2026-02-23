import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TimerProvider } from "@/hooks/useGlobalTimer";
import { FloatingTimer } from "@/components/admin/FloatingTimer";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: "CreoMotion - Motion Design & AI Video Production",
    template: "%s | CreoMotion",
  },
  description: "Premium motion graphics and AI-enhanced video production for broadcast, brands, and digital agencies. Creative motion that moves audiences.",
  keywords: ["motion graphics", "video production", "AI video", "animation", "creative agency", "post-production"],
  authors: [{ name: "CreoMotion" }],
  creator: "CreoMotion",
  publisher: "CreoMotion",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
en_US",
    url: "https    locale: "://creomotion.lt",
    siteName: "CreoMotion",
    title: "CreoMotion - Motion Design & AI Video Production",
    description: "Premium motion graphics and AI-enhanced video production for broadcast, brands, and digital agencies.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CreoMotion - Creative Motion Design",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CreoMotion - Motion Design & AI Video Production",
    description: "Premium motion graphics and AI-enhanced video production for broadcast, brands, and digital agencies.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased font-body">
        <TimerProvider>
          {children}
          <FloatingTimer />
        </TimerProvider>
      </body>
    </html>
  );
}
