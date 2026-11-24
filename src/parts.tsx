import { useEffect, useState, type ReactNode } from 'react';
import { DrawerRow, Icon, IconButton, StatusBadge, Tooltip, type IconName, type StatusTone } from '@syn';
import { cx } from '@syn/utils';
import { money, plural, type ArtType, type Availability, type OrderStatus } from './data';
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

/** Shop in the platform navigation: SAM's own 20px navigation icon (a shopping bag), filled in currentColor. */
export function ShopNavIcon({ size = 20 }: { size?: number }) {
  return (
    <svg className="shop-line-icon" width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path fill="currentColor" d="M13.5054 6.98282V5.50547C13.5054 4.57576 13.1361 3.68413 12.4787 3.02673C11.8213 2.36932 10.9297 2 9.99995 2C9.07024 2 8.17861 2.36932 7.52121 3.02673C6.86381 3.68413 6.49448 4.57576 6.49448 5.50547V9.01093C6.49448 9.14375 6.54724 9.27112 6.64116 9.36504C6.73507 9.45895 6.86245 9.51171 6.99526 9.51171C7.12808 9.51171 7.25545 9.45895 7.34937 9.36504C7.44328 9.27112 7.49604 9.14375 7.49604 9.01093V7.98438H11.5023V6.98282H7.49604V5.50547C7.49604 4.84139 7.75985 4.20451 8.22942 3.73494C8.69899 3.26537 9.33587 3.00156 9.99995 3.00156C10.664 3.00156 11.3009 3.26537 11.7705 3.73494C12.24 4.20451 12.5039 4.84139 12.5039 5.50547V8.98594C12.5039 9.11876 12.5566 9.24613 12.6505 9.34005C12.7444 9.43396 12.8718 9.48672 13.0046 9.48672C13.1374 9.48672 13.2648 9.43396 13.3587 9.34005C13.4527 9.24613 13.5054 9.11876 13.5054 8.98594V7.98438H16.0093V16.9984H3.99058V7.98438H5.49292V6.98282H2.98901V17.0435C2.98901 17.2972 3.08978 17.5405 3.26916 17.7199C3.44853 17.8992 3.69181 18 3.94548 18H16.0544C16.3081 18 16.5514 17.8992 16.7307 17.7199C16.9101 17.5405 17.0109 17.2972 17.0109 17.0435V6.98282H13.5054Z" />
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
  Submitted: 'neutral', Confirmed: 'info', Processing: 'progress', Shipped: 'info', Completed: 'success', Cancelled: 'error',
};
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <StatusBadge tone={orderTone[status]}>{t(status)}</StatusBadge>;
}

/** Minus, the quantity and plus. Syn has no number stepper yet, so it is built from two outline IconButtons. */
export function QuantityStepper({ value, onChange, label, size = 'sm' }: {
  value: number; onChange: (qty: number) => void; label: string; size?: 'xs' | 'sm';
}) {
  return (
    <div className={cx('shop-stepper', `shop-stepper--${size}`)} role="group" aria-label={t("{0} quantity", [label])}>
      <IconButton icon="minus" label={t("Decrease {0}", [label])} size={size} variant="outline" disabled={value <= 1} onClick={() => onChange(value - 1)} />
      <output className="shop-stepper__value" aria-live="polite">{value}</output>
      <IconButton icon="plus" label={t("Increase {0}", [label])} size={size} variant="outline" disabled={value >= 999} onClick={() => onChange(value + 1)} />
    </div>
  );
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
        {!back && <LinkButton href={routeHref({ name: 'orders' })} iconStart="history" variant="text">{t("My orders")}</LinkButton>}
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
      {subtotal && <div><dt>{t("Delivery")}</dt><dd>{t("Confirmed separately")}</dd></div>}
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
