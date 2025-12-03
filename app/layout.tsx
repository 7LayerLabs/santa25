import type { Metadata } from "next";
import { Mountains_of_Christmas, Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const christmasFont = Mountains_of_Christmas({
  weight: ["400", "700"],
  variable: "--font-christmas",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Secret Santa - Pick Your Name!",
  description: "A festive Secret Santa name drawing app for your holiday party",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${christmasFont.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
