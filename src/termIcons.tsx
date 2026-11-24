import { Icon, type IconName } from '@syn';
import { cx } from '@syn/utils';

/*
 * Icons for the Suitable-for bar. Syn's own icons come first where the set has the picture (dozer, compactor, tractor,
 * boxes, wrench, ignition key). Syn has no trucks, cranes, forklifts, trailers, containers, generators or chains, so
 * those are drawn here in Syn's style: the same 20 × 20 grid, a 1.1 outline with round caps and joins, side views with
 * rounded cab windows and wheels with a hub ring, as in the Syn equipment, compactor and tractor icons. One ink:
 * Silver Chalice at rest, black once selected. Only the picture is chosen here; every label stays the product's own
 * "Suitable for" text.
 */
/** Syn icons, checked before the drawn ones below. */
const synRules: Array<[RegExp, IconName]> = [
  [/driver cab/i, 'ignition-key'],
  [/agricultural/i, 'categories'],
  [/large equipment/i, 'equipment'],
  [/^construction machinery$/i, 'navbar-2'],
  [/mobile assets/i, 'inventory'],
  [/tools/i, 'maintenance'],
];

/** Drawn in Syn style on a 20 × 20 grid (inner SVG markup, outlines only). */
const drawn: Record<string, string> = {
  all: `<rect x="2.8" y="2.8" width="6" height="6" rx="1.2"/><rect x="11.2" y="2.8" width="6" height="6" rx="1.2"/><rect x="2.8" y="11.2" width="6" height="6" rx="1.2"/><rect x="11.2" y="11.2" width="6" height="6" rx="1.2"/>`,
  'car-crane': `<path d="M2.1 13.6H1.9a.6.6 0 0 1-.6-.6v-1.4a.6.6 0 0 1 .6-.6H13.6"/><path d="M13.6 13.6V8.4a.8.8 0 0 1 .8-.8h1.9a.8.8 0 0 1 .66.35l1.9 2.75a.8.8 0 0 1 .14.45V12.8a.8.8 0 0 1-.8.8h-.4"/><path d="M15 9h1l1.1 1.6H15z"/><path d="M6.4 13.6h-.2M10.2 13.6h3.6"/><path d="M6.2 11V9.2a.6.6 0 0 1 .6-.6h3.6a.6.6 0 0 1 .6.6V11"/><path d="M8.2 8.6 3.3 2.9a.5.5 0 0 0-.8.1l-.3.5 4.6 5.1"/><path d="M2.6 3.4v3.2a.9.9 0 1 0 .9.9"/><circle cx="4.2" cy="14.8" r="1.7"/><circle cx="4.2" cy="14.8" r="0.6"/><circle cx="8.3" cy="14.8" r="1.7"/><circle cx="8.3" cy="14.8" r="0.6"/><circle cx="16" cy="14.8" r="1.7"/><circle cx="16" cy="14.8" r="0.6"/>`,
  forklift: `<path d="M3 13.4H2.3a.7.7 0 0 1-.7-.7v-2.6a.7.7 0 0 1 .7-.7H6V4.7a.7.7 0 0 1 .7-.7h3.4a.7.7 0 0 1 .64.42L13.1 9.4h1.2a.7.7 0 0 1 .7.7v2.6a.7.7 0 0 1-.7.7h-.9"/><path d="M7.6 5.6h2.1l1.7 3.8H7.6z"/><path d="M6.8 13.4h2.6"/><path d="M16.4 3.2v11.6h2.6"/><path d="M15 6.6h1.4M15 12.2h1.4"/><circle cx="4.9" cy="14.4" r="1.9"/><circle cx="4.9" cy="14.4" r="0.6"/><circle cx="11.4" cy="14.4" r="1.9"/><circle cx="11.4" cy="14.4" r="0.6"/>`,
  crane: `<path d="M6.6 16.8V6.2M9.2 16.8V6.2"/><path d="M6.6 9.4l2.6 2.4M9.2 9.4l-2.6 2.4M6.6 13.6l2.6 2.4M9.2 13.6l-2.6 2.4"/><path d="M1.8 6.2h16.6"/><path d="M4 6.2 7.9 2.8l10.5 3.4"/><rect x="2" y="6.2" width="2.6" height="2" rx=".4"/><path d="M15.6 6.2v3.6"/><path d="M15.6 9.8v.9a1 1 0 1 1-1 1"/><path d="M4.6 16.8h6.6"/>`,
  engine: `<rect x="2.4" y="6" width="15.2" height="8" rx="1"/><path d="M1.6 16.4h16.8M4.4 14v2.4M15.6 14v2.4"/><rect x="4.4" y="8.2" width="4.2" height="3.6" rx=".5"/><path d="M10.8 8.6h4.6M10.8 10h4.6M10.8 11.4h4.6"/><path d="M13.6 6V3.6h2.2"/>`,
  caravan: `<rect x="4.6" y="4.8" width="13.6" height="7.8" rx=".9"/><path d="M8.6 6.6v4.2M12.6 6.6v4.2M16.4 6.6v4.2"/><path d="M4.6 11.2 2 12.8"/><circle cx="1.6" cy="13" r=".5"/><path d="M4.6 12.6h4.4M13.4 12.6h4.8"/><circle cx="11.2" cy="14.4" r="2"/><circle cx="11.2" cy="14.4" r="0.6"/>`,
  container: `<rect x="1.8" y="4.6" width="16.4" height="10.8" rx=".9"/><path d="M1.8 6.6h16.4M1.8 13.4h16.4"/><path d="M5 8.2v3.6M7.6 8.2v3.6M10.2 8.2v3.6M12.8 8.2v3.6"/><path d="M15.4 8.2v3.6"/><path d="M16.6 9.4v1.2"/>`,
  shovel: `<path d="M14.9 2.6l2.5 2.5"/><path d="M16.15 3.85 10.9 9.1"/><path d="M9.6 8.4l2 2a.8.8 0 0 1 0 1.13l-3.4 3.4a3.4 3.4 0 0 1-4.8 0 3.4 3.4 0 0 1 0-4.8l3.4-3.4a.8.8 0 0 1 1.13 0z"/>`,
  'truck-delivery': `<path d="M3.2 13.6h-1a.8.8 0 0 1-.8-.8V6.2a1.4 1.4 0 0 1 1.4-1.4h9.7a1.2 1.2 0 0 1 .94.45L16.6 8.8l1.4.6a1 1 0 0 1 .6.92V12.8a.8.8 0 0 1-.8.8h-1"/><path d="M7.2 13.6h5.4"/><path d="M3.2 6.8H8v2.6H3.2zM9.8 6.8h2.7l1.9 2.6H9.8z"/><path d="M9 9.4v2.6"/><circle cx="5.2" cy="14.4" r="1.9"/><circle cx="5.2" cy="14.4" r="0.6"/><circle cx="14.6" cy="14.4" r="1.9"/><circle cx="14.6" cy="14.4" r="0.6"/>`,
  car: `<path d="M3.4 13.6H2.2a.8.8 0 0 1-.8-.8v-1.6a1.6 1.6 0 0 1 1.3-1.57L5.4 9.1l2.5-2.75a1.6 1.6 0 0 1 1.18-.52h3.5a1.6 1.6 0 0 1 1.2.54L16 9.1l1.3.23A1.6 1.6 0 0 1 18.6 10.9v1.9a.8.8 0 0 1-.8.8h-1.2"/><path d="M7.2 13.6h5.6"/><path d="M7.2 9.1l1.8-2h1.5v2zM12 7.1h.6a.6.6 0 0 1 .45.2l1.6 1.8H12z"/><circle cx="5.3" cy="13.9" r="1.8"/><circle cx="5.3" cy="13.9" r="0.6"/><circle cx="14.7" cy="13.9" r="1.8"/><circle cx="14.7" cy="13.9" r="0.6"/>`,
  truck: `<path d="M3.3 13.6H2.3a.7.7 0 0 1-.7-.7V5.3a.8.8 0 0 1 .8-.8H12v9.1"/><path d="M12 7.2h3.3a.9.9 0 0 1 .72.36l2.2 2.9a.9.9 0 0 1 .18.54V12.9a.7.7 0 0 1-.7.7h-.6"/><path d="M13.4 8.6h1.6l1.4 2h-3z"/><path d="M7.1 13.6h6.4"/><circle cx="5.2" cy="14.4" r="1.9"/><circle cx="5.2" cy="14.4" r="0.6"/><circle cx="15.2" cy="14.4" r="1.9"/><circle cx="15.2" cy="14.4" r="0.6"/>`,
  'truck-loading': `<path d="M1.6 12.2h8.6"/><path d="M3.4 12.2v-.7a.6.6 0 0 1 .6-.6h3.8a.6.6 0 0 1 .6.6v.7"/><path d="M10.2 13.6V5.2a1 1 0 0 1 1-1h4a1 1 0 0 1 .93.63l2.1 5.2a1 1 0 0 1 .07.37V12.8a.8.8 0 0 1-.8.8h-.4"/><path d="M11.8 6h2.8l1.4 3.6h-4.2z"/><path d="M9.6 13.6h3.7"/><circle cx="3.9" cy="14.6" r="1.7"/><circle cx="3.9" cy="14.6" r="0.6"/><circle cx="7.8" cy="14.6" r="1.7"/><circle cx="7.8" cy="14.6" r="0.6"/><circle cx="15.3" cy="14.4" r="2"/><circle cx="15.3" cy="14.4" r="0.6"/>`,
  link: `<g transform="rotate(-45 10 10)"><rect x="1" y="7.8" width="7.6" height="4.4" rx="2.2"/><rect x="11.4" y="7.8" width="7.6" height="4.4" rx="2.2"/><rect x="6.2" y="9.1" width="7.6" height="1.8" rx=".9"/></g>`,
};

/** Picture for each Suitable-for value; the first matching rule wins, so specific phrases come before general ones. */
const rules: Array<[RegExp, string]> = [
  [/passenger car/i, 'car'],
  [/service vehicle/i, 'truck-delivery'],
  [/tractor unit/i, 'truck-loading'],
  [/^trucks?$/i, 'truck'],
  [/machinery & vehicles/i, 'car-crane'],
  [/special machines/i, 'crane'],
  [/lifting/i, 'forklift'],
  [/pump|generator/i, 'engine'],
  [/trailer/i, 'caravan'],
  [/container/i, 'container'],
  [/attachments & medium/i, 'shovel'],
  [/chain/i, 'link'],
];

export function TermIcon({ term, size = 32 }: { term: string | null; size?: number }) {
  const syn = term === null ? undefined : synRules.find(([re]) => re.test(term))?.[1];
  // The Syn wrench is drawn heavier and fills its box, so it is drawn smaller inside the same box (labels stay level).
  if (syn) return <Icon name={syn} size={size} className={cx('shop-term-icon', syn === 'maintenance' && 'shop-term-icon--inset')} />;
  const key = term === null ? 'all' : rules.find(([re]) => re.test(term))?.[1] ?? 'all';
  // Fixed markup from `drawn` above, never user text.
  return (
    <svg className="shop-term-icon" width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden dangerouslySetInnerHTML={{ __html: drawn[key] }} />
  );
}
