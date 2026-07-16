import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Hanken_Grotesk, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const sans = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap'
});

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap'
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap'
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aisucks.predictonomy.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'Entity Data Control Tower',
  title: {
    default: 'Entity Data · Control Tower',
    template: '%s · Control Tower'
  },
  description:
    'Entity Data Control Tower — global hardware delivery visibility (Transit) and a self-serve Salesforce reporting workbench (Prism), in one console.',
  robots: { index: false, follow: false } // internal tooling
};

export const viewport: Viewport = {
  themeColor: '#f6f6f4',
  colorScheme: 'light'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
