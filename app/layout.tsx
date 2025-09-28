import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { SimpleFooter } from "@/components/simple-footer";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lovelock - Unlock Hidden Secrets About Yourself and Others",
  description:
    "Discover personality patterns, predict behavior, and master the art of reading people using ancient numerology and modern psychology.",
  keywords: [
    "personality",
    "numerology",
    "astrology",
    "self-discovery",
    "character analysis",
    "psychology",
    "mind reading",
    "prediction",
    "life insights",
  ],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Lovelock - Unlock Hidden Secrets",
    description:
      "Discover personality patterns, predict behavior, and master the art of reading people using ancient numerology and modern psychology.",
    type: "website",
    url: "https://lovelock.it.com",
    images: [
      {
        url: "https://lovelock.it.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Lovelock - Unlock Hidden Secrets",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lovelock - Unlock Hidden Secrets",
    description:
      "Discover personality patterns, predict behavior, and master the art of reading people.",
    images: ["https://lovelock.it.com/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <html lang="en" className="dark">
        <body
          className={`${inter.className} cosmic-bg min-h-screen flex flex-col`}
        >
          <main className="flex-1">{children}</main>
          <SimpleFooter />
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
