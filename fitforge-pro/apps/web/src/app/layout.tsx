import type { Metadata, Viewport } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FitForge Pro | Premium Gym & Fitness Center",
    template: "%s | FitForge Pro",
  },
  description:
    "FitForge Pro — India's most premium gym and fitness center. Expert trainers, cutting-edge equipment, personalized plans, and a community that pushes you further.",
  keywords: [
    "gym",
    "fitness center",
    "personal training",
    "workout plans",
    "diet plans",
    "membership",
    "FitForge Pro",
    "premium gym",
  ],
  authors: [{ name: "FitForge Pro" }],
  creator: "FitForge Pro",
  publisher: "FitForge Pro",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://fitforgepro.in"
  ),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    title: "FitForge Pro | Premium Gym & Fitness Center",
    description:
      "India's most premium gym. Expert trainers, cutting-edge equipment, personalized plans.",
    siteName: "FitForge Pro",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "FitForge Pro - Premium Gym",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FitForge Pro | Premium Gym & Fitness Center",
    description:
      "India's most premium gym. Expert trainers, cutting-edge equipment, personalized plans.",
    images: ["/og-image.jpg"],
    creator: "@fitforgepro",
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0F" },
    { media: "(prefers-color-scheme: light)", color: "#F5A623" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable} ${jetbrains.variable}`}
    >
      <head>
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "@id": "https://fitforgepro.in/#organization",
              name: "FitForge Pro",
              alternateName: "FitForge Pro Gym",
              description:
                "India's most premium gym and fitness center with expert trainers and cutting-edge equipment.",
              url: "https://fitforgepro.in",
              logo: "https://fitforgepro.in/logo.png",
              telephone: "+91-9876543210",
              email: "info@fitforgepro.in",
              address: {
                "@type": "PostalAddress",
                streetAddress: "123 Fitness Boulevard",
                addressLocality: "Mumbai",
                addressRegion: "Maharashtra",
                postalCode: "400001",
                addressCountry: "IN",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 19.0760,
                longitude: 72.8777,
              },
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  opens: "05:00",
                  closes: "23:00",
                },
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Saturday", "Sunday"],
                  opens: "06:00",
                  closes: "22:00",
                },
              ],
              priceRange: "₹₹₹",
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                reviewCount: "847",
              },
            }),
          }}
        />
      </head>
      <body className="bg-dark text-white font-sans antialiased overflow-x-hidden">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "rgba(26, 26, 36, 0.95)",
                border: "1px solid rgba(245, 166, 35, 0.2)",
                color: "#fff",
                backdropFilter: "blur(20px)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
