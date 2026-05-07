import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Deploy Trigger: 2026-05-06 - Final Fix
import { Navbar } from "@/components/layout/Navbar";
import { CoachFAB } from "@/components/layout/CoachFAB";
import { SplashScreen } from "@/components/layout/SplashScreen";
import { ThemeProvider } from "@/components/ThemeProvider";
import { GlobalBackground } from "@/components/layout/GlobalBackground";

const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "Resilience Agent | AI Financial Companion",
  description: "Secure your financial future with AI-powered resilience agents.",
  appleWebApp: {
    title: "Resilience",
    statusBarStyle: "default",
    capable: true,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#A855F7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground min-h-screen selection:bg-primary/30`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <GlobalBackground />
          <main className="min-h-screen">
            <SplashScreen />
            {children}
          </main>
          <CoachFAB />
          <Navbar />
        </ThemeProvider>
      </body>
    </html>
  );
}

