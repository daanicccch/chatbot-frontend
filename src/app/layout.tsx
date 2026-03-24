import type { Metadata } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";
import Script from "next/script";

import { AppProviders } from "@/client/providers/app-providers";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GPT Chatbot",
  description: "ChatGPT-style chatbot demo with streaming, auth, uploads, and document context.",
};

const themeScript = `
(() => {
  const storageKey = "gpt-chatbot-theme";
  const stored = window.localStorage.getItem(storageKey);
  const theme =
    stored === "light" || stored === "dark"
      ? stored
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

  document.documentElement.dataset.theme = theme;
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--app-bg)] font-sans text-[var(--app-text)]">
        <Script id="theme-script" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
