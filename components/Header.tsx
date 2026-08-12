import { WheelMark } from './Art';

const NAV = [
  { href: '#fleet', label: 'Browse bikes' },
  { href: '#cover', label: 'Insurance' },
  { href: '#legal', label: 'Legal' },
  { href: '#autopilot', label: 'Autopilot' },
  { href: '#host', label: 'Earn' }
];

export function Header() {
  return (
    <header className="sticky top-0 z-(--z-index-sticky) border-b border-line bg-ink/92 backdrop-blur-sm">
      <div className="shell flex h-16 items-center justify-between gap-6">
        <a href="#top" className="flex items-center gap-2.5 text-chalk" aria-label="Kickstand home">
          <WheelMark className="size-6 text-signal" />
          <span className="font-display text-xl leading-none">Kickstand</span>
        </a>

        <nav aria-label="Sections" className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-mist transition-colors duration-150 ease-out hover:text-chalk"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a href="#host" className="btn btn-primary shrink-0 max-sm:px-3.5 max-sm:text-[0.8125rem]">
          List your bike
        </a>
      </div>
    </header>
  );
}
