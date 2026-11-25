import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, DrawerRow, EmptyState, Icon, IconButton, Skeleton, StatusBadge, Tooltip, type IconName, type StatusTone } from '@syn';
import { cx } from '@syn/utils';
import { minQty, money, packSize, plural, qtyProblem, type ArtType, type Availability, type OrderStatus, type PriceRequestStatus, type Product } from './data';
import { routeHref, useShop } from './store';
import hardwareArt from './assets/device-hardware.svg';
import dotArt from './assets/device-dot.svg';
import tagsArt from './assets/device-tags.svg';
import toolArt from './assets/device-tool.svg';
import chainArt from './assets/device-chain.svg';
import qrArt from './assets/device-qr.svg';
import { t } from './i18n';

const illustrations: Record<ArtType, string> = { hardware: hardwareArt, dot: dotArt, tags: tagsArt, tool: toolArt, chain: chainArt, qr: qrArt };

/** Product image on a Smoke stage; falls back to the built-in illustration when there is no image or it fails to load. */
export function ProductArt({ src, type, alt, size = 'md', className }: {
  src?: string; type: ArtType; alt: string; size?: 'xs' | 'sm' | 'md' | 'lg' | 'tile' | 'hero'; className?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const shown = src && !failed ? src : illustrations[type];
  return (
    <div className={cx('shop-art', `shop-art--${size}`, className)}>
      <img src={shown} alt={alt} loading="lazy" onError={() => setFailed(true)} />
    </div>
  );
}

const lineIcons = {
  cart: <><path d="M4 5h2l2 10h9l2-7H7" /><circle cx="10" cy="19" r="1" /><circle cx="17" cy="19" r="1" /></>,
};

/** Cart glyph from the SAM Shop prototype, drawn like Syn's 20px line icons. Syn's icon set has none. */
export function LineIcon({ name, size = 20, className }: { name: keyof typeof lineIcons; size?: number; className?: string }) {
  return (
    <svg className={cx('shop-line-icon', className)} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {lineIcons[name]}
    </svg>
  );
}

const chipIcon: Partial<Record<string, IconName>> = { Bluetooth: 'bloetooth', 'NB-IoT': 'find-globe', GPS: 'gps-location-default', GNSS: 'gps-location-default', Video: 'video-1' };

/** Connectivity chips from the syniotec.com product tiles: small white boxes with an icon or a short label. */
export function Chips({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <ul className="shop-chips" aria-label={t("Connectivity")}>
      {items.map((c) => {
        const icon = chipIcon[c];
        return (
          <li key={c} className="shop-chip" title={c}>
            {icon && <Icon name={icon} size={16} />}
            <span className={icon === 'bloetooth' ? 'syn-visually-hidden' : undefined}>{c}</span>
          </li>
        );
      })}
    </ul>
  );
}

const availabilityTone: Record<Availability, StatusTone> = {
  Available: 'success',
  'Available on request': 'progress',
  'Temporarily unavailable': 'error',
};
export function AvailabilityBadge({ availability }: { availability: Availability }) {
  return <StatusBadge tone={availabilityTone[availability]}>{t(availability)}</StatusBadge>;
}

const orderTone: Record<OrderStatus, StatusTone> = {
  Submitted: 'neutral', Confirmed: 'info', Shipped: 'progress', Completed: 'success', Rejected: 'error', Cancelled: 'warning',
};
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <StatusBadge tone={orderTone[status]}>{t(status)}</StatusBadge>;
}

const requestTone: Record<PriceRequestStatus, StatusTone> = { Submitted: 'neutral', Responded: 'success' };
export function PriceRequestStatusBadge({ status }: { status: PriceRequestStatus }) {
  return <StatusBadge tone={requestTone[status]}>{t(status)}</StatusBadge>;
}

/** A screen's data could not be loaded: what happened and Try again, in the Syn general empty state. */
export function LoadError({ onRetry, what }: { onRetry: () => void; what: string }) {
  return (
    <EmptyState variant="general" icon="warning" title={t("{0} couldn’t be loaded", [what])} action={<Button size="sm" variant="secondary" iconStart="refresh" onClick={onRetry}>{t("Try again")}</Button>}>
      {t("Check your connection and try again. If it keeps happening, contact Syniotec support.")}
    </EmptyState>
  );
}

/** Placeholder rows while a table loads, in the Syn skeleton. */
export function TableSkeleton({ rows = 4, label }: { rows?: number; label: string }) {
  return (
    <div className="shop-skeleton-table" role="status" aria-label={label}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="shop-skeleton-table__row">
          <Skeleton width="18%" /><Skeleton width="14%" /><Skeleton width="30%" /><Skeleton width="12%" /><Skeleton width="10%" />
        </div>
      ))}
    </div>
  );
}

/**
 * Minus, the quantity and plus, with the number typeable in between. Syn has no compact number stepper, so it is built
 * from two outline IconButtons and a bare input. `min` is the product's minimum order quantity; there is no maximum.
 * Only valid quantities reach `onChange`; while the typed text is not one, the message shows under the stepper and
 * `onValidChange(false)` lets the caller hold back its action (Add to cart, Send price request, Continue).
 */
export function QuantityStepper({ value, onChange, label, size = 'sm', min = 1, onValidChange }: {
  value: number; onChange: (qty: number) => void; label: string; size?: 'xs' | 'sm'; min?: number;
  onValidChange?: (valid: boolean) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  const [focused, setFocused] = useState(false);
  // Follow outside changes (the + and − buttons, another tab) unless the person is typing.
  useEffect(() => { if (!focused) setDraft(String(value)); }, [value, focused]);
  const parsed = /^\s*\d+\s*$/.test(draft) ? Number(draft) : draft.trim() === '' ? null : NaN;
  const problem = qtyProblem({ minQty: min }, parsed);
  // Report validity only when it changes; callers may pass a new callback on every render.
  const report = useRef(onValidChange);
  report.current = onValidChange;
  useEffect(() => { report.current?.(!problem); }, [problem]);
  const commit = (n: number) => { setDraft(String(n)); onChange(n); };
  return (
    <div className="shop-qty">
      <div className={cx('shop-stepper', `shop-stepper--${size}`, problem && 'is-invalid')} role="group" aria-label={t("{0} quantity", [label])}>
        <IconButton icon="minus" label={t("Decrease {0}", [label])} size={size} variant="outline" disabled={!problem && value <= min} onClick={() => commit(Math.max(min, (problem ? value : value - 1)))} />
        <input
          className="shop-stepper__value"
          type="text"
          inputMode="numeric"
          aria-label={t("{0} quantity", [label])}
          aria-invalid={problem ? true : undefined}
          value={draft}
          size={Math.max(2, draft.length)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            const next = e.target.value;
            setDraft(next);
            const n = /^\s*\d+\s*$/.test(next) ? Number(next) : null;
            if (n !== null && !qtyProblem({ minQty: min }, n)) onChange(n);
          }}
        />
        <IconButton icon="plus" label={t("Increase {0}", [label])} size={size} variant="outline" onClick={() => commit(problem ? Math.max(min, value) : value + 1)} />
      </div>
      {problem && <span className="shop-qty__error" role="alert">{t(problem, [min])}</span>}
    </div>
  );
}

/** "Minimum order 10 pieces · Packaging unit 10 pieces", only for products where either is more than one piece. */
export function OrderUnitNote({ product: p, className }: { product: Pick<Product, 'minQty' | 'packSize'>; className?: string }) {
  const parts = [
    minQty(p) > 1 && t("Minimum order {0}", [plural(minQty(p), 'piece')]),
    packSize(p) > 1 && t("Packaging unit {0}", [plural(packSize(p), 'piece')]),
  ].filter(Boolean);
  if (!parts.length) return null;
  return <span className={cx('shop-order-unit', className)}>{parts.join(' · ')}</span>;
}

/** Shop module header: title and lead on the left; My orders / Order by SKU and the cart on the right. Inner pages pass
 * `back`, which puts the way back above the title on the left (navigation reads first) and leaves only the cart right. */
export function ShopHeader({ title, lead, back, extra }: {
  title: string; lead: string; back?: { label: string; href?: string; onClick?: () => void }; extra?: ReactNode;
}) {
  const { cartQty, setCartOpen } = useShop();
  return (
    <PageHeader
      // The landing page's title already says Shop, as does the top bar; the eyebrow only adds context on other pages.
      eyebrow={title === 'Shop' || back ? undefined : t("Syniotec Shop")}
      before={back && <BackLink href={back.href} onClick={back.onClick}>{back.label}</BackLink>}
      title={title}
      lead={lead}
      actions={<>
        {!back && <LinkButton href={routeHref({ name: 'requests', tab: 'orders' })} iconStart="history" variant="text">{t("Requests")}</LinkButton>}
        {extra}
        {/* Icon-only cart: the count sits in a badge on the top-right corner, as in most shop headers. */}
        <Tooltip content={t("Cart")} placement="bottom" className="shop-cart-tip">
          <button type="button" className="shop-cart-button" onClick={() => setCartOpen(true)} aria-label={cartQty ? t("Cart, {0}", [plural(cartQty, 'item')]) : t("Cart")}>
            <LineIcon name="cart" size={20} />
            {cartQty > 0 && <span className="shop-count" aria-hidden>{cartQty > 99 ? '99+' : cartQty}</span>}
          </button>
        </Tooltip>
      </>}
    />
  );
}

export function PageHeader({ eyebrow, before, title, lead, actions }: {
  eyebrow?: string; before?: ReactNode; title: ReactNode; lead?: ReactNode; actions?: ReactNode;
}) {
  return (
    <header className="shop-page-head">
      <div>
        {before}
        {eyebrow && <p className="shop-eyebrow">{eyebrow}</p>}
        {/* The landing page's name is already in the top bar, so its h1 is for screen readers only. */}
        <h1 className={title === 'Shop' ? 'syn-visually-hidden' : 'shop-page-head__title'}>{title}</h1>
        {lead && <p className="shop-page-head__lead">{lead}</p>}
      </div>
      {actions && <div className="shop-page-head__actions">{actions}</div>}
    </header>
  );
}

/** A navigation link drawn as a Syn secondary button. */
export function LinkButton({ href, iconStart, children, variant = 'secondary' }: {
  href: string; iconStart?: IconName; children: ReactNode; variant?: 'secondary' | 'text';
}) {
  return (
    <a href={href} className={cx('syn-button', `syn-button--${variant}`, 'syn-button--sm', 'shop-link-button')}>
      {iconStart && <Icon name={iconStart} size={16} />}
      <span className="syn-button__label">{children}</span>
    </a>
  );
}

/** The way back, top-left above a page title: a link, or a button when going back opens something (the cart). */
export function BackLink({ href, onClick, children }: { href?: string; onClick?: () => void; children: ReactNode }) {
  if (onClick) {
    return <button type="button" className="shop-back" onClick={onClick}><Icon name="back" size={16} />{children}</button>;
  }
  return (
    <a className="shop-back" href={href}>
      <Icon name="back" size={16} />
      {children}
    </a>
  );
}

/** Label / value rows: specifications and order information. */
export function SpecList({ rows, empty }: { rows: Array<[string, ReactNode]>; empty?: string }) {
  if (!rows.length) return <p className="shop-muted">{empty}</p>;
  return (
    <dl className="shop-specs">
      {rows.map(([k, v], i) => (
        <div key={`${k}-${i}`} className="shop-specs__row"><dt>{t(k)}</dt><dd>{typeof v === 'string' ? t(v) : v}</dd></div>
      ))}
    </dl>
  );
}

/** Subtotal, VAT, delivery and total. */
export function Summary({ total, subtotal = true }: { total: number; subtotal?: boolean }) {
  return (
    <dl className="shop-summary">
      {subtotal && <div><dt>{t("Subtotal")}</dt><dd>{money(total)}</dd></div>}
      <div><dt>{t("VAT")}</dt><dd>{t("Excluded")}</dd></div>
      {subtotal && <div><dt>{t("Delivery")}</dt><dd>{t("Arranged by Syniotec")}</dd></div>}
      <div className="shop-summary__total"><dt>{t("Total")}</dt><dd>{money(total)}</dd></div>
    </dl>
  );
}

/** An inline hint with the Syn info icon, used for the "no online payment" and commissioning notes. */
export function InfoNote({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'warning' }) {
  return (
    <p className={cx('shop-note', `shop-note--${tone}`)}>
      <Icon name={tone === 'warning' ? 'warning' : 'info-circle'} size={16} />
      <span>{children}</span>
    </p>
  );
}

/**
 * Drawers follow the Syn record drawer: the 64px header carries context (an icon and a label, or a status and an
 * id) and the title with its description is the first row of the body, not squeezed into the header.
 */
export function DrawerContext({ icon, children }: { icon: IconName | 'cart'; children: ReactNode }) {
  return <span className="shop-drawer-context">{icon === 'cart' ? <LineIcon name="cart" size={16} /> : <Icon name={icon} size={16} />}{children}</span>;
}

/** Header of a task drawer (Quick order, Cart): just its name, Favorit Medium 16 in Silver Chalice. */
export function DrawerLabel({ children }: { children: ReactNode }) {
  return <span className="shop-drawer-label">{children}</span>;
}

/** One-line intro under a task drawer's header, in the description style and with no divider below. */
export function DrawerIntro({ children }: { children: ReactNode }) {
  return <DrawerRow className="shop-drawer-heading shop-drawer-heading--flush"><p className="shop-drawer-heading__lead">{children}</p></DrawerRow>;
}

export function DrawerTitle({ title, lead, end }: { title: ReactNode; lead?: ReactNode; end?: ReactNode }) {
  return (
    <DrawerRow end={end} className="shop-drawer-heading">
      <div>
        <h2 className="shop-drawer-heading__title">{title}</h2>
        {lead && <p className="shop-drawer-heading__lead">{lead}</p>}
      </div>
    </DrawerRow>
  );
}
