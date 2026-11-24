import { Button, EmptyState, Icon, Notification, Tooltip, type IconName } from '@syn';
import { cx } from '@syn/utils';
import { TopbarActions } from './UserMenu';
import { CartDrawer } from './CartDrawer';
import { CheckoutPage } from './pages/CheckoutPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { RequestsPage } from './pages/OrdersPage';
import { PrototypePanel } from './PrototypePanel';
import { ProductPage } from './pages/ProductPage';
import { ShopPage } from './pages/ShopPage';
import { routeHref, useShop, type Route } from './store';
import { t, useLang } from './i18n';

const crumbs: Record<Route['name'], string> = {
  shop: 'Shop', product: 'Shop / Product', checkout: 'Shop / Submit order request', confirmation: 'Shop / Order request submitted',
  requests: 'Shop / Requests',
};

/**
 * The SAM / RAM dark icon rail: Collapse, Dashboard, Equipment and Bookings belong to the rest of the platform and
 * only say so; Shop navigates, and is hidden for users without Shop access. Every item has a Syn tooltip with its name.
 * Product, category, inventory and request management live in DMS Admin, so the Shop has no admin entry.
 */
function Rail() {
  const { notify, settings } = useShop();
  const outside = (label: string) => () => notify(label, t("{0} is outside this Shop prototype.", [label]), 'info');
  const item = (icon: IconName, label: string, opts: { href?: string; active?: boolean } = {}) => (
    <Tooltip key={label} content={t(label)} placement="right">
      {opts.href ? (
        <a href={opts.href} className={cx('shop-rail__item', opts.active && 'is-active')} aria-label={t(label)} aria-current={opts.active ? 'page' : undefined}>
          <Icon name={icon} size={20} />
        </a>
      ) : (
        <button type="button" className="shop-rail__item" aria-label={t(label)} onClick={outside(t(label))}>
          <Icon name={icon} size={20} />
        </button>
      )}
    </Tooltip>
  );
  return (
    <nav className="shop-rail" aria-label={t("Platform")}>
      <span className="shop-rail__collapse">{item('navbar', 'Collapse navigation')}</span>
      <span className="shop-rail__divider" />
      {item('kanban', 'Dashboard')}
      {item('truck', 'Equipment')}
      {item('calendar', 'Bookings')}
      {settings.shopAccess && item('nav-shop', 'Shop', { href: routeHref({ name: 'shop' }), active: true })}
      <span className="shop-rail__spacer" />
    </nav>
  );
}

/** Someone without Shop access who opens a Shop link directly: the navigation entry is hidden, and this explains why. */
function NoAccess() {
  return (
    <div className="shop-no-access">
      <EmptyState variant="general" icon="admin" title={t("You don’t have access to the Shop")}>
        {t("Ask an administrator in your organisation to give you Shop access.")}
      </EmptyState>
    </div>
  );
}

function Page({ route }: { route: Route }) {
  switch (route.name) {
    case 'product': return <ProductPage key={route.id} id={route.id} />;
    case 'checkout': return <CheckoutPage />;
    case 'confirmation': return <ConfirmationPage id={route.id} />;
    case 'requests': return <RequestsPage key={`${route.tab}-${route.id ?? 'list'}`} tab={route.tab} id={route.id} />;
    default: return <ShopPage />;
  }
}

export function App() {
  // Re-render everything when the language changes; texts read the language through t().
  useLang();
  const { route, toasts, dismiss, settings } = useShop();
  return (
    <div className="syn-root shop-app">
      <Rail />
      <div className="shop-workspace">
        <header className="shop-topbar">
          <span className="shop-topbar__crumb">{settings.shopAccess ? t(crumbs[route.name]) : t("Shop")}</span>
          <span className="shop-topbar__brand" aria-label={settings.app}>{settings.app}</span>
          <TopbarActions />
        </header>
        <main className="shop-content">
          {settings.shopAccess ? <Page route={route} /> : <NoAccess />}
        </main>
      </div>
      {settings.shopAccess && <CartDrawer />}
      <PrototypePanel />
      <div className="shop-toasts">
        {toasts.map((toast) => (
          <Notification key={toast.id} variant="inline" tone={toast.tone} title={toast.title} closeLabel={t('Dismiss')} onClose={() => dismiss(toast.id)}>
            {toast.message}
            {toast.action && <Button size="xs" variant="secondary" className="shop-toast-action" onClick={() => { toast.action!.run(); dismiss(toast.id); }}>{toast.action.label}</Button>}
          </Notification>
        ))}
      </div>
    </div>
  );
}
