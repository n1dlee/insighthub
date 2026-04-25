import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// DM Sans — Premium, modern PaaS typography
const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default:  "InsightHub — Student-Investor Networking Platform",
    template: "%s | InsightHub",
  },
  description:
    "Connect talented students from Central Asia with global investors and mentors. Discover opportunities, build your profile, and grow your network.",
  keywords:   ["education", "networking", "investors", "students", "mentorship", "uzbekistan"],
  authors:    [{ name: "InsightHub" }],
  openGraph: {
    type:        "website",
    title:       "InsightHub",
    description: "Student-Investor Networking Platform",
    siteName:    "InsightHub",
  },
  robots: {
    index:  true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width:         "device-width",
  initialScale:  1,
  themeColor:    "#6366F1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} h-full antialiased`} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
