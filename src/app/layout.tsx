import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/TopNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Greenhouse IoT Dashboard",
  description: "Real-time monitoring, intelligent automation, and crop analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <TopNav />
        <main className="flex-1 p-6 md:p-8 bg-background/50 overflow-y-auto">
          {children}
        </main>
        <footer className="border-t border-border/60 bg-card py-6 text-center text-xs text-muted-foreground font-semibold">
          <p>© 2026 Smart Greenhouse IoT Portal • CC BY-NC 4.0 License</p>
        </footer>
      </body>
    </html>
  );
}
