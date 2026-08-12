import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import localFont from 'next/font/local';
import './globals.css';

// Fonts are self-hosted from public/fonts rather than fetched from Google at build
// time: the production image then builds with no outbound network beyond npm, and
// there is no third-party request on first paint.
const anton = localFont({
  src: '../public/fonts/anton-400.woff2',
  weight: '400',
  style: 'normal',
  display: 'swap',
  variable: '--font-anton',
  fallback: ['Arial Narrow', 'system-ui']
});

const archivo = localFont({
  src: '../public/fonts/archivo-var.woff2',
  weight: '400 700',
  style: 'normal',
  display: 'swap',
  variable: '--font-archivo',
  fallback: ['system-ui', 'sans-serif']
});

const jetbrains = localFont({
  src: '../public/fonts/jetbrains-mono-var.woff2',
  weight: '400 600',
  style: 'normal',
  display: 'swap',
  variable: '--font-mono-face',
  fallback: ['ui-monospace', 'monospace']
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aisucks.qcguy.com';

const DESCRIPTION =
  'Rent a motorcycle from someone who owns one, or earn from yours while it sits idle. ' +
  'Insurance, licence checks and the rental agreement are handled on every trip.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'Kickstand',
  title: {
    default: 'Kickstand — motorcycle rental, owner to rider',
    template: '%s · Kickstand'
  },
  description: DESCRIPTION,
  keywords: [
    'motorcycle rental',
    'motorbike hire',
    'peer to peer motorcycle',
    'rent my motorcycle',
    'motorcycle insurance included',
    'UK bike hire'
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Kickstand',
    title: 'Kickstand — motorcycle rental, owner to rider',
    description: DESCRIPTION
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kickstand — motorcycle rental, owner to rider',
    description: DESCRIPTION
  },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  themeColor: '#0a0b0c',
  colorScheme: 'dark'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB" className={`${anton.variable} ${archivo.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
