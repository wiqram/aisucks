'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

/**
 * Scroll-triggered entrance. Animates ONLY compositor props (transform, opacity),
 * fires once, and collapses to a plain fade when the OS asks for reduced motion.
 *
 * <Reveal delay={0.1}><h2>...</h2></Reveal>
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

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
