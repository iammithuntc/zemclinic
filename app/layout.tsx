import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

import dbConnect from "@/lib/mongodb";
import Settings from "@/models/Settings";

export async function generateMetadata(): Promise<Metadata> {
  try {
    await dbConnect();
    // Set a timeout of 2000ms for the DB query to prevent build hangs
    const settings = await Settings.findOne().maxTimeMS(2000).select('systemTitle systemDescription favicon');

    const systemTitle = settings?.systemTitle || "AI Doctor";
    const systemDescription = settings?.systemDescription || "Comprehensive AI-powered practice management software for healthcare professionals";
    const favicon = settings?.favicon || "/favicon.ico";

    return {
      title: {
        template: `%s | ${systemTitle}`,
        default: `${systemTitle} - Practice Management System`,
      },
      description: systemDescription,
      icons: {
        icon: favicon,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    // Return default metadata on error
    return {
      title: {
        template: `%s | AI Doctor`,
        default: `AI Doctor - Practice Management System`,
      },
      description: "Comprehensive AI-powered practice management software for healthcare professionals",
      icons: {
        icon: "/favicon.ico",
      },
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
