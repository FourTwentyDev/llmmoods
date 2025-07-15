import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { CookieConsent } from "@/components/CookieConsent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LLM Mood Tracker - How's Your AI Feeling Today?",
  description: "Track and compare the daily performance of popular AI language models. Community-driven ratings for GPT-4, Claude, Gemini, and more.",
  keywords: "LLM, AI, GPT-4, Claude, Gemini, performance tracking, AI mood, language models, AI comparison, model benchmarks",
  authors: [{ name: "LLM Mood Tracker" }],
  openGraph: {
    title: "LLM Mood Tracker - How's Your AI Feeling Today?",
    description: "Track and compare the daily performance of popular AI language models",
    type: "website",
    url: "https://llmmood.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LLM Mood Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LLM Mood Tracker",
    description: "Track and compare the daily performance of popular AI language models",
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
  alternates: {
    canonical: "https://llmmood.com",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://llmmood.com" />
        <link rel="icon" href="/logo.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        {children}
        <footer className="mt-auto border-t border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500">
                © 2024 LLM Mood Tracker. All rights reserved.
              </p>
              <p className="text-xs text-gray-400">
                Crafted with ❤️ by{' '}
                <a 
                  href="https://fourtwenty.dev" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-gray-600 transition-colors"
                >
                  FourTwenty Development
                </a>
              </p>
            </div>
          </div>
        </footer>
        {measurementId && <GoogleAnalytics measurementId={measurementId} />}
        <CookieConsent />
      </body>
    </html>
  );
}
