import { useId } from 'react';
import { getIcon, type IconName } from '@syn';

/*
 * Icons for the Suitable-for bar. Syn's own icons come first where the set has the picture (dozer, compactor, tractor,
 * boxes, wrench, ignition key). Syn has no trucks, cranes, forklifts, trailers, containers, generators or chains, so
 * those are drawn here in Syn's style: the same 20 × 20 grid, an outline with round caps and joins, side views with
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
  [/^smaller mobile assets$/i, 'inventory'],
  [/tools/i, 'maintenance'],
];

/** Drawn in Syn style on a 20 × 20 grid (inner SVG markup, outlines only). */
/**
 * Drawn in Syn style on a 20 × 20 grid (inner SVG markup, outlines only). `accent` is the detail that turns brand red
 * when the category is selected; `fit` is [scale, x, y] that sizes and places the drawing (see `fits` below).
 */
const drawn: Record<string, { fit: Fit; base: string; accent: string }> = {
  all: { fit: [1.039, -0.39, -0.39], base: `<rect x="2.8" y="2.8" width="6" height="6" rx="1.2"/><rect x="2.8" y="11.2" width="6" height="6" rx="1.2"/><rect x="11.2" y="11.2" width="6" height="6" rx="1.2"/>`, accent: `<rect x="11.2" y="2.8" width="6" height="6" rx="1.2"/>` },
  'car-crane': { fit: [0.995, -0.1, -0.01], base: `<path d="M2.1 13.6H1.9a.6.6 0 0 1-.6-.6v-1.4a.6.6 0 0 1 .6-.6H13.6"/><path d="M13.6 13.6V8.4a.8.8 0 0 1 .8-.8h1.9a.8.8 0 0 1 .66.35l1.9 2.75a.8.8 0 0 1 .14.45V12.8a.8.8 0 0 1-.8.8h-.4"/><path d="M15 9h1l1.1 1.6H15z"/><path d="M6.4 13.6h-.2M10.2 13.6h3.6"/><path d="M6.2 11V9.2a.6.6 0 0 1 .6-.6h3.6a.6.6 0 0 1 .6.6V11"/><circle cx="4.2" cy="14.8" r="1.7"/><circle cx="4.2" cy="14.8" r="0.6"/><circle cx="8.3" cy="14.8" r="1.7"/><circle cx="8.3" cy="14.8" r="0.6"/><circle cx="16" cy="14.8" r="1.7"/><circle cx="16" cy="14.8" r="0.6"/>`, accent: `<path d="M8.2 8.6 3.3 2.9a.5.5 0 0 0-.8.1l-.3.5 4.6 5.1"/><path d="M2.6 3.4v3.2a.9.9 0 1 0 .9.9"/>` },
  forklift: { fit: [1.011, -0.41, -0.08], base: `<path d="M3 13.4H2.3a.7.7 0 0 1-.7-.7v-2.6a.7.7 0 0 1 .7-.7H6V4.7a.7.7 0 0 1 .7-.7h3.4a.7.7 0 0 1 .64.42L13.1 9.4h1.2a.7.7 0 0 1 .7.7v2.6a.7.7 0 0 1-.7.7h-.9"/><path d="M7.6 5.6h2.1l1.7 3.8H7.6z"/><path d="M6.8 13.4h2.6"/><circle cx="4.9" cy="14.4" r="1.9"/><circle cx="4.9" cy="14.4" r="0.6"/><circle cx="11.4" cy="14.4" r="1.9"/><circle cx="11.4" cy="14.4" r="0.6"/>`, accent: `<path d="M16.4 3.2v11.6h2.6"/><path d="M15 6.6h1.4M15 12.2h1.4"/>` },
  crane: { fit: [0.909, 0.82, 1.09], base: `<path d="M6.6 16.8V6.2M9.2 16.8V6.2"/><path d="M6.6 9.4l2.6 2.4M9.2 9.4l-2.6 2.4M6.6 13.6l2.6 2.4M9.2 13.6l-2.6 2.4"/><path d="M1.8 6.2h16.6"/><path d="M4 6.2 7.9 2.8l10.5 3.4"/><rect x="2" y="6.2" width="2.6" height="2" rx=".4"/><path d="M4.6 16.8h6.6"/>`, accent: `<path d="M15.6 6.2v3.6"/><path d="M15.6 9.8v.9a1 1 0 1 1-1 1"/>` },
  engine: { fit: [1.045, -0.45, -0.76], base: `<rect x="2.4" y="6" width="15.2" height="8" rx="1"/><path d="M1.6 16.4h16.8M4.4 14v2.4M15.6 14v2.4"/><path d="M10.8 8.6h4.6M10.8 10h4.6M10.8 11.4h4.6"/><path d="M13.6 6V3.6h2.2"/>`, accent: `<rect x="4.4" y="8.2" width="4.2" height="3.6" rx=".5"/>` },
  caravan: { fit: [1.028, 0.08, -0.47], base: `<rect x="4.6" y="4.8" width="13.6" height="7.8" rx=".9"/><path d="M8.6 6.6v4.2M12.6 6.6v4.2M16.4 6.6v4.2"/><path d="M4.6 12.6h4.4M13.4 12.6h4.8"/><circle cx="11.2" cy="14.4" r="2"/><circle cx="11.2" cy="14.4" r="0.6"/>`, accent: `<path d="M4.6 11.2 2 12.8"/><circle cx="1.6" cy="13" r=".5"/>` },
  container: { fit: [1.069, -0.69, -0.1], base: `<rect x="1.8" y="4.6" width="16.4" height="10.8" rx=".9"/><path d="M1.8 6.6h16.4M1.8 13.4h16.4"/><path d="M5 8.2v3.6M7.6 8.2v3.6M10.2 8.2v3.6M12.8 8.2v3.6"/>`, accent: `<path d="M15.4 8.2v3.6"/><path d="M16.6 9.4v1.2"/>` },
  mixer: { fit: [1.019, -0.09, 0.27], base: `<path d="M3 13.6h10.4"/><path d="M5 13.6v3"/><path d="M13.4 13.6l3.4-3"/><path d="M9.4 11.2v2.4"/><circle cx="13.2" cy="15.2" r="1.7"/><circle cx="13.2" cy="15.2" r="0.6"/>`, accent: `<path d="M3.6 9.6 4.9 5.4a1 1 0 0 1 .7-.67l6.3-1.9a1 1 0 0 1 1.18.53l1.9 4a1 1 0 0 1-.38 1.27l-5.4 3.3a1 1 0 0 1-.85.1l-4.1-1.3a1 1 0 0 1-.65-1.23z"/><path d="M13.2 3.2l2.3-1"/><path d="M7 5.6l2.6 4.6"/>` },
  shovel: { fit: [1.0, 0.1, 0.72], base: `<path d="M14.9 2.6l2.5 2.5"/><path d="M16.15 3.85 10.9 9.1"/>`, accent: `<path d="M9.6 8.4l2 2a.8.8 0 0 1 0 1.13l-3.4 3.4a3.4 3.4 0 0 1-4.8 0 3.4 3.4 0 0 1 0-4.8l3.4-3.4a.8.8 0 0 1 1.13 0z"/>` },
  'truck-delivery': { fit: [1.022, -0.22, -0.27], base: `<path d="M3.2 13.6h-1a.8.8 0 0 1-.8-.8V6.2a1.4 1.4 0 0 1 1.4-1.4h9.7a1.2 1.2 0 0 1 .94.45L16.6 8.8l1.4.6a1 1 0 0 1 .6.92V12.8a.8.8 0 0 1-.8.8h-1"/><path d="M7.2 13.6h5.4"/><path d="M9 9.4v2.6"/><circle cx="5.2" cy="14.4" r="1.9"/><circle cx="5.2" cy="14.4" r="0.6"/><circle cx="14.6" cy="14.4" r="1.9"/><circle cx="14.6" cy="14.4" r="0.6"/>`, accent: `<path d="M3.2 6.8H8v2.6H3.2zM9.8 6.8h2.7l1.9 2.6H9.8z"/>` },
  car: { fit: [1.022, -0.22, 0.34], base: `<path d="M3.4 13.6H2.2a.8.8 0 0 1-.8-.8v-1.6a1.6 1.6 0 0 1 1.3-1.57L5.4 9.1l2.5-2.75a1.6 1.6 0 0 1 1.18-.52h3.5a1.6 1.6 0 0 1 1.2.54L16 9.1l1.3.23A1.6 1.6 0 0 1 18.6 10.9v1.9a.8.8 0 0 1-.8.8h-1.2"/><path d="M7.2 13.6h5.6"/><circle cx="5.3" cy="13.9" r="1.8"/><circle cx="5.3" cy="13.9" r="0.6"/><circle cx="14.7" cy="13.9" r="1.8"/><circle cx="14.7" cy="13.9" r="0.6"/>`, accent: `<path d="M7.2 9.1l1.8-2h1.5v2zM12 7.1h.6a.6.6 0 0 1 .45.2l1.6 1.8H12z"/>` },
  truck: { fit: [1.045, -0.45, -0.66], base: `<path d="M3.3 13.6H2.3a.7.7 0 0 1-.7-.7V5.3a.8.8 0 0 1 .8-.8H12v9.1"/><path d="M12 7.2h3.3a.9.9 0 0 1 .72.36l2.2 2.9a.9.9 0 0 1 .18.54V12.9a.7.7 0 0 1-.7.7h-.6"/><path d="M7.1 13.6h6.4"/><circle cx="5.2" cy="14.4" r="1.9"/><circle cx="5.2" cy="14.4" r="0.6"/><circle cx="15.2" cy="14.4" r="1.9"/><circle cx="15.2" cy="14.4" r="0.6"/>`, accent: `<path d="M13.4 8.6h1.6l1.4 2h-3z"/>` },
  'truck-loading': { fit: [1.051, -0.46, -0.86], base: `<path d="M1.6 12.2h8.6"/><path d="M10.2 13.6V5.2a1 1 0 0 1 1-1h4a1 1 0 0 1 .93.63l2.1 5.2a1 1 0 0 1 .07.37V12.8a.8.8 0 0 1-.8.8h-.4"/><path d="M11.8 6h2.8l1.4 3.6h-4.2z"/><path d="M9.6 13.6h3.7"/><circle cx="3.9" cy="14.6" r="1.7"/><circle cx="3.9" cy="14.6" r="0.6"/><circle cx="7.8" cy="14.6" r="1.7"/><circle cx="7.8" cy="14.6" r="0.6"/><circle cx="15.3" cy="14.4" r="2"/><circle cx="15.3" cy="14.4" r="0.6"/>`, accent: `<path d="M3.4 12.2v-.7a.6.6 0 0 1 .6-.6h3.8a.6.6 0 0 1 .6.6v.7"/>` },
  link: { fit: [1.067, -0.67, -0.67], base: `<rect x="1" y="7.8" width="7.6" height="4.4" rx="2.2"/><rect x="11.4" y="7.8" width="7.6" height="4.4" rx="2.2"/>`, accent: `<rect x="6.2" y="9.1" width="7.6" height="1.8" rx=".9"/>` },
};

/** Picture for each Suitable-for value; the first matching rule wins, so specific phrases come before general ones. */
const rules: Array<[RegExp, string]> = [
  [/passenger car/i, 'car'],
  [/service vehicle/i, 'truck-delivery'],
  [/tractor unit/i, 'truck-loading'],
  [/^trucks?$/i, 'truck'],
  [/construction vehicles/i, 'car-crane'],
  [/special machines/i, 'crane'],
  [/lifting/i, 'forklift'],
  [/pump|generator/i, 'engine'],
  [/trailer/i, 'caravan'],
  [/container/i, 'container'],
  [/^attachments$/i, 'shovel'],
  [/medium-sized devices/i, 'mixer'],
  [/chain/i, 'link'],
];

/*
 * One look for the whole row, measured from the rendered icons:
 * - Size and place (`fit`, [scale, x, y]): side views of machines and vehicles are 18.6 wide and stand on one ground
 *   line at y 16.9; square pictures (tiles, boxes, chain, spade, tower crane, wrench) are 16 × 16 and centred.
 * - Line weight 1.0 on the 20 grid after scaling. Syn's icons are filled outlines drawn at different weights (the
 *   compactor 0.45, the key 1.25): thin ones get a matching outline added, heavy ones are eroded by the difference.
 * - Selected: black, with one detail in brand red (`.shop-term-icon__accent`). Syn's icons are one shape, so their
 *   detail is cut out of a second, red copy with `clip` ([x, y, width, height] in the icon's own grid).
 */
type Fit = [number, number, number];
const WEIGHT = 1;
const synLook: Record<string, { weight: number; fit: Fit; clip: [number, number, number, number] }> = {
  equipment: { weight: 0.8, fit: [0.93, 0.7, 1.32], clip: [16.7, 6, 3.4, 11] },
  'navbar-2': { weight: 0.45, fit: [1.003, 0, -0.15], clip: [12.9, 10.4, 7, 7] },
  categories: { weight: 0.65, fit: [0.93, 0.7, 1.09], clip: [12.2, 8.6, 7.8, 8.8] },
  inventory: { weight: 1.15, fit: [1.013, -0.13, -0.13], clip: [5, 1.5, 10, 7.92] },
  'ignition-key': { weight: 1.25, fit: [0.944, 0.56, 0.56], clip: [15.8, 8.6, 2.8, 2.8] },
  maintenance: { weight: 1.2, fit: [0.8, 2, 2], clip: [0, 0, 7.4, 7.4] },
};

const transform = ([k, x, y]: Fit) => `translate(${x} ${y}) scale(${k})`;

/** A Syn icon drawn at the row's weight, plus a clipped copy that carries the red detail. Fixed markup, never user text. */
function synMarkup(name: IconName, uid: string) {
  const look = synLook[name];
  const body = getIcon(name).body;
  const delta = Math.round((WEIGHT / look.fit[0] - look.weight) * 1000) / 1000;
  const filter = delta < 0 ? `<filter id="e${uid}"><feMorphology operator="erode" radius="${-delta / 2}"/></filter>` : '';
  const weighted = delta > 0
    ? `<g stroke="currentColor" stroke-width="${delta}" stroke-linejoin="round">${body}</g>`
    : delta < 0 ? `<g filter="url(#e${uid})">${body}</g>` : body;
  const [x, y, w, h] = look.clip;
  return `<defs>${filter}<clipPath id="c${uid}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs>`
    + `<g transform="${transform(look.fit)}">${weighted}<g class="shop-term-icon__accent" clip-path="url(#c${uid})">${weighted}</g></g>`;
}

export function TermIcon({ term, size = 32 }: { term: string | null; size?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const syn = term === null ? undefined : synRules.find(([re]) => re.test(term))?.[1];
  if (syn) {
    return <svg className="shop-term-icon" width={size} height={size} viewBox="0 0 20 20" aria-hidden dangerouslySetInnerHTML={{ __html: synMarkup(syn, uid) }} />;
  }
  const icon = drawn[term === null ? 'all' : rules.find(([re]) => re.test(term))?.[1] ?? 'all'];
  // Fixed markup from `drawn` above, never user text.
  const inner = `<g transform="${transform(icon.fit)}" stroke-width="${Math.round((WEIGHT / icon.fit[0]) * 1000) / 1000}">${icon.base}<g class="shop-term-icon__accent">${icon.accent}</g></g>`;
  return (
    <svg className="shop-term-icon" width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden dangerouslySetInnerHTML={{ __html: inner }} />
  );
}
