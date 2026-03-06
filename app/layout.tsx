import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { Suspense } from "react";
import ClientProviders from "@/components/ClientProviders";
import FirebaseAuthProvider from "@/components/FirebaseAuthProvider";
import Provider from "@/components/Provider";
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import { ModalProvider } from "@/components/providers/modal-provider";
import Clarity from "@/components/Clarity";
import MetaPix from "@/components/MetaPix";

let title = "CasaVid - Turn Property Photos into Walkthrough Videos";
let ogimage = 'https://www.casavid.com/ogimage1.png';
let description = "Upload photos of any property and get a professional walkthrough video with AI narration and subtitles. Perfect for real estate agents and property listings.";
let url = 'https://www.casavid.com';
let sitename = 'casavid.com';

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: url,
    siteName: sitename,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: [ogimage],
    title,
    description,
  },
};

export default function RootLayout({ children }: any) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Clarity />
      </head>
      <body className="flex flex-col min-h-screen bg-white" suppressHydrationWarning>
        <ClientProviders>
          <Provider>
            <FirebaseAuthProvider>
              <MetaPix />
              <section className="sticky top-0 z-50 bg-white border-b border-gray-100">
                <Suspense fallback={<div className="flex w-full px-4 lg:px-8 py-3 items-center justify-between h-[60px]" />}>
                  <Navbar />
                </Suspense>
              </section>
              <main className="flex flex-col flex-grow">
                <ModalProvider />
                {children}
              </main>
              <Footer />
              <Toaster />
            </FirebaseAuthProvider>
          </Provider>
        </ClientProviders>
        <Analytics />
      </body>
    </html>
  );
}
