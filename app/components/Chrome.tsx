import type { ReactNode } from 'react';

// Shared, presentational chrome used by every route. No hooks — safe to render
// inside both server and client components.

export function BrandMark({ className = 'brand__mark' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="8" fill="#3538cd" />
      <circle cx="16" cy="16" r="9" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.4" />
      <circle cx="16" cy="16" r="4.5" stroke="#fff" strokeOpacity="0.8" strokeWidth="1.4" />
      <circle cx="16" cy="16" r="1.6" fill="#fff" />
      <path d="M16 16 L25 9" stroke="#9df5c8" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Brand() {
  return (
    <a className="brand" href="/">
      <BrandMark />
      <span>
        Control Tower
        <small>Entity Data</small>
      </span>
    </a>
  );
}

export function Topbar({
  active,
  children
}: {
  active?: 'hub' | 'track' | 'reports';
  children?: ReactNode;
}) {
  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Brand />
        <nav className="topbar__nav">
          <a href="/track" className={active === 'track' ? 'active' : ''}>
            Transit
          </a>
          <a href="/reports" className={active === 'reports' ? 'active' : ''}>
            Prism
          </a>
        </nav>
        <div className="topbar__spacer" />
        {children}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="foot">
      <div className="foot__inner">
        <span>© 2026 Entity Data · Control Tower — internal operations console</span>
        <span className="mono">Transit · Prism — prototype with seeded data</span>
      </div>
    </footer>
  );
}
