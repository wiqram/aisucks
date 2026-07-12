import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aisucks.predictonomy.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'AI Sucks',
  title: 'AI Sucks!',
  description: 'AI Sucks!'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
