import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";

// Heading font - DM Serif Display for the historic IU gate feel
const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

// Body/UI font - Inter for maximum legibility
const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CampuSphere - İstanbul Üniversitesi Ağı",
  description: "İstanbul Üniversitesi için dijital kampüs haritası ve bağlantı platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${dmSerifDisplay.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
