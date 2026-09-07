import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "TuneBit — Daily Music Gauntlet",
    template: "%s | TuneBit",
  },
  description:
    "Identify the song from progressively longer audio clips. A new gauntlet every day.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://tunebit.zeusserver.in"
  ),
  openGraph: {
    title: "TuneBit — Daily Music Guessing Game",
    description: "Identify the song from progressively longer audio clips.",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://tunebit.zeusserver.in",
    siteName: "TuneBit",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "TuneBit — Daily Music Guessing Game",
    description: "Identify the song from progressively longer audio clips.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1e" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-1 flex flex-col justify-center items-center w-full max-w-[1400px] mx-auto px-4 py-6 pb-24 sm:pb-8">
            <div className="w-full">
              {children}
            </div>
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
