// ---------------------------------------------------------------------------
// Transit — Hardware ETA tracker: domain types, seeded test data, demo users.
// Entity Data colleagues across the globe log hardware shipments here; the data
// consolidates into a dashboard shared with customers.
// ---------------------------------------------------------------------------

export type Region = 'EMEA' | 'AMER' | 'APAC' | 'LATAM';

export type HardwareType =
  | 'Router'
  | 'Core Switch'
  | 'Access Switch'
  | 'Firewall'
  | 'SD-WAN Appliance'
  | 'Load Balancer'
  | 'Wireless AP'
  | 'Server';

export type ShipmentStatus =
  | 'Ordered'
  | 'In Production'
  | 'In Transit'
  | 'In Customs'
  | 'At Local DC'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Delayed';

export interface Shipment {
  id: string;
  customer: string;
  hardwareType: HardwareType;
  model: string;
  quantity: number;
  originHub: string;
  region: Region; // destination region (owned by that region's contributor)
  destination: string; // city, country
  status: ShipmentStatus;
  eta: string; // ISO date (expected arrival on site)
  trackingRef: string;
  updatedBy: string; // contributor name
  updatedAt: string; // ISO date
  note?: string;
}

export interface DemoUser {
  email: string;
  name: string;
  region: Region | 'GLOBAL';
  role: 'contributor' | 'admin';
  title: string;
}

// Demo credentials are intentionally public on the login screen — this is a
// front-end prototype with no real backend/auth.
export const DEMO_PASSWORD = 'controltower';

export const DEMO_USERS: DemoUser[] = [
  { email: 'amara.osei@entitydata.com', name: 'Amara Osei', region: 'EMEA', role: 'contributor', title: 'Logistics Lead · London' },
  { email: 'diego.marquez@entitydata.com', name: 'Diego Márquez', region: 'LATAM', role: 'contributor', title: 'Logistics Lead · São Paulo' },
  { email: 'wei.chen@entitydata.com', name: 'Wei Chen', region: 'APAC', role: 'contributor', title: 'Logistics Lead · Singapore' },
  { email: 'sarah.klein@entitydata.com', name: 'Sarah Klein', region: 'AMER', role: 'contributor', title: 'Logistics Lead · Dallas' },
  { email: 'priya.nair@entitydata.com', name: 'Priya Nair', region: 'GLOBAL', role: 'admin', title: 'Global Supply Chain Manager' }
];

export const STATUS_ORDER: ShipmentStatus[] = [
  'Ordered',
  'In Production',
  'In Transit',
  'In Customs',
  'At Local DC',
  'Out for Delivery',
  'Delivered',
  'Delayed'
];

// Progress 0..1 along the delivery journey (Delayed sits off the happy path).
export const STATUS_PROGRESS: Record<ShipmentStatus, number> = {
  Ordered: 0.08,
  'In Production': 0.22,
  'In Transit': 0.48,
  'In Customs': 0.62,
  'At Local DC': 0.78,
  'Out for Delivery': 0.92,
  Delivered: 1,
  Delayed: 0.5
};

export const CUSTOMERS = [
  'Northwind Bank',
  'Meridian Health',
  'Aeon Retail Group',
  'Helios Energy',
  'Vertex Telecom',
  'Cobalt Logistics'
];

export const HARDWARE_TYPES: HardwareType[] = [
  'Router',
  'Core Switch',
  'Access Switch',
  'Firewall',
  'SD-WAN Appliance',
  'Load Balancer',
  'Wireless AP',
  'Server'
];

// Seed shipments — a realistic global spread across customers, regions,
// hardware and delivery stages. IDs are stable so localStorage merges cleanly.
export const SEED_SHIPMENTS: Shipment[] = [
  { id: 'SHP-1042', customer: 'Northwind Bank', hardwareType: 'Firewall', model: 'Palo Alto PA-5420', quantity: 4, originHub: 'Amsterdam DC', region: 'EMEA', destination: 'Frankfurt, DE', status: 'Out for Delivery', eta: '2026-07-17', trackingRef: 'DHL-8830142', updatedBy: 'Amara Osei', updatedAt: '2026-07-16', note: 'Priority — data centre cutover Fri night.' },
  { id: 'SHP-1043', customer: 'Northwind Bank', hardwareType: 'Core Switch', model: 'Arista 7050X3', quantity: 2, originHub: 'Amsterdam DC', region: 'EMEA', destination: 'Frankfurt, DE', status: 'At Local DC', eta: '2026-07-18', trackingRef: 'DHL-8830143', updatedBy: 'Amara Osei', updatedAt: '2026-07-15' },
  { id: 'SHP-1051', customer: 'Vertex Telecom', hardwareType: 'Router', model: 'Juniper MX204', quantity: 6, originHub: 'Amsterdam DC', region: 'EMEA', destination: 'Madrid, ES', status: 'In Transit', eta: '2026-07-22', trackingRef: 'DHL-8830151', updatedBy: 'Amara Osei', updatedAt: '2026-07-14' },
  { id: 'SHP-1067', customer: 'Helios Energy', hardwareType: 'SD-WAN Appliance', model: 'Fortinet FortiGate 200F', quantity: 12, originHub: 'Amsterdam DC', region: 'EMEA', destination: 'Oslo, NO', status: 'In Customs', eta: '2026-07-24', trackingRef: 'DHL-8830167', updatedBy: 'Amara Osei', updatedAt: '2026-07-16', note: 'Held for import paperwork, expect clearance Mon.' },
  { id: 'SHP-1073', customer: 'Meridian Health', hardwareType: 'Wireless AP', model: 'Cisco Catalyst 9166', quantity: 40, originHub: 'Amsterdam DC', region: 'EMEA', destination: 'Dublin, IE', status: 'Delivered', eta: '2026-07-11', trackingRef: 'DHL-8830173', updatedBy: 'Amara Osei', updatedAt: '2026-07-11' },

  { id: 'SHP-2011', customer: 'Aeon Retail Group', hardwareType: 'Access Switch', model: 'Cisco Catalyst 9300', quantity: 18, originHub: 'Dallas DC', region: 'AMER', destination: 'Chicago, US', status: 'In Transit', eta: '2026-07-20', trackingRef: 'FDX-5521011', updatedBy: 'Sarah Klein', updatedAt: '2026-07-15' },
  { id: 'SHP-2012', customer: 'Aeon Retail Group', hardwareType: 'Firewall', model: 'Palo Alto PA-3220', quantity: 8, originHub: 'Dallas DC', region: 'AMER', destination: 'Chicago, US', status: 'In Production', eta: '2026-07-29', trackingRef: 'FDX-5521012', updatedBy: 'Sarah Klein', updatedAt: '2026-07-13' },
  { id: 'SHP-2031', customer: 'Northwind Bank', hardwareType: 'Load Balancer', model: 'F5 BIG-IP i5800', quantity: 3, originHub: 'Dallas DC', region: 'AMER', destination: 'Toronto, CA', status: 'Delayed', eta: '2026-07-19', trackingRef: 'FDX-5521031', updatedBy: 'Sarah Klein', updatedAt: '2026-07-16', note: 'Carrier weather delay in Memphis hub.' },
  { id: 'SHP-2044', customer: 'Cobalt Logistics', hardwareType: 'Router', model: 'Cisco ASR 1001-X', quantity: 5, originHub: 'Dallas DC', region: 'AMER', destination: 'Seattle, US', status: 'Out for Delivery', eta: '2026-07-17', trackingRef: 'FDX-5521044', updatedBy: 'Sarah Klein', updatedAt: '2026-07-16' },
  { id: 'SHP-2058', customer: 'Helios Energy', hardwareType: 'Server', model: 'Dell PowerEdge R760', quantity: 10, originHub: 'Dallas DC', region: 'AMER', destination: 'Houston, US', status: 'Ordered', eta: '2026-08-05', trackingRef: 'FDX-5521058', updatedBy: 'Sarah Klein', updatedAt: '2026-07-12' },
  { id: 'SHP-2069', customer: 'Meridian Health', hardwareType: 'Core Switch', model: 'Arista 7280R3', quantity: 2, originHub: 'Dallas DC', region: 'AMER', destination: 'Boston, US', status: 'Delivered', eta: '2026-07-09', trackingRef: 'FDX-5521069', updatedBy: 'Sarah Klein', updatedAt: '2026-07-09' },

  { id: 'SHP-3007', customer: 'Vertex Telecom', hardwareType: 'Router', model: 'Juniper MX304', quantity: 4, originHub: 'Singapore DC', region: 'APAC', destination: 'Singapore, SG', status: 'At Local DC', eta: '2026-07-18', trackingRef: 'UPS-7730007', updatedBy: 'Wei Chen', updatedAt: '2026-07-16' },
  { id: 'SHP-3012', customer: 'Aeon Retail Group', hardwareType: 'Wireless AP', model: 'Aruba AP-635', quantity: 60, originHub: 'Singapore DC', region: 'APAC', destination: 'Sydney, AU', status: 'In Transit', eta: '2026-07-25', trackingRef: 'UPS-7730012', updatedBy: 'Wei Chen', updatedAt: '2026-07-14' },
  { id: 'SHP-3020', customer: 'Cobalt Logistics', hardwareType: 'SD-WAN Appliance', model: 'Fortinet FortiGate 100F', quantity: 22, originHub: 'Singapore DC', region: 'APAC', destination: 'Tokyo, JP', status: 'In Customs', eta: '2026-07-23', trackingRef: 'UPS-7730020', updatedBy: 'Wei Chen', updatedAt: '2026-07-16', note: 'JP customs inspection scheduled 21 Jul.' },
  { id: 'SHP-3033', customer: 'Meridian Health', hardwareType: 'Access Switch', model: 'Cisco Catalyst 9200', quantity: 30, originHub: 'Singapore DC', region: 'APAC', destination: 'Mumbai, IN', status: 'Delayed', eta: '2026-07-21', trackingRef: 'UPS-7730033', updatedBy: 'Wei Chen', updatedAt: '2026-07-16', note: 'Monsoon disruption at Mumbai port.' },
  { id: 'SHP-3048', customer: 'Helios Energy', hardwareType: 'Firewall', model: 'Palo Alto PA-1420', quantity: 6, originHub: 'Singapore DC', region: 'APAC', destination: 'Seoul, KR', status: 'In Production', eta: '2026-07-31', trackingRef: 'UPS-7730048', updatedBy: 'Wei Chen', updatedAt: '2026-07-13' },
  { id: 'SHP-3055', customer: 'Northwind Bank', hardwareType: 'Load Balancer', model: 'F5 BIG-IP i7800', quantity: 2, originHub: 'Singapore DC', region: 'APAC', destination: 'Hong Kong, HK', status: 'Delivered', eta: '2026-07-10', trackingRef: 'UPS-7730055', updatedBy: 'Wei Chen', updatedAt: '2026-07-10' },

  { id: 'SHP-4004', customer: 'Cobalt Logistics', hardwareType: 'Core Switch', model: 'Arista 7050X3', quantity: 3, originHub: 'São Paulo DC', region: 'LATAM', destination: 'São Paulo, BR', status: 'Out for Delivery', eta: '2026-07-17', trackingRef: 'DHL-9940004', updatedBy: 'Diego Márquez', updatedAt: '2026-07-16' },
  { id: 'SHP-4009', customer: 'Vertex Telecom', hardwareType: 'Router', model: 'Cisco ASR 9006', quantity: 2, originHub: 'São Paulo DC', region: 'LATAM', destination: 'Bogotá, CO', status: 'In Transit', eta: '2026-07-26', trackingRef: 'DHL-9940009', updatedBy: 'Diego Márquez', updatedAt: '2026-07-15' },
  { id: 'SHP-4017', customer: 'Aeon Retail Group', hardwareType: 'Access Switch', model: 'Cisco Catalyst 9300', quantity: 14, originHub: 'São Paulo DC', region: 'LATAM', destination: 'Mexico City, MX', status: 'In Customs', eta: '2026-07-28', trackingRef: 'DHL-9940017', updatedBy: 'Diego Márquez', updatedAt: '2026-07-16', note: 'Awaiting MX customs broker sign-off.' },
  { id: 'SHP-4023', customer: 'Helios Energy', hardwareType: 'Wireless AP', model: 'Aruba AP-615', quantity: 24, originHub: 'São Paulo DC', region: 'LATAM', destination: 'Santiago, CL', status: 'Ordered', eta: '2026-08-08', trackingRef: 'DHL-9940023', updatedBy: 'Diego Márquez', updatedAt: '2026-07-11' },
  { id: 'SHP-4031', customer: 'Meridian Health', hardwareType: 'Server', model: 'HPE ProLiant DL380', quantity: 6, originHub: 'São Paulo DC', region: 'LATAM', destination: 'Lima, PE', status: 'Delivered', eta: '2026-07-08', trackingRef: 'DHL-9940031', updatedBy: 'Diego Márquez', updatedAt: '2026-07-08' }
];

// --------------------------- derived helpers -------------------------------

export const ACTIVE_STATUSES: ShipmentStatus[] = [
  'Ordered',
  'In Production',
  'In Transit',
  'In Customs',
  'At Local DC',
  'Out for Delivery'
];

export function isActive(s: Shipment): boolean {
  return ACTIVE_STATUSES.includes(s.status);
}

export function statusTone(status: ShipmentStatus): 'ok' | 'warn' | 'bad' | 'done' | 'neutral' {
  if (status === 'Delivered') return 'done';
  if (status === 'Delayed') return 'bad';
  if (status === 'Out for Delivery' || status === 'At Local DC') return 'ok';
  if (status === 'In Customs') return 'warn';
  return 'neutral';
}

export function newShipmentId(existing: Shipment[]): string {
  const nums = existing
    .map((s) => Number(s.id.replace(/\D/g, '')))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 9000) + 1;
  return `SHP-${next}`;
}
