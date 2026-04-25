import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/redux/StoreProvider";
import InitUser from "@/initUser";
import Provider from "@/Provider";
import "leaflet/dist/leaflet.css";
import ThemeScript from "@/components/ThemeScript";
import ChatWidget from "@/components/ChatWidget";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RYDEX - Premium Vehicle Booking Platform",
  description: "RYDEX is a modern multi-vendor vehicle booking platform built for speed, security, and exceptional mobility experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased w-full min-h-screen`}
        suppressHydrationWarning
      >
        <Provider>
          <StoreProvider>
            <InitUser />
            <div className="premium-page-shell min-h-screen">{children}</div>
            <ChatWidget />
          </StoreProvider>
        </Provider>
      </body>
    </html>
  );
}
