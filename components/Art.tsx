// Line art and icons, all inline SVG.
//
// No photography anywhere on the site: it keeps the page weight tiny, avoids a
// third-party image host, and a consistent technical-drawing treatment across 15
// listings looks more deliberate than 15 mismatched stock photos.

type ArtProps = { className?: string };

/** Front wheel as an engineering drawing — tyre, rim, five twin spokes, floating
 *  brake rotor with drilled holes. Used large as a background motif. */
export function WheelDrawing({ className }: ArtProps) {
  const spokes = [0, 72, 144, 216, 288];
  const rotorHoles = Array.from({ length: 16 }, (_, i) => (i * 360) / 16);
  const boltHoles = [18, 90, 162, 234, 306];

  const at = (angle: number, radius: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: 110 + Math.cos(rad) * radius, y: 110 + Math.sin(rad) * radius };
  };

  return (
    <svg viewBox="0 0 220 220" fill="none" aria-hidden="true" className={className}>
      <g stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke">
        {/* Tyre */}
        <circle cx="110" cy="110" r="105" strokeWidth="1.5" />
        <circle cx="110" cy="110" r="83" />
        {/* Rim */}
        <circle cx="110" cy="110" r="78" strokeWidth="1.5" />
        {/* Spokes: each is a narrow wedge from hub to rim */}
        {spokes.map((angle) => {
          const tipA = at(angle - 5, 76);
          const tipB = at(angle + 5, 76);
          const rootA = at(angle - 13, 17);
          const rootB = at(angle + 13, 17);
          return (
            <path
              key={angle}
              d={`M ${rootA.x} ${rootA.y} L ${tipA.x} ${tipA.y} L ${tipB.x} ${tipB.y} L ${rootB.x} ${rootB.y}`}
            />
          );
        })}
        {/* Floating brake rotor */}
        <circle cx="110" cy="110" r="52" />
        <circle cx="110" cy="110" r="34" />
        {rotorHoles.map((angle) => {
          const p = at(angle, 43);
          return <circle key={angle} cx={p.x} cy={p.y} r="2.5" />;
        })}
        {/* Hub and bolt pattern */}
        <circle cx="110" cy="110" r="17" strokeWidth="1.5" />
        <circle cx="110" cy="110" r="7" />
        {boltHoles.map((angle) => {
          const p = at(angle, 25);
          return <circle key={angle} cx={p.x} cy={p.y} r="2" />;
        })}
        {/* Valve stem */}
        <path d={`M ${at(200, 83).x} ${at(200, 83).y} L ${at(200, 92).x} ${at(200, 92).y}`} strokeWidth="2" />
      </g>
    </svg>
  );
}

/** Small wheel mark for the wordmark and card watermarks. */
export function WheelMark({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <g stroke="currentColor" strokeWidth="1.5">
        <circle cx="16" cy="16" r="14" />
        <circle cx="16" cy="16" r="9" />
        <circle cx="16" cy="16" r="2.5" />
        <path d="M16 7v4M16 21v4M7 16h4M21 16h4" />
      </g>
    </svg>
  );
}

/** Filled star for ratings. */
export function Star({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2.5l2.9 6.05 6.6.85-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5-4.8-4.6 6.6-.85z" />
    </svg>
  );
}

/** Lightning bolt — instant book. */
export function Bolt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M13.5 2L4 14h6l-1.5 8L20 9h-6.5z" />
    </svg>
  );
}

/** Shield — cover and legal sections. */
export function Shield({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className={className}>
      <path d="M12 2.8l7.5 2.7v6c0 4.6-3.1 8.4-7.5 9.7-4.4-1.3-7.5-5.1-7.5-9.7v-6z" />
      <path d="M8.7 12l2.4 2.4 4.2-4.4" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowRight({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <path d="M4 12h15m0 0l-5.5-5.5M19 12l-5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Check({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={className}>
      <path d="M4.5 12.5l5 5 10-11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Close({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

/** Category pictograms: a two-wheel silhouette whose stance says what kind of bike
 *  it is: a sports bike sits tucked with low bars and a high tail, an adventure bike
 *  is tall with a beak, a cruiser is long and raked. Drawn as separate strokes —
 *  wheels, tank-and-seat line, fork, bars — because a single polyline reads as a
 *  squiggle rather than a machine. */
type Profile = {
  /** [cx, cy, r] for the rear and front wheels. */
  rear: [number, number, number];
  front: [number, number, number];
  /** Tank and seat top line, front to back. */
  body: string;
  /** Fork and handlebar. */
  front_end: string;
  /** Engine, mudguard or bodywork detail. */
  detail?: string;
};

const PROFILES: Record<string, Profile> = {
  Sport: {
    rear: [18, 36, 12],
    front: [82, 36, 12],
    body: 'M14 20 L26 22 L42 18 L56 20 L67 25',
    front_end: 'M82 36 L70 20 M70 20 L62 18',
    detail: 'M42 29 L58 31'
  },
  Naked: {
    rear: [18, 36, 12],
    front: [82, 36, 12],
    body: 'M13 23 L24 24 L42 21 L58 21 L68 24',
    front_end: 'M82 36 L71 17 M71 17 L61 15',
    detail: 'M42 29 L58 29'
  },
  Adventure: {
    rear: [18, 35, 13],
    front: [82, 35, 13],
    body: 'M12 18 L24 20 L42 16 L58 15 L68 18',
    front_end: 'M82 35 L72 13 M72 13 L63 11 M72 13 L79 9',
    detail: 'M42 27 L58 27 M77 21 L89 25'
  },
  Classic: {
    rear: [18, 36, 12],
    front: [82, 36, 12],
    body: 'M13 24 L24 25 L40 21 Q50 18 60 21 L68 25',
    front_end: 'M82 36 L72 18 M72 18 L62 16',
    detail: 'M42 30 L58 30 M70 25 A 14 14 0 0 1 93 31'
  },
  Cruiser: {
    rear: [17, 36, 11],
    front: [84, 36, 13],
    body: 'M9 26 L22 28 L38 24 L54 26 L64 29',
    front_end: 'M84 36 L67 19 M67 19 L58 17',
    detail: 'M44 33 L52 35'
  },
  Electric: {
    rear: [18, 36, 12],
    front: [82, 36, 12],
    body: 'M13 22 L24 23 L42 21 L58 21 L68 24',
    front_end: 'M82 36 L71 16 M71 16 L61 14',
    // Slab-sided battery box where an engine would be, and no exhaust.
    detail: 'M34 22 L34 32 L56 32 L56 21'
  }
};

export function CategoryMark({ category, className }: ArtProps & { category: string }) {
  const profile = PROFILES[category] ?? PROFILES.Naked;
  const [rx, ry, rr] = profile.rear;
  const [fx, fy, fr] = profile.front;

  return (
    <svg viewBox="0 0 100 52" fill="none" aria-hidden="true" className={className}>
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx={rx} cy={ry} r={rr} />
        <circle cx={fx} cy={fy} r={fr} />
        <circle cx={rx} cy={ry} r={rr * 0.34} />
        <circle cx={fx} cy={fy} r={fr * 0.34} />
        <path d={profile.body} />
        <path d={profile.front_end} />
        {profile.detail ? <path d={profile.detail} /> : null}
      </g>
    </svg>
  );
}
