// Bare-bones landing page. The full architecture (Docker → registry → Jenkins →
// Minikube NodePort) is wired around this; the business idea gets built on top of
// this component later. For now it just shows "AI Sucks!" in large font.
export default function Home() {
  return (
    <main className="hero">
      <h1 className="hero__title">AI Sucks!</h1>
    </main>
  );
}
