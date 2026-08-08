import { Reveal } from '@/components/Reveal';

// Bare-bones landing page. The full architecture (Docker → registry → Jenkins →
// Minikube NodePort → Cloudflare/NPM at aisucks.qcguy.com) is wired around this; the
// business idea gets built on top of this component.
//
// Styled with Tailwind utilities rather than the legacy .hero CSS so that the UI
// toolchain (Tailwind v4 + tw-animate-css + motion) is exercised by the production
// build and can't surprise us at build time.
export default function Home() {
  return (
    <main className="grid min-h-dvh place-items-center p-8 text-center">
      <Reveal>
        <h1 className="text-[clamp(3rem,18vw,12rem)] font-extrabold leading-none tracking-[-0.03em]">
          AI Sucks!
        </h1>
      </Reveal>
    </main>
  );
}
