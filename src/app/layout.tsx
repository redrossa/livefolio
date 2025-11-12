import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import 'react-social-icons/github';
import './globals.css';
import { Analytics, type AnalyticsProps } from '@vercel/analytics/next';
import ThemeProvider from '@/components/ThemeProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="p-4 md:p-8 flex justify-center min-h-screen">
            <main className="max-w-5xl w-full flex flex-col space-y-8">
              <Header />
              {children}
              <Analytics
                mode={(process.env.MODE as AnalyticsProps['mode']) ?? 'auto'}
              />
              <Footer />
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
