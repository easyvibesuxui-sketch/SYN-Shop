import tagL from './assets/tag-l.webp';
import tagM from './assets/tag-m.webp';
import tagS from './assets/tag-s.webp';
import tagQr from './assets/tag-qr.webp';
import toolTags from './assets/tool-tags.webp';
import chainTag from './assets/chain-tag.webp';
import tagCollage from './assets/tag-collage.webp';
import { getLang, t } from './i18n';

export { tagCollage };

export type Category = 'Hardware' | 'Tags';
/** The built-in illustration shown when a product has no image or the image fails to load. */
export type ArtType = 'hardware' | 'dot' | 'tags' | 'tool' | 'chain' | 'qr';
/**
 * Stock as the customer sees it, never as a quantity: in stock = Available, out of stock with a price = Available on
 * request (still orderable), Temporarily unavailable = cannot be ordered. A product without a published price shows
 * "Price on request" instead of a price, whatever its stock.
 */
export type Availability = 'Available' | 'Available on request' | 'Temporarily unavailable';
/** Only published products are shown in the Shop; drafts and archived products stay in DMS Admin. */
export type ProductStatus = 'Published' | 'Draft' | 'Archived';
/** Submitted → Confirmed → Shipped → Completed, or one of the final states Rejected and Cancelled. */
export type OrderStatus = 'Submitted' | 'Confirmed' | 'Shipped' | 'Completed' | 'Rejected' | 'Cancelled';
export type PriceRequestStatus = 'Submitted' | 'Responded';

export interface Product {
  id: string;
  name: string;
  category: Category;
  type: ArtType;
  /** EUR excl. VAT; 0 means "price on request". */
  price: number;
  status: ProductStatus;
  availability: Availability;
  short: string;
  description: string;
  features: string[];
  specs: Array<[string, string]>;
  docs: string[];
  image: string;
  gallery: string[];
  /** Radio and interfaces shown as chips on the product tile ("4G", "CAN", "Bluetooth"). */
  connectivity?: string[];
  /** Ribbon on the tile, e.g. "Most used". */
  badge?: string;
  /** How the device is powered; passive tags need no power. */
  power?: Power;
  /** Ingress protection, where the data sheet states it. */
  ip?: string;
}

export type Power = 'External power' | 'Battery' | 'Solar' | 'Passive';
export const POWER_OPTIONS: Power[] = ['External power', 'Battery', 'Solar', 'Passive'];

export interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  type: ArtType;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  time: string;
  /** The person in the customer's organisation who submitted the order. */
  orderedBy: string;
  contactName: string;
  email: string;
  phone: string;
  org: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  address: string;
  billing: string;
  reference: string;
  comment: string;
  /** Why the order was rejected or cancelled, where Syniotec or the customer gave a reason. */
  reason?: string;
  /** Shipment tracking number, once Syniotec has shipped the order. */
  trackingNumber?: string;
  history: Array<[OrderStatus, string]>;
}

/** A request for a price on a product that has none yet ("Price on request"). */
export interface PriceRequest {
  id: string;
  productId: string;
  productName: string;
  qty: number;
  note: string;
  date: string;
  requestedBy: string;
  email: string;
  phone: string;
  status: PriceRequestStatus;
  /** When Syniotec answered by email. */
  respondedAt?: string;
}

export interface CartLine {
  productId: string;
  qty: number;
  /** The price when the line was added, to tell the customer when it has changed since. */
  price?: number;
}

/** The signed-in user and their organisation, as the SAM / RAM account provides them. */
export const CURRENT_USER = {
  name: 'John Smith',
  company: 'Demo Construction GmbH',
  email: 'john.smith@example.com',
  phone: '+49 421 123456',
  street: 'Bauhofstraße 18', zip: '28195', city: 'Bremen', country: 'Germany',
  billing: { street: 'Am Wall 140', zip: '28195', city: 'Bremen', country: 'Germany' },
};
export const ORDER_STAGES: OrderStatus[] = ['Submitted', 'Confirmed', 'Shipped', 'Completed'];
export const ORDER_STATUSES: OrderStatus[] = [...ORDER_STAGES, 'Rejected', 'Cancelled'];
export const FINAL_STATUSES: OrderStatus[] = ['Completed', 'Rejected', 'Cancelled'];
export const PRICE_REQUEST_STATUSES: PriceRequestStatus[] = ['Submitted', 'Responded'];
export const AVAILABILITIES: Availability[] = ['Available', 'Available on request', 'Temporarily unavailable'];
export const COUNTRIES = ['Germany', 'Austria', 'Switzerland', 'Netherlands', 'Belgium', 'France', 'Other'];

const sam = (file: string) => `https://sam.dev.syniotec.com/assets/img/${file}`;
export const hardwareImages = { edge: sam('syniotec%20EDGE.png'), link: sam('syniotec%20LINK.png'), dot: sam('syniotec%20DOT.png'), core: sam('syniotec%20CORE.png') };

function hardware(p: Omit<Product, 'category' | 'status' | 'gallery' | 'type'> & { type?: ArtType; status?: ProductStatus }): Product {
  return { category: 'Hardware', status: 'Published', type: 'hardware', gallery: [], ...p };
}
function tag(p: Omit<Product, 'category' | 'status' | 'docs'> & { status?: ProductStatus }): Product {
  return { category: 'Tags', status: 'Published', docs: ['Technical data sheet for PASSIVE Telematics'], ...p };
}

const tagFeatures = ['QR code', 'NFC scan', 'Quick and easy installation', 'Direct access to the equipment profile'];
const tagSpecs = (variant: string): Array<[string, string]> => [
  ['Suitable for', 'Construction machinery and large equipment'], ['Access', 'QR code & NFC scan'], ['Variant', variant],
];
const tagDescription = 'Passive telematics tag for direct access to the individual equipment profile using QR and NFC.';

const catalogue: Product[] = [
  hardware({
    id: 'EDGE', name: 'EDGE', price: 199, availability: 'Available',
    short: 'Telematics for construction machinery',
    description: 'Full overview of your construction machinery with live tracking and machine data directly in the syniotec platform.',
    features: ['Live tracking & CAN bus vehicle data', 'Operating hours & usage evaluation', 'Designed for powered construction machinery'],
    specs: [['Suitable for', 'Construction machinery, lifting technology, special machines, pumps & generators'], ['Power supply', '8 V to 32 V DC'], ['Water resistance', 'IP67']],
    docs: ['Technical data sheet', 'Instructions for installing EDGE'],
    image: hardwareImages.edge,
  }),
  hardware({
    id: 'LINK', name: 'LINK', price: 159, availability: 'Available',
    short: 'Telematics for attachments & devices without power supply',
    description: 'Tracking for attachments and devices that do not have their own permanent power supply.',
    features: ['GPS tracking without a fixed power connection', 'Replaceable batteries', 'Designed for attachments, trailers and medium-sized equipment'],
    specs: [['Suitable for', 'Trailers, containers, attachments & medium-sized devices'], ['Power', 'Replaceable batteries'], ['Connectivity', 'LTE-M / NB-IoT']],
    docs: ['Technical data sheet LINK', 'Technical data sheet LINK Mini'],
    image: hardwareImages.link,
  }),
  hardware({
    id: 'LINK-MINI', name: 'LINK mini', price: 0, availability: 'Available on request',
    short: 'Compact telematics for attachments & devices without power supply',
    description: 'Compact LINK variant for assets without a fixed power source.',
    features: ['GPS tracking without a fixed power connection', 'Replaceable battery concept', 'Compact form factor'],
    specs: [['Suitable for', 'Attachments & smaller mobile assets'], ['Product family', 'LINK'], ['Variant', 'LINK mini']],
    docs: ['Technical data sheet LINK Mini'],
    image: sam('syniotec%20LINK%20mini.png'),
  }),
  hardware({
    id: 'DOT', name: 'DOT', type: 'dot', price: 49, availability: 'Available',
    short: 'BLE Beacon for small machines & devices',
    description: 'Keep an eye on equipment without its own power supply using Bluetooth tracking in the syniotec platform.',
    features: ['Track equipment without a power supply', 'Installation in 3-4 minutes', 'Ideal for tools, attachments & small appliances'],
    specs: [['Housing material', 'ABS plastic'], ['Size (L×W×H)', 'Ø 46 × 40 × 18 mm'], ['Weight', '24 g ± 1 g'], ['Waterproof', 'according to IP67'], ['Bluetooth®', 'BLE 5.1'], ['NFC', 'supported']],
    docs: ['Technical data sheet', 'Instructions for installing DOT'],
    image: hardwareImages.dot,
  }),
  hardware({
    id: 'DOT-MINI', name: 'DOT mini', type: 'dot', price: 0, availability: 'Available on request',
    short: 'Compact BLE beacon for small equipment & devices',
    description: 'Compact DOT variant for Bluetooth-based equipment identification and tracking.',
    features: ['Bluetooth beacon', 'Compact form factor', 'For small equipment and devices'],
    specs: [['Product family', 'DOT'], ['Variant', 'DOT mini'], ['Type', 'BLE beacon']],
    docs: [],
    image: sam('syniotec%20DOT%20mini.png'),
  }),
  hardware({
    id: 'LITE', name: 'LITE', price: 0, availability: 'Available on request',
    short: 'Compact Syniotec telematics hardware',
    description: 'Compact telematics hardware for connected equipment and asset tracking.',
    features: ['Compact hardware', 'Equipment tracking', 'Syniotec platform integration'],
    specs: [['Product', 'LITE'], ['Category', 'Telematics hardware']],
    docs: [],
    image: sam('LITE.png'),
  }),
  hardware({
    id: 'VOLT', name: 'VOLT', price: 189, availability: 'Available',
    short: 'Telematics for trailers & mobile machines',
    description: 'Tracking for mobile assets with their own power supply or without a permanent fixed connection.',
    features: ['Live tracking & operating-hours recording', 'Long battery life without external power', 'Suitable for trailers and mobile machines'],
    specs: [['Suitable for', 'Trailers, lifting technology, construction & agricultural machinery'], ['Connectivity', 'LTE CAT M1/NB1 with 2G fallback'], ['Bluetooth®', 'BLE 5.0']],
    docs: ['Technical data sheet', 'Instructions for installing VOLT'],
    image: sam('syniotec%20VOLT.png'),
  }),
  hardware({
    id: 'OBD', name: 'OBD', price: 129, availability: 'Available',
    short: 'Telematics for passenger cars',
    description: 'Vehicle tracking and diagnostic data directly through the OBD-II interface.',
    features: ['CAN bus vehicle data', 'Plug-and-play installation', 'Designed for passenger cars and light commercial vehicles'],
    specs: [['Suitable for', 'Passenger cars, company & service vehicles'], ['Power supply', '10 V to 30 V DC'], ['Bluetooth®', 'Bluetooth® 4.0 + Low Energy']],
    docs: ['Technical data sheet'],
    image: sam('syniotec-obd.png'),
  }),
  hardware({
    id: 'CORE', name: 'CORE', price: 249, availability: 'Available',
    short: 'Telematics for trucks',
    description: 'Robust telematics for commercial vehicles with live tracking, CAN bus information and vehicle-use data.',
    features: ['Live tracking & CAN bus vehicle data', 'Tachograph and vehicle information', 'Designed for trucks and heavy commercial vehicles'],
    specs: [['Suitable for', 'Trucks, tractor units & special machines'], ['Connectivity', 'LTE CAT1 with 2G fallback'], ['Bluetooth®', 'BLE 5.2']],
    docs: [],
    image: sam('syniotec%20CORE.png'),
  }),
  hardware({
    id: 'SOLAR', name: 'SOLAR', price: 219, availability: 'Available',
    short: 'Telematics for mobile storage units',
    description: 'Solar-powered tracking for mobile assets without a fixed power supply.',
    features: ['Integrated solar energy supply', 'GPS tracking & alarm functions', 'Designed for containers, trailers and mobile infrastructure'],
    specs: [['Suitable for', 'Trailers, containers, pumps & generators'], ['Internal battery', 'Li-Polymer 7500 mAh / 3.6 V'], ['Water resistance', 'IP67']],
    docs: ['Technical data sheet', 'Instructions for installing SOLAR'],
    image: sam('syniotec-solar.png'),
  }),
  hardware({
    id: 'DASHCAM', name: 'DASHCAM', price: 199, availability: 'Temporarily unavailable',
    short: 'Dashcam for construction machinery & vehicles',
    description: 'Video-based documentation for journeys, incidents and vehicle use with integration into the syniotec platform.',
    features: ['Live video & event recording', 'GNSS tracking', 'Integration into the syniotec platform'],
    specs: [['Suitable for', 'Construction machinery & vehicles'], ['Tracking', 'Integrated GNSS'], ['Recording', 'Video & audio']],
    docs: [],
    image: sam('dashcam-cam.png'),
  }),
  tag({
    id: 'TAG-L', name: 'TAG L', type: 'tags', price: 24.9, availability: 'Available',
    short: 'For construction machinery and large equipment', description: tagDescription,
    features: tagFeatures, specs: tagSpecs('TAG L'), image: tagL, gallery: [tagM, tagS, tagCollage],
  }),
  tag({
    id: 'TAG-M', name: 'TAG M', type: 'tags', price: 21.9, availability: 'Available',
    short: 'For construction machinery and large equipment', description: tagDescription,
    features: tagFeatures, specs: tagSpecs('TAG M'), image: tagM, gallery: [tagL, tagS, tagCollage],
  }),
  tag({
    id: 'TAG-S', name: 'TAG S', type: 'tags', price: 18.9, availability: 'Available',
    short: 'For construction machinery and large equipment', description: tagDescription,
    features: tagFeatures, specs: tagSpecs('TAG S'), image: tagS, gallery: [tagM, tagL, tagCollage],
  }),
  tag({
    id: 'TOOL-TAGS', name: 'TOOL-TAGS', type: 'tool', price: 9.9, availability: 'Available',
    short: 'For tools and small equipment',
    description: 'A passive telematics variant for tools and small equipment with direct access to the equipment profile.',
    features: ['For tools and small equipment', 'Direct equipment-profile access', 'Part of Syniotec passive telematics'],
    specs: [['Suitable for', 'Tools and small equipment'], ['Access', 'Digital equipment profile'], ['Type', 'Passive telematics']],
    image: toolTags, gallery: [tagCollage],
  }),
  tag({
    id: 'CHAIN-TAG', name: 'CHAIN-TAG', type: 'chain', price: 14.9, availability: 'Available on request',
    short: 'For heavy chains',
    description: 'The passive telematics variant for heavy chains, providing access to the associated equipment profile.',
    features: ['For heavy chains', 'Direct equipment-profile access', 'Part of Syniotec passive telematics'],
    specs: [['Suitable for', 'Heavy chains'], ['Access', 'Equipment profile'], ['Type', 'Passive telematics']],
    image: chainTag, gallery: [tagCollage],
  }),
  tag({
    id: 'QR-STICKER', name: 'QR-Sticker', type: 'qr', price: 3.5, availability: 'Available',
    short: 'For QR access to the equipment profile',
    description: 'A passive QR-based option for direct access to the equipment profile.',
    features: ['QR access', 'Quick and easy installation', 'Part of Syniotec passive telematics'],
    specs: [['Suitable for', 'Equipment / driver cab'], ['Access', 'QR code'], ['Type', 'Passive telematics']],
    image: tagQr, gallery: [tagCollage],
  }),
  // Not shown in the Shop: an archived product that earlier orders still contain, and a draft not yet published.
  tag({
    id: 'TAG-XL', name: 'TAG XL', type: 'tags', price: 27.9, availability: 'Available', status: 'Archived',
    short: 'For very large equipment', description: tagDescription,
    features: tagFeatures, specs: tagSpecs('TAG XL'), image: tagL, gallery: [],
  }),
  hardware({
    id: 'EDGE-2', name: 'EDGE 2', price: 229, availability: 'Available', status: 'Draft',
    short: 'Next-generation telematics for construction machinery', description: 'Draft product, not yet published.',
    features: [], specs: [], docs: [], image: hardwareImages.edge,
  }),
];

/** Chips as on syniotec.com; only what the product data supports. */
const connectivity: Record<string, string[]> = {
  CORE: ['4G', 'CAN', '2G fallback', 'Bluetooth'],
  LINK: ['LTE-M', 'Bluetooth', 'Wi-Fi', 'NB-IoT', '2G fallback'],
  'LINK-MINI': ['GPS'],
  DOT: ['Bluetooth'],
  'DOT-MINI': ['Bluetooth'],
  VOLT: ['LTE-M', 'Bluetooth', 'NB-IoT', '2G fallback'],
  OBD: ['LTE-M', 'Bluetooth', 'NB-IoT', '2G fallback'],
  EDGE: ['CAN'],
  SOLAR: ['GPS', 'Solar'],
  DASHCAM: ['GNSS', 'Video'],
  'TAG-L': ['QR', 'NFC'],
  'TAG-M': ['QR', 'NFC'],
  'TAG-S': ['QR', 'NFC'],
  'TOOL-TAGS': ['QR'],
  'CHAIN-TAG': ['QR'],
  'QR-STICKER': ['QR'],
};
const mostUsed = ['CORE', 'LINK'];

/**
 * Power source and protection, only where the product data above states them (a power-supply range, batteries,
 * solar, IP67, or a passive tag). Products whose data says nothing about power have none.
 */
const facts: Record<string, { power?: Power; ip?: string }> = {
  EDGE: { power: 'External power', ip: 'IP67' },
  LINK: { power: 'Battery' },
  'LINK-MINI': { power: 'Battery' },
  DOT: { ip: 'IP67' },
  VOLT: { power: 'Battery' },
  OBD: { power: 'External power' },
  SOLAR: { power: 'Solar', ip: 'IP67' },
  'TAG-L': { power: 'Passive' },
  'TAG-M': { power: 'Passive' },
  'TAG-S': { power: 'Passive' },
  'TOOL-TAGS': { power: 'Passive' },
  'CHAIN-TAG': { power: 'Passive' },
  'QR-STICKER': { power: 'Passive' },
};

export const defaultProducts: Product[] = catalogue.map((p) => ({
  ...p,
  connectivity: connectivity[p.id] ?? [],
  badge: mostUsed.includes(p.id) ? 'Most used' : undefined,
  power: facts[p.id]?.power,
  ip: facts[p.id]?.ip,
}));

/** Catalogue order of the syniotec.com hardware page; the tile layout follows it. */
export const FEATURED_ORDER = ['CORE', 'LINK', 'DOT', 'VOLT', 'OBD', 'EDGE', 'SOLAR', 'DASHCAM', 'LINK-MINI', 'DOT-MINI', 'LITE', 'TAG-L', 'TAG-M', 'TAG-S', 'CHAIN-TAG', 'TOOL-TAGS', 'QR-STICKER'];

const org = 'Demo Construction GmbH';
const people = {
  john: { orderedBy: 'John Smith', contactName: 'John Smith', email: 'john.smith@example.com', phone: '+49 421 123456' },
  anna: { orderedBy: 'Anna Becker', contactName: 'Anna Becker', email: 'anna.becker@example.com', phone: '+49 421 654321' },
  lukas: { orderedBy: 'Lukas Meyer', contactName: 'Lukas Meyer', email: 'lukas.meyer@example.com', phone: '+49 421 778899' },
};
const delivery = 'Bauhofstraße 18, 28195 Bremen, Germany';
const companyBilling = 'Am Wall 140, 28195 Bremen, Germany';

/**
 * Orders of the whole organisation, newest first, one in each state the customer can see. Everyone with Shop access
 * sees all of them; "Submitted by" says who sent each one.
 */
export const seedOrders: Order[] = [
  {
    id: 'SO-2026-00131', date: '18.11.2026', time: '09:12', ...people.john, org,
    items: [
      { id: 'CORE', name: 'CORE', qty: 4, price: 249, type: 'hardware', image: hardwareImages.core },
      { id: 'TAG-S', name: 'TAG S', qty: 20, price: 18.9, type: 'tags', image: tagS },
    ],
    total: 1374, status: 'Submitted', address: delivery, billing: companyBilling,
    reference: 'SITE-SUED-007', comment: '',
    history: [['Submitted', '18.11.2026 · 09:12']],
  },
  {
    id: 'SO-2026-00129', date: '12.11.2026', time: '15:40', ...people.anna, org,
    items: [{ id: 'LINK', name: 'LINK', qty: 6, price: 159, type: 'hardware', image: hardwareImages.link }],
    total: 954, status: 'Confirmed', address: 'Werk 2, Industriestraße 9, 28197 Bremen, Germany', billing: companyBilling,
    reference: 'WAREHOUSE-02', comment: 'Deliver to gate 3.',
    history: [['Submitted', '12.11.2026 · 15:40'], ['Confirmed', '13.11.2026 · 08:55']],
  },
  {
    id: 'SO-2026-00127', date: '04.11.2026', time: '11:20', ...people.lukas, org,
    items: [
      { id: 'EDGE', name: 'EDGE', qty: 3, price: 199, type: 'hardware', image: hardwareImages.edge },
      { id: 'DOT', name: 'DOT', qty: 12, price: 49, type: 'dot', image: hardwareImages.dot },
    ],
    total: 1185, status: 'Shipped', trackingNumber: 'DHL 00340434161094042557', address: delivery, billing: companyBilling,
    reference: '', comment: 'Please contact our site manager before delivery.',
    history: [['Submitted', '04.11.2026 · 11:20'], ['Confirmed', '04.11.2026 · 14:05'], ['Shipped', '06.11.2026 · 10:30']],
  },
  {
    id: 'SO-2026-00124', date: '13.10.2026', time: '14:32', ...people.john, org,
    items: [
      { id: 'DOT', name: 'DOT', qty: 10, price: 49, type: 'dot', image: hardwareImages.dot },
      { id: 'TOOL-TAGS', name: 'TOOL-TAGS', qty: 20, price: 9.9, type: 'tool', image: toolTags },
    ],
    total: 688, status: 'Completed', trackingNumber: 'DHL 00340434161094031122', address: delivery, billing: companyBilling,
    reference: 'SITE-NORD-042', comment: 'Please contact our site manager before delivery.',
    history: [['Submitted', '13.10.2026 · 14:32'], ['Confirmed', '13.10.2026 · 16:05'], ['Shipped', '15.10.2026 · 09:20'], ['Completed', '17.10.2026 · 12:10']],
  },
  {
    id: 'SO-2026-00121', date: '29.09.2026', time: '10:02', ...people.anna, org,
    items: [{ id: 'DASHCAM', name: 'DASHCAM', qty: 5, price: 199, type: 'hardware', image: hardwareImages.edge }],
    total: 995, status: 'Rejected', reason: 'DASHCAM is not available for delivery to Austria at the moment.',
    address: 'Baustelle Linz, Hafenstraße 12, 4020 Linz, Austria', billing: companyBilling,
    reference: 'AT-LINZ-01', comment: '',
    history: [['Submitted', '29.09.2026 · 10:02'], ['Rejected', '30.09.2026 · 09:15']],
  },
  {
    id: 'SO-2026-00118', date: '08.09.2026', time: '11:05', ...people.lukas, org,
    items: [
      { id: 'TAG-XL', name: 'TAG XL', qty: 15, price: 27.9, type: 'tags', image: tagL },
      { id: 'TAG-S', name: 'TAG S', qty: 15, price: 18.9, type: 'tags', image: tagS },
    ],
    total: 702, status: 'Cancelled', reason: 'Ordered twice by mistake.', address: delivery, billing: companyBilling,
    reference: 'WAREHOUSE-02', comment: '',
    history: [['Submitted', '08.09.2026 · 11:05'], ['Cancelled', '08.09.2026 · 11:30']],
  },
];

/** Price requests of the whole organisation; Syniotec answers each one by email. */
export const seedPriceRequests: PriceRequest[] = [
  {
    id: 'PR-2026-0034', productId: 'LINK-MINI', productName: 'LINK mini', qty: 25, note: 'For a rental fleet of 25 compressors, delivery in January.',
    date: '16.11.2026 · 13:48', requestedBy: 'John Smith', email: 'john.smith@example.com', phone: '+49 421 123456', status: 'Submitted',
  },
  {
    id: 'PR-2026-0031', productId: 'LITE', productName: 'LITE', qty: 10, note: '',
    date: '02.11.2026 · 09:30', requestedBy: 'Anna Becker', email: 'anna.becker@example.com', phone: '+49 421 654321', status: 'Responded', respondedAt: '03.11.2026 · 11:05',
  },
];

// Prices follow the Shop language: €688.00 in English, 688,00 € in German.
const euro = { en: new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }), de: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }) };
export const money = (n: number) => euro[getLang()].format(Number(n) || 0);
export const hasPrice = (p: Pick<Product, 'price'>) => Number(p.price) > 0;
export const priceLabel = (p: Pick<Product, 'price'>) => (hasPrice(p) ? money(p.price) : t('Price on request'));
/** Shown in the Shop: published products only. */
export const isListed = (p: Pick<Product, 'status'>) => p.status === 'Published';
/** Orderable: published, not temporarily unavailable, with a published price. Out of stock is still orderable. */
export const canOrder = (p: Product) => isListed(p) && p.availability !== 'Temporarily unavailable' && hasPrice(p);
/** A price can be requested for published products without a published price that are not temporarily unavailable. */
export const canRequestPrice = (p: Product) => isListed(p) && p.availability !== 'Temporarily unavailable' && !hasPrice(p);
/** "3 items" / "3 Artikel": the German dictionary has an entry for the singular and for the English plural (word + s). */
export const plural = (n: number, word: string) => `${n} ${t(n === 1 ? word : `${word}s`)}`;

export function stamp(now = new Date()) {
  const two = (n: number) => String(n).padStart(2, '0');
  const date = `${two(now.getDate())}.${two(now.getMonth() + 1)}.${now.getFullYear()}`;
  const time = `${two(now.getHours())}:${two(now.getMinutes())}`;
  return { date, time, both: `${date} · ${time}`, year: now.getFullYear() };
}

/** The product's own "Suitable for" text from its specifications, verbatim. */
export const suitableFor = (p: Pick<Product, 'specs'>) => p.specs.find(([k]) => k === 'Suitable for')?.[1];

/**
 * The "Suitable for" text split at its commas into filter values, e.g. "Trailers, containers, pumps & generators"
 * becomes Trailers / Containers / Pumps & generators. Nothing is renamed or grouped; only the first letter is capitalised.
 */
export function suitableTerms(p: Pick<Product, 'specs'>): string[] {
  const text = suitableFor(p);
  if (!text) return [];
  return text.split(',').map((t) => t.trim()).filter(Boolean).map((t) => t[0].toUpperCase() + t.slice(1));
}
