// Bare-bones landing page. The full architecture (Docker → registry → Jenkins →
// Minikube NodePort → Cloudflare/NPM at aisucks.qcguy.com) is wired around this; the
// business idea gets built on top of this component.
//
// Styled with Tailwind utilities so the UI toolchain is exercised by the production
// build. Above-the-fold content is intentionally NOT wrapped in an entrance animation:
// it must be visible without JavaScript. See components/Reveal.tsx for below-the-fold
// scroll reveals.
export default function Home() {
  return (
    <main className="grid min-h-dvh place-items-center p-8 text-center">
      <h1 className="text-[clamp(3rem,18vw,12rem)] font-extrabold leading-none tracking-[-0.03em]">
        AI Sucks!
      </h1>
    </main>
  );
}
