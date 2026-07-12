import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { fraunces, nunito } from './fonts';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aisucks.predictonomy.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'Kaya Yoga',
  title: 'Kaya Yoga — yoga for everyday life, with Kehmo Nagdev',
  description:
    'Kaya Yoga with Kehmo Nagdev — a grounded, beginner-friendly yoga practice built for real, busy lives. Discover the benefits of yoga and exactly where it helps you, every day.',
  keywords: [
    'yoga',
    'Kehmo Nagdev',
    'yoga for beginners',
    'benefits of yoga',
    'yoga for stress',
    'vinyasa',
    'hatha',
    'restorative yoga',
    'breathwork'
  ],
  authors: [{ name: 'Kehmo Nagdev' }],
  openGraph: {
    type: 'website',
    title: 'Kaya Yoga — yoga for everyday life',
    description:
      'A grounded, beginner-friendly yoga practice for real, busy lives. Guided by Kehmo Nagdev.',
    siteName: 'Kaya Yoga',
    images: [{ url: '/images/hero-flow.jpg', width: 1600, height: 1009, alt: 'Sunrise yoga by the sea' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kaya Yoga — yoga for everyday life',
    description: 'A grounded yoga practice for real, busy lives. Guided by Kehmo Nagdev.',
    images: ['/images/hero-flow.jpg']
  }
};

export const viewport: Viewport = {
  themeColor: '#f6efe4',
  colorScheme: 'light'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
  );
}
