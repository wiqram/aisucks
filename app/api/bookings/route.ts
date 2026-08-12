import { NextResponse } from 'next/server';
import { getBike } from '@/lib/bikes';
import { COVERS, EXTRAS, bookingReference, buildQuote, findCover, isAvailableFor } from '@/lib/pricing';
import { today } from '@/lib/today';
import type { CoverId, ExtraId } from '@/lib/types';

// Stubbed booking service. Nothing is persisted and no money moves: it validates the
// request, re-prices it server-side, and returns the reference plus the checks a real
// booking would have to clear. Deliberately no database — see PROD-LOG.md.
export const dynamic = 'force-dynamic';

const COVER_IDS = COVERS.map((c) => c.id) as string[];
const EXTRA_IDS = EXTRAS.map((e) => e.id) as string[];

type Body = {
  bikeId?: unknown;
  from?: unknown;
  to?: unknown;
  cover?: unknown;
  extras?: unknown;
  licence?: unknown;
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

  let quote;
  try {
    quote = buildQuote({ bike, from, to, cover: cover as CoverId, extras: extras as ExtraId[] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  // 409, not 400: the request is well-formed, the calendar just moved.
  if (!isAvailableFor(bike, { from, to })) {
    return NextResponse.json(
      { error: 'Those dates are no longer free on this listing.', bikeId, from, to },
      { status: 409 }
    );
  }

  const chosenCover = findCover(cover as CoverId);

  return NextResponse.json(
    {
      reference: bookingReference(bike.id, from, to),
      status: bike.instantBook ? 'confirmed' : 'awaiting-host',
      bike: { id: bike.id, make: bike.make, model: bike.model, city: bike.city, pickupArea: bike.pickupArea },
      dates: { from, to, days: quote.days },
      total: quote.total,
      depositHold: quote.deposit,
      cover: { id: chosenCover.id, name: chosenCover.name, excess: chosenCover.excess },
      // What a rider must clear before the keys are released.
      requirements: [
        'DVLA licence check code, valid for 21 days',
        `Category ${bike.licence} entitlement held for 2 years or more`,
        'Photo ID matching the payment card',
        'Rental agreement signed before handover',
        'Handover photo checklist completed with the host'
      ],
      demo: true,
      message: 'Concept demo — no payment was taken and nothing was stored.'
    },
    { status: 201 }
  );
}
