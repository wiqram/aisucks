import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Fraunces, Instrument_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

// Display: a high-contrast, optical-sized serif for editorial headlines.
const display = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '900'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap'
});

// Body: a warm, characterful grotesque — readable but not "Inter-generic".
const body = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap'
});

// Labels / eyebrows / prices: monospace for that spec-sheet, darkroom-label feel.
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap'
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aisucks.predictonomy.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'Silver & Signal',
  title: {
    default: 'Silver & Signal — Photography Studio',
    template: '%s · Silver & Signal'
  },
  description:
    'A photography studio with a split soul. Silver: hand-made film & portraiture. Signal: AI-assisted and drone imaging. Same eye. Two tempos. Two prices.',
  keywords: [
    'photography studio',
    'film photography',
    'portrait photography',
    'drone photography',
    'AI photography',
    'aerial photography',
    'wedding photography'
  ],
  authors: [{ name: 'Silver & Signal' }],
  openGraph: {
    type: 'website',
    title: 'Silver & Signal — Photography Studio',
    description:
      'Two ways to hold the light. Hand-made film & portraiture, or fast, affordable AI + drone imaging.',
    siteName: 'Silver & Signal'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Silver & Signal — Photography Studio',
    description: 'Two ways to hold the light. Film & portraiture, or AI + drone imaging.'
  }
};

export const viewport: Viewport = {
  themeColor: '#0b0a09',
  colorScheme: 'dark'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
