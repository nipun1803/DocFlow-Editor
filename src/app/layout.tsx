import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata:  Metadata = {
  title:  'Document Editor - Tiptap Pagination',
  description: 'A document editor with real-time pagination',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter. className}>{children}</body>
    </html>
  );
}