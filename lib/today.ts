import type { ISODate } from './types';

/** The current calendar day, UTC. The single place the clock is read — everything
 *  else takes `today` as an argument, which is what keeps the pricing rules pure
 *  and the server/client render in agreement. */
export function today(): ISODate {
  return new Date().toISOString().slice(0, 10);
}
