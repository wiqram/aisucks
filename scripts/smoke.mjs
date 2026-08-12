// End-to-end smoke test. Runs against any base URL, so the identical assertions
// gate the local build and then verify production:
//
//   node scripts/smoke.mjs http://127.0.0.1:3013
//   node scripts/smoke.mjs https://aisucks.qcguy.com
//
// Exits non-zero on the first failure so it can be chained as a deploy gate.

import { getFleet } from '../lib/bikes.ts';
import { addDays, buildQuote } from '../lib/pricing.ts';

const BASE = (process.argv[2] ?? process.env.BASE_URL ?? 'http://127.0.0.1:3013').replace(/\/$/, '');

let passed = 0;
const failures = [];

function check(name, condition, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`  ok   ${name}`);
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

function section(title) {
  console.log(`\n${title}`);
}

async function get(path, init) {
  const response = await fetch(`${BASE}${path}`, init);
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* not JSON, that's fine */
  }
  return { response, text, json };
}

async function postJson(path, body) {
  return get(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
}

console.log(`Smoke testing ${BASE}`);

// ---------------------------------------------------------------------------
section('Health');
// ---------------------------------------------------------------------------
{
  const { response, json } = await get('/api/health');
  check('/api/health is 200', response.status === 200, `got ${response.status}`);
  check('reports the aisucks-web service', json?.service === 'aisucks-web', JSON.stringify(json));
  check('is running version 1.0.0', json?.version === '1.0.0', `got ${json?.version}`);
}

// ---------------------------------------------------------------------------
section('Landing page');
// ---------------------------------------------------------------------------
const { response: pageResponse, text: html } = await get('/');
{
  check('/ is 200', pageResponse.status === 200, `got ${pageResponse.status}`);
  check('is served as HTML', (pageResponse.headers.get('content-type') ?? '').includes('text/html'));

  check('carries the brand', html.includes('Kickstand'));
  check('carries the headline', html.includes('kickstand</h1>') || /shouldn.{1,8}t spend the summer/i.test(html));
  check('describes the proposition in the meta description', /name="description"[^>]*motorcycle/i.test(html));
  check('sets the canonical URL', html.includes('rel="canonical"'));
  check('ships JSON-LD structured data', html.includes('application/ld+json') && html.includes('AggregateOffer'));
  check('self-hosts the fonts', /\/_next\/static\/media\/[^"']+\.woff2/.test(html));

  // The hard-won rule: nothing visible may be gated behind JavaScript.
  const hiddenCount = (html.match(/opacity:0/g) ?? []).length;
  check('no server-rendered content is hidden with opacity:0', hiddenCount === 0, `found ${hiddenCount}`);
  check('no server-rendered content is hidden with visibility:hidden', !html.includes('visibility:hidden'));
  check('no server-rendered content is display:none', !/style="[^"]*display:\s*none/.test(html));

  // Every section must be present in the HTML, not built on the client.
  for (const id of ['fleet', 'how', 'cover', 'legal', 'autopilot', 'host', 'faq']) {
    check(`section #${id} is server-rendered`, html.includes(`id="${id}"`));
  }
}

// ---------------------------------------------------------------------------
section('Fleet is server-rendered');
// ---------------------------------------------------------------------------
const { json: bikesJson } = await get('/api/bikes');
const serverToday = bikesJson?.today;
{
  check('/api/bikes returns the fleet', Array.isArray(bikesJson?.bikes) && bikesJson.bikes.length > 0);
  check('reports the server calendar day', /^\d{4}-\d{2}-\d{2}$/.test(serverToday ?? ''), `got ${serverToday}`);

  const fleet = getFleet(serverToday);
  check('API count matches the fleet module', bikesJson.count === fleet.length, `${bikesJson.count} vs ${fleet.length}`);

  const missing = fleet.filter((bike) => !html.includes(bike.model)).map((b) => b.model);
  check('every listing appears in the served HTML', missing.length === 0, `missing ${missing.join(', ')}`);

  const missingPrices = fleet.filter((bike) => !html.includes(`£${bike.pricePerDay}`)).map((b) => b.id);
  check('every daily price is in the served HTML', missingPrices.length === 0, `missing ${missingPrices.join(', ')}`);

  check('availability badges are rendered', /Available (today|from|\d)/.test(html));
  check('every bike carries availability in the API', bikesJson.bikes.every((b) => Boolean(b.availability?.label)));
}

// ---------------------------------------------------------------------------
section('Fleet filtering');
// ---------------------------------------------------------------------------
{
  const { json } = await get('/api/bikes?city=London');
  check('filters by city', json?.bikes?.length > 0 && json.bikes.every((b) => b.city === 'London'));

  const { json: adv } = await get('/api/bikes?category=Adventure');
  check('filters by category', adv?.bikes?.length > 0 && adv.bikes.every((b) => b.category === 'Adventure'));

  const { json: a2 } = await get('/api/bikes?licence=A2');
  check('filters to A2-legal bikes only', a2?.bikes?.length > 0 && a2.bikes.every((b) => b.licence === 'A2'));
  check('A2 listings really are under 47 bhp', a2.bikes.every((b) => b.power <= 47));

  const { json: cheap } = await get('/api/bikes?maxPrice=50');
  check('filters by price ceiling', cheap?.bikes?.length > 0 && cheap.bikes.every((b) => b.pricePerDay <= 50));

  const { json: sorted } = await get('/api/bikes?sort=price-asc');
  const prices = sorted.bikes.map((b) => b.pricePerDay);
  check('sorts by price ascending', prices.every((p, i) => i === 0 || prices[i - 1] <= p), prices.join(','));

  const { response: badCity } = await get('/api/bikes?city=Atlantis');
  check('rejects an unknown city with 400', badCity.status === 400, `got ${badCity.status}`);

  const { response: halfRange } = await get('/api/bikes?from=2026-09-01');
  check('rejects a half-open date range with 400', halfRange.status === 400, `got ${halfRange.status}`);

  const { json: ranged } = await get(`/api/bikes?from=${addDays(serverToday, 30)}&to=${addDays(serverToday, 33)}`);
  check('a date range returns only bikes free for it', ranged.bikes.every((b) => b.availableForRange === true));
}

// ---------------------------------------------------------------------------
section('Quoting');
// ---------------------------------------------------------------------------
const fleet = getFleet(serverToday);
const target = fleet.find((bike) => bike.id === 'mt-07') ?? fleet[0];
{
  const from = addDays(serverToday, 31);
  const to = addDays(from, 7);
  const expected = buildQuote({ bike: target, from, to, cover: 'standard', extras: ['helmet', 'delivery'] });

  const { response, json } = await postJson('/api/quote', {
    bikeId: target.id,
    from,
    to,
    cover: 'standard',
    extras: ['helmet', 'delivery']
  });
  check('/api/quote is 200', response.status === 200, `got ${response.status}`);
  check('server total matches the pricing module', json?.quote?.total === expected.total, `${json?.quote?.total} vs ${expected.total}`);
  check('service fee matches', json?.quote?.serviceFee === expected.serviceFee);
  check('day count matches', json?.quote?.days === expected.days, `${json?.quote?.days} vs ${expected.days}`);
  check('the weekly rate was applied', json?.quote?.savings > 0, `savings ${json?.quote?.savings}`);
  check('breakdown reconciles to the subtotal', (() => {
    const summed = json.quote.lines.reduce((t, l) => t + (l.credit ? -l.amount : l.amount), 0);
    return Math.abs(summed - json.quote.subtotal) < 0.005;
  })());

  const { response: badCover } = await postJson('/api/quote', { bikeId: target.id, from, to, cover: 'platinum' });
  check('rejects an unknown cover tier with 400', badCover.status === 400, `got ${badCover.status}`);

  const { response: badDate } = await postJson('/api/quote', { bikeId: target.id, from: '12/09/2026', to, cover: 'essential' });
  check('rejects a malformed date with 400', badDate.status === 400, `got ${badDate.status}`);

  const { response: noBike } = await postJson('/api/quote', { bikeId: 'ghost-bike', from, to, cover: 'essential' });
  check('rejects an unknown listing with 404', noBike.status === 404, `got ${noBike.status}`);

  const { response: notJson } = await get('/api/quote', { method: 'POST', body: 'not json' });
  check('rejects a non-JSON body with 400', notJson.status === 400, `got ${notJson.status}`);
}

// ---------------------------------------------------------------------------
section('Booking');
// ---------------------------------------------------------------------------
{
  const from = addDays(serverToday, 32);
  const to = addDays(from, 3);
  const { response, json } = await postJson('/api/bookings', {
    bikeId: target.id,
    from,
    to,
    cover: 'zero',
    extras: []
  });
  check('/api/bookings is 201', response.status === 201, `got ${response.status}`);
  check('returns a readable reference', /^KS-[0-9A-Z]{4}$/.test(json?.reference ?? ''), json?.reference);
  check('the reference is stable on retry', await (async () => {
    const again = await postJson('/api/bookings', { bikeId: target.id, from, to, cover: 'zero', extras: [] });
    return again.json?.reference === json.reference;
  })());
  check('states the booking status', ['confirmed', 'awaiting-host'].includes(json?.status), json?.status);
  check('lists what the rider must clear before handover', json?.requirements?.length >= 4);
  check('names the DVLA licence check', json.requirements.some((r) => /DVLA/i.test(r)));
  check('is honest that nothing was charged', json?.demo === true && /no payment/i.test(json?.message ?? ''));
  check('quotes a deposit hold', typeof json?.depositHold === 'number' && json.depositHold > 0);

  // A bike with an existing booking must refuse those dates.
  const booked = fleet.find((bike) => bike.booked.length > 0);
  const clash = booked.booked[0];
  const { response: conflict, json: conflictJson } = await postJson('/api/bookings', {
    bikeId: booked.id,
    from: clash.from,
    to: clash.to,
    cover: 'essential',
    extras: []
  });
  check('refuses dates that clash with an existing booking (409)', conflict.status === 409, `got ${conflict.status}`);
  check('explains the clash', /no longer free/i.test(conflictJson?.error ?? ''), conflictJson?.error);

  // Outside the released window is equally refused.
  const { response: outside } = await postJson('/api/bookings', {
    bikeId: target.id,
    from: addDays(target.listed.to, 1),
    to: addDays(target.listed.to, 3),
    cover: 'essential',
    extras: []
  });
  check('refuses dates outside the released window (409)', outside.status === 409, `got ${outside.status}`);
}

// ---------------------------------------------------------------------------
section('Crawlers, assets and errors');
// ---------------------------------------------------------------------------
{
  const { response: robots, text: robotsText } = await get('/robots.txt');
  check('/robots.txt is 200', robots.status === 200);
  check('robots.txt keeps crawlers out of /api/', robotsText.includes('/api/'));
  check('robots.txt points at the sitemap', /sitemap:/i.test(robotsText));

  const { response: sitemap, text: sitemapText } = await get('/sitemap.xml');
  check('/sitemap.xml is 200', sitemap.status === 200);
  check('sitemap lists the site URL', sitemapText.includes('<loc>'));

  const { response: icon } = await get('/icon.svg');
  check('favicon is served', icon.status === 200);

  const { response: missing, text: missingText } = await get('/no-such-page');
  check('unknown routes 404', missing.status === 404, `got ${missing.status}`);
  check('the 404 page is branded, not a stack trace', missingText.includes('Wrong turning'));

  const fontMatch = html.match(/\/_next\/static\/media\/[^"']+\.woff2/);
  if (fontMatch) {
    const { response: font } = await get(fontMatch[0]);
    check('the self-hosted font file is reachable', font.status === 200, `got ${font.status}`);
  } else {
    check('the self-hosted font file is reachable', false, 'no font URL found in the HTML');
  }
}

// ---------------------------------------------------------------------------
console.log(`\n${'-'.repeat(60)}`);
if (failures.length > 0) {
  console.log(`FAILED — ${passed} passed, ${failures.length} failed\n`);
  for (const failure of failures) console.log(`  · ${failure}`);
  process.exit(1);
}
console.log(`PASSED — ${passed} checks against ${BASE}`);
