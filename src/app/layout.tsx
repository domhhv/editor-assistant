import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from 'next-themes';
import { Ubuntu, Montserrat } from 'next/font/google';

import './globals.css';
import type { ReactNode } from 'react';

import ApiKeyProvider from '@/components/providers/api-key-provider';
import Toaster from '@/components/ui/sonner';

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  width: 'device-width',
};

const ubuntu = Ubuntu({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-ubuntu',
  weight: ['300', '400', '500', '700'],
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  description: 'LLM-powered rich text editor',
  title: 'Rich Text Editor',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              #app-loading {
                position: fixed;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                background: oklch(1 0 0);
              }
              @media (prefers-color-scheme: dark) {
                #app-loading {
                  background: oklch(0.129 0.042 264.695);
                }
              }
              #app-loading-spinner {
                width: 2rem;
                height: 2rem;
                color: oklch(0.554 0.046 257.417);
                animation: spin 1s linear infinite;
              }
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `,
          }}
        />
      </head>
      <body
        className={`${ubuntu.variable} ${montserrat.className} ${montserrat.variable} antialiased`}
      >
        <div id="app-loading">
          <svg
            fill="none"
            viewBox="0 0 24 24"
            id="app-loading-spinner"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              r="10"
              cx="12"
              cy="12"
              opacity="0.25"
              strokeWidth="4"
              stroke="currentColor"
            />
            <path
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <ThemeProvider
          enableSystem
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
        >
          <ApiKeyProvider>
            <main className="bg-background h-dvh">{children}</main>
            <Analytics />
            <SpeedInsights />
            <Toaster richColors duration={10_000} />
          </ApiKeyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
