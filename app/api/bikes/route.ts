import { NextResponse } from 'next/server';
import { CATEGORIES, CITIES, PRICE_CEILING, getFleet } from '@/lib/bikes';
import { availability, filterFleet, isAvailableFor, sortFleet } from '@/lib/pricing';
import { today } from '@/lib/today';
import type { Category, FleetFilters, Licence, SortKey } from '@/lib/types';

// Stubbed listings service. The page server-renders from the same module, so this
// endpoint exists for integration tests and for anything that wants the fleet as
// data — it is not what paints the grid.
export const dynamic = 'force-dynamic';

const SORTS: SortKey[] = ['recommended', 'price-asc', 'price-desc', 'rating'];

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const now = today();

  const city = params.get('city');
  const category = params.get('category');
  const licence = params.get('licence');
  const from = params.get('from');
  const to = params.get('to');
  const sort = params.get('sort');

  if (city && city !== 'all' && !CITIES.includes(city)) {
    return NextResponse.json({ error: `Unknown city: ${city}`, cities: CITIES }, { status: 400 });
  }
  if (category && category !== 'all' && !CATEGORIES.includes(category as Category)) {
    return NextResponse.json({ error: `Unknown category: ${category}`, categories: CATEGORIES }, { status: 400 });
  }
  if (sort && !SORTS.includes(sort as SortKey)) {
    return NextResponse.json({ error: `Unknown sort: ${sort}`, sorts: SORTS }, { status: 400 });
  }
  // Both ends or neither — a half-open range would silently price the wrong days.
  if (Boolean(from) !== Boolean(to)) {
    return NextResponse.json({ error: 'Provide both `from` and `to`, or neither.' }, { status: 400 });
  }

  const filters: FleetFilters = {
    city: city && city !== 'all' ? city : 'all',
    category: category && category !== 'all' ? (category as Category) : 'all',
    licence: licence === 'A2' ? ('A2' as Licence) : 'any',
    maxPrice: Number(params.get('maxPrice') ?? PRICE_CEILING) || PRICE_CEILING,
    range: from && to ? { from, to } : null,
    instantOnly: params.get('instant') === 'true'
  };

  try {
    const fleet = sortFleet(filterFleet(getFleet(now), filters), (sort as SortKey) ?? 'recommended');
    return NextResponse.json({
      today: now,
      count: fleet.length,
      filters,
      bikes: fleet.map((bike) => ({
        ...bike,
        availability: availability(bike, now),
        availableForRange: filters.range ? isAvailableFor(bike, filters.range) : null
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
