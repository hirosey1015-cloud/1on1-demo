import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from './Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '1on1 Navigator',
  description: '1on1支援ツール — マネージャーの1on1をサポートします',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Navigation />
        <main className="min-h-screen bg-gray-50 pb-20">{children}</main>
      </body>
    </html>
  );
}
