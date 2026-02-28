import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel"
});

export const metadata: Metadata = {
  title: "Shot O'Clock",
  description: "A 5-hour random marathon generator.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${pressStart2P.variable} antialiased  bg-[linear-gradient(rgba(255,0,127,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,127,0.05)_1px,transparent_1px)] bg-[length:20px_20px] min-h-screen flex items-center justify-center`}
      >
        {children}
      </body>
    </html>
  );
}
