import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";
import { ModeToggle } from "@/components/model-toggle";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "MadeThisToLift", template: "%s | MadeThisToLift" },
  description:
    "Track workouts in Notion and visualize progress with powerful insights",
  icons: {
    icon: "/favicon.ico",
  },
};

import { Toaster } from "@/components/ui/sonner";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { ReactQueryClientProvider } from "@/components/react-query-client-provider";
import { TransitionLink } from "@/components/transition-link";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryClientProvider>
          <ThemeProvider
            attribute={"class"}
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between w-full py-5 md:px-0 px-2">
                <TransitionLink href={"/"} className="text-3xl font-semibold">
                  📊 MadeThisToLift
                </TransitionLink>
                <ModeToggle />
              </div>
              <div>{children}</div>
            </main>
          </ThemeProvider>
        </ReactQueryClientProvider>
        <Toaster />

        <div>
          <footer className="mt-10 row-start-3 flex gap-[24px] flex-wrap items-center justify-center pb-10">
            <a
              href="https://vivek.ink"
              className="text-white hover:text-gray-200 transition-colors duration-200 underline underline-offset-2"
            >
              vivek.ink
            </a>

            <a
              href="https://github.com/vivekascoder"
              className="text-white hover:text-gray-200 transition-colors duration-200 underline underline-offset-2"
            >
              github
            </a>
            <TransitionLink
              href="/setup"
              className="text-white hover:text-gray-200 transition-colors duration-200 underline underline-offset-2"
            >
              setup
            </TransitionLink>
          </footer>
        </div>
      </body>
    </html>
  );
}
