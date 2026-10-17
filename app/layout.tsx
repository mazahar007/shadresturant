import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import Shell from '@/components/Shell';

export const metadata: Metadata = {
  title: 'আল-মদিনা ফুড - POS',
  description: 'ফুড শপ POS: বিক্রি, খরচ, স্টক, বাকি খাতা, লাভ-লোকসান',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#f8fafc] text-slate-800 antialiased">
        <Shell>
          <Suspense fallback={<div className="text-center py-16 text-slate-400">লোড হচ্ছে…</div>}>
            {children}
          </Suspense>
        </Shell>
      </body>
    </html>
  );
}
