import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with conflict resolution — later classes win.
 * Use for ALL conditional class logic instead of template strings, so that
 * e.g. cn('px-4', condition && 'px-6') yields 'px-6' rather than both.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
