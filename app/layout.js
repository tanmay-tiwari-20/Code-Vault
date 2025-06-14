import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CodeVault – Your GitHub Portfolio, Reimagined",
  description:
    "CodeVault is a modern and animated portfolio web app that fetches your GitHub repositories in real-time, visualizes language stats, and lets you filter, explore, and showcase your work beautifully.",
  keywords: [
    "GitHub portfolio",
    "developer portfolio",
    "code showcase",
    "GitHub API",
    "React portfolio",
    "Next.js project",
    "CodeVault",
    "open source projects",
  ],
  authors: [{ name: "Tanmay Tiwari", url: "https://github.com/tanmay-tiwari-20" }],
  creator: "Tanmay Tiwari",
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL("https://codevault.vercel.app"),
  openGraph: {
    title: "CodeVault – Your GitHub Portfolio, Reimagined",
    description:
      "Discover your best repositories with CodeVault. Beautifully designed, animated, and powered by GitHub's API.",
    url: "https://codevault.vercel.app",
    siteName: "CodeVault",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeVault – GitHub Portfolio for Developers",
    description:
      "Showcase your code beautifully with a live GitHub-powered portfolio.",
    creator: "@takneekitanmay",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
