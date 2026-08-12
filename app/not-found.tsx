import type { Metadata } from 'next';
import Link from 'next/link';
import { WheelDrawing } from '@/components/Art';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false }
};

export default function NotFound() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-6 py-20 text-center">
      <WheelDrawing className="pointer-events-none absolute -right-40 -bottom-48 w-[34rem] text-line" />
      <div className="relative">
        <p className="label">Error 404</p>
        <h1 className="font-display mt-4 text-[clamp(2.5rem,10vw,5rem)] leading-none">Wrong turning</h1>
        <p className="mx-auto mt-5 max-w-[28rem] text-lg text-mist">
          There&rsquo;s nothing at this address. The bikes are all back at the main page.
        </p>
        <Link href="/" className="btn btn-primary mt-9">
          Back to Kickstand
        </Link>
      </div>
    </main>
  );
}
