import { NextResponse } from 'next/server';
import { getBike } from '@/lib/bikes';
import { COVERS, EXTRAS, buildQuote, isAvailableFor } from '@/lib/pricing';
import { today } from '@/lib/today';
import type { CoverId, ExtraId } from '@/lib/types';

// Stubbed quoting service: real rules, no persistence. The client mirrors this maths
// locally so the breakdown updates without a round trip; this endpoint is the
// authority a payment step would call.
export const dynamic = 'force-dynamic';

const COVER_IDS = COVERS.map((c) => c.id) as string[];
const EXTRA_IDS = EXTRAS.map((e) => e.id) as string[];

type Body = {
  bikeId?: unknown;
  from?: unknown;
  to?: unknown;
  cover?: unknown;
  extras?: unknown;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Body must be JSON.' }, { status: 400 });
  }

  const { bikeId, from, to, cover = 'essential', extras = [] } = body;

  if (typeof bikeId !== 'string' || typeof from !== 'string' || typeof to !== 'string') {
    return NextResponse.json({ error: 'bikeId, from and to are required.' }, { status: 400 });
  }
  if (typeof cover !== 'string' || !COVER_IDS.includes(cover)) {
    return NextResponse.json({ error: `cover must be one of ${COVER_IDS.join(', ')}.` }, { status: 400 });
  }
  if (!Array.isArray(extras) || extras.some((id) => typeof id !== 'string' || !EXTRA_IDS.includes(id))) {
    return NextResponse.json({ error: `extras must be a subset of ${EXTRA_IDS.join(', ')}.` }, { status: 400 });
  }

  const now = today();
  const bike = getBike(now, bikeId);
  if (!bike) return NextResponse.json({ error: `No listing with id ${bikeId}.` }, { status: 404 });

  try {
    const quote = buildQuote({
      bike,
      from,
      to,
      cover: cover as CoverId,
      extras: extras as ExtraId[]
    });
    return NextResponse.json({
      bike: { id: bike.id, make: bike.make, model: bike.model, city: bike.city },
      available: isAvailableFor(bike, { from, to }),
      quote
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
