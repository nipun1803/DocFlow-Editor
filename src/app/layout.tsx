import type { Metadata } from 'next';
import { Inter, Roboto, Open_Sans, Lato, Montserrat, Poppins } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const roboto = Roboto({ weight: ['400', '500', '700'], subsets: ['latin'], variable: '--font-roboto' });
const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-opensans' });
const lato = Lato({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-lato' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });
const poppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-poppins' });

export const metadata: Metadata = {
  title: 'Document Editor - Tiptap Pagination',
  description: 'A document editor with real-time pagination',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${roboto.variable} ${openSans.variable} ${lato.variable} ${montserrat.variable} ${poppins.variable}`}>
        {children}
      </body>
    </html>
  );
}