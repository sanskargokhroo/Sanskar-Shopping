import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "react-hot-toast";
import LayoutWrapper from "@/components/LayoutWrapper";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Sanskar Shopping | Premium Deals",
  description: "Discover the best shopping deals, handpicked for you. Modern, fast, and secure.",
  icons: {
    icon: '/app-logo-v1.png',
    shortcut: '/app-logo-v1.png',
    apple: '/app-logo-v1.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/app-logo-v1.png" sizes="any" />
      </head>
      <body className={`${outfit.variable} font-sans min-h-screen flex flex-col`}>
        <AuthProvider>
          <ThemeProvider>
            <Toaster position="bottom-right" />
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
