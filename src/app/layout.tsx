import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Geist } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { TRPCReactProvider } from "@/trpc/client";

import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Condensed signage lettering for titles and numerals: the "marquee" in Marquee.
const bigShoulders = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  axes: ["opsz"],
  // Fall back to a condensed system face rather than the default (regular-width
  // Arial), so headlines keep roughly the same line breaks if the font is late.
  fallback: ["Arial Narrow", "Helvetica Neue", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: "Marquee: trending movies today",
    template: "%s · Marquee",
  },
  description:
    "See which movies are trending today, what's in theaters and what's coming soon. Look up any film and keep a watchlist.",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0c0d11",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "dark h-full antialiased",
        geist.variable,
        bigShoulders.variable,
      )}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#content"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-primary focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:text-primary-foreground"
        >
          Skip to content
        </a>
        <TRPCReactProvider>
          <SiteHeader />
          <main id="content" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </TRPCReactProvider>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
