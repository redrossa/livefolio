import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import { SocialIcon } from 'react-social-icons/component';
import 'react-social-icons/github';
import './globals.css';
import Search from '@/components/Search';
import { Analytics, type AnalyticsProps } from '@vercel/analytics/next';
import Link from 'next/link';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Livefol.io',
  description: 'Forward test your Testfol.io strategy.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="p-8 flex justify-center min-h-screen">
          <main className="max-w-5xl w-full space-y-6 flex flex-col">
            <section className="space-y-2">
              <h1 className="text-4xl font-extrabold mt-16">Livefol.io</h1>
              <p>
                Forward test your{' '}
                <Link
                  href="https://testfol.io/tactical"
                  className="text-accent"
                >
                  Testfol.io
                </Link>{' '}
                strategy. Enter a link to a tactical allocation backtester.
              </p>
            </section>
            <Suspense fallback={<SearchSkeleton />}>
              <Search />
            </Suspense>
            {children}
            <Analytics
              mode={(process.env.MODE as AnalyticsProps['mode']) ?? 'auto'}
            />
            <footer className="text-sm text-foreground/60 flex items-center justify-between gap-4 py-8 mt-auto">
              <p>© 2025 Livefol.io</p>
              <div className="flex items-center gap-4">
                <SocialIcon
                  url="https://github.com/redrossa/livefolio"
                  bgColor="transparent"
                  fgColor="currentColor"
                />
              </div>
            </footer>
          </main>
        </div>
      </body>
    </html>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-2 max-w-md">
      <div className="flex items-center gap-4">
        <div className="h-10 flex-1 rounded-xs bg-foreground/10 animate-pulse" />
        <div className="h-10 w-24 rounded-xs bg-foreground/10 animate-pulse" />
      </div>
      <div className="h-4 w-32 rounded-xs bg-foreground/10 animate-pulse" />
    </div>
  );
}
