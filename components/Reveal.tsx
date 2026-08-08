'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Scroll-triggered entrance for BELOW-THE-FOLD content.
 *
 * Deliberately fails safe: the server-rendered markup is fully VISIBLE and the hidden
 * start state is armed only on the client, only for elements that actually begin below
 * the viewport. So:
 *   - no JS / JS fails / slow network  -> content is visible, never a blank page
 *   - above-the-fold content           -> visible immediately, no flash
 *   - below-the-fold content           -> fades+rises once, when scrolled into view
 *
 * Animates only compositor props (opacity, transform) and collapses to no motion when
 * the OS asks for reduced motion.
 *
 * Wrapping the hero in this is harmless (it just renders plain) — but prefer leaving
 * critical above-the-fold content unwrapped entirely.
 */
export function Reveal({
  children,
  delay = 0,
  y = 16,
  className
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Arm only if the element starts below the fold, so nothing on-screen is ever
    // hidden and there is no visible flash on hydration.
    if (el.getBoundingClientRect().top > window.innerHeight * 0.9) setArmed(true);
  }, []);

  if (!armed || reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
