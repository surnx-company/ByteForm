import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://byteform.io";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ByteForm — Forms your users actually want to fill",
    template: "%s · ByteForm",
  },
  description:
    "ByteForm turns data collection into something people enjoy. Conversational, beautiful, and built for completion rates that speak for themselves.",
  keywords: [
    "form builder",
    "conversational forms",
    "typeform alternative",
    "online forms",
    "survey builder",
    "form analytics",
  ],
  authors: [{ name: "ByteForm" }],
  creator: "ByteForm",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "ByteForm",
    title: "ByteForm — Forms your users actually want to fill",
    description:
      "ByteForm turns data collection into something people enjoy. Conversational, beautiful, and built for completion rates that speak for themselves.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ByteForm — Forms your users actually want to fill",
    description:
      "ByteForm turns data collection into something people enjoy. Conversational, beautiful, and built for completion rates that speak for themselves.",
    creator: "@byteform",
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
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
