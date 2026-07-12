import localFont from 'next/font/local';

// Self-hosted (latin subset, downloaded into app/fonts/*.woff2) so the production
// image builds with zero build-time network dependency on Google Fonts.
export const fraunces = localFont({
  src: [
    { path: './fonts/fraunces-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/fraunces-400-italic.woff2', weight: '400', style: 'italic' },
    { path: './fonts/fraunces-600.woff2', weight: '600', style: 'normal' },
    { path: './fonts/fraunces-900.woff2', weight: '900', style: 'normal' }
  ],
  variable: '--font-display',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif']
});

export const nunito = localFont({
  src: [
    { path: './fonts/nunitosans-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/nunitosans-700.woff2', weight: '700', style: 'normal' },
    { path: './fonts/nunitosans-800.woff2', weight: '800', style: 'normal' }
  ],
  variable: '--font-body',
  display: 'swap',
  fallback: ['system-ui', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif']
});
