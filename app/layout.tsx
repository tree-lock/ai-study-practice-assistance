import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SWRProvider } from "@/components/swr-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import AppLayout from "./app-layout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI 智能刷题助手",
  description: "基于 Bun + Next.js 的 AI 刷题与复习平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SWRProvider>
            <AppLayout>{children}</AppLayout>
            <Toaster richColors position="top-center" />
          </SWRProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
