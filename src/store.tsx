import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { NotificationTone } from '@syn';
import {
  CURRENT_USER, canOrder, defaultProducts, plural, seedOrders, seedPriceRequests, stamp,
  type CartLine, type Order, type PriceRequest, type Product,
} from './data';
import { t } from './i18n';

export type RequestsTab = 'orders' | 'price-requests';
export type Route =
  | { name: 'shop' }
  | { name: 'product'; id: string }
  | { name: 'checkout' }
  | { name: 'confirmation'; id: string }
  | { name: 'requests'; tab: RequestsTab; id?: string };

export interface Toast {
  id: number;
  tone: NotificationTone;
  title: string;
  message: string;
  /** "View cart" after adding products, "Try again" after a failed submission. */
  action?: { label: string; run: () => void };
}

/**
 * Hash routes, so the browser's back button and reloads keep the page: #/product/EDGE, #/requests/orders,
 * #/requests/orders/SO-2026-00124, #/requests/price-requests. The old #/orders and #/admin links still land somewhere.
 */
export function parseRoute(hash: string): Route {
  const [name, arg, id] = hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
  if (name === 'product' && arg) return { name, id: arg };
  if (name === 'checkout') return { name };
  if (name === 'confirmation' && arg) return { name, id: arg };
  if (name === 'requests') return arg === 'price-requests' ? { name, tab: arg } : { name, tab: 'orders', id: id || undefined };
  if (name === 'orders') return { name: 'requests', tab: 'orders', id: arg || undefined };
  return { name: 'shop' };
}

export function routeHref(r: Route): string {
  if (r.name === 'requests') return `#/requests/${r.tab}${r.id ? `/${encodeURIComponent(r.id)}` : ''}`;
  const arg = 'id' in r ? r.id : undefined;
  return `#/${r.name}${arg ? `/${encodeURIComponent(arg)}` : ''}`;
}

/** Switches for the prototype only: which application it runs in and which states to show. Not part of the product. */
export interface DemoSettings {
  app: 'SAM' | 'RAM';
  shopAccess: boolean;
  slowLoading: boolean;
  loadError: boolean;
  failNextSubmit: boolean;
}
const defaultSettings: DemoSettings = { app: 'SAM', shopAccess: true, slowLoading: false, loadError: false, failNextSubmit: false };

// v4: V1 scope (product status, new order states, organisation-wide requests), so older stored data is not reused.
const VERSION = 'syn-shop-v4';
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${VERSION}:${key}`);
    return raw ? (JSON.parse(raw) as T) : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(`${VERSION}:${key}`, JSON.stringify(value));
  } catch {
    // Storage can be full or blocked; the demo keeps working in memory.
  }
}

function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => load(key, fallback));
  useEffect(() => save(key, value), [key, value]);
  return [value, setValue] as const;
}

/**
 * A cart line as the cart and checkout show it. `ok` lines are ordered and counted in the total; an `unavailable`
 * product can't be ordered right now, an `archived` one is no longer offered. Both stay visible until removed.
 */
export interface CartItem extends CartLine {
  product?: Product;
  name: string;
  state: 'ok' | 'unavailable' | 'archived';
  /** The price is different from when the line was added. */
  priceChanged: boolean;
}

/** Details the checkout sends with an order request. */
export interface OrderDetails {
  contactName: string;
  email: string;
  phone: string;
  address: string;
  billing: string;
  reference: string;
  comment: string;
}

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

function useShopState() {
  const [products, setProducts] = useStored<Product[]>('products', defaultProducts);
  const [orders, setOrders] = useStored<Order[]>('orders', seedOrders);
  const [cart, setCart] = useStored<CartLine[]>('cart', []);
  const [requests, setRequests] = useStored<PriceRequest[]>('price-requests', seedPriceRequests);
  const [settings, setSettings] = useStored<DemoSettings>('demo', defaultSettings);
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));
  const [cartOpen, setCartOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const onHash = () => {
      setRoute(parseRoute(window.location.hash));
      setCartOpen(false);
      // A warning about the page you just left ("1 field still needs your input") is stale on the next one.
      setToasts((list) => list.filter((t) => t.tone === 'success' || t.tone === 'info'));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = useCallback((r: Route) => {
    window.location.hash = routeHref(r);
  }, []);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);
  const notify = useCallback((title: string, message: string, tone: NotificationTone = 'success', action?: Toast['action']) => {
    const id = Date.now() + Math.random();
    // One toast at a time: stacked toasts cover the order summary and repeat themselves.
    setToasts([{ id, tone, title, message, action }]);
    // Errors stay until dismissed or acted on; the rest fade.
    if (tone !== 'error') window.setTimeout(() => dismiss(id), action ? 6000 : 4000);
  }, [dismiss]);
  const viewCart = useMemo(() => ({ label: t("View cart"), run: () => setCartOpen(true) }), []);

  const lines = useMemo<CartItem[]>(
    () => cart.map((c) => {
      const product = products.find((p) => p.id === c.productId);
      const state: CartItem['state'] = !product || product.status !== 'Published' ? 'archived' : canOrder(product) ? 'ok' : 'unavailable';
      return { ...c, product, name: product?.name ?? c.productId, state, priceChanged: state === 'ok' && c.price !== undefined && c.price !== product!.price };
    }),
    [cart, products],
  );
  const orderable = lines.filter((l) => l.state === 'ok');
  const cartQty = lines.reduce((n, l) => n + l.qty, 0);
  const cartTotal = orderable.reduce((n, l) => n + l.qty * l.product!.price, 0);
  const cartBlocked = lines.some((l) => l.state !== 'ok');
  const priceChanged = lines.some((l) => l.priceChanged);

  /** Adds several lines at once (quick order, order again); returns how many products were added. */
  const addLines = useCallback((items: Array<{ product: Product; qty: number }>) => {
    const ok = items.filter((i) => canOrder(i.product) && i.qty > 0);
    setCart((list) => {
      const next = [...list];
      for (const { product, qty } of ok) {
        const i = next.findIndex((l) => l.productId === product.id);
        if (i >= 0) next[i] = { ...next[i], qty: Math.min(999, next[i].qty + qty) };
        else next.push({ productId: product.id, qty: Math.min(999, qty), price: product.price });
      }
      return next;
    });
    return ok.length;
  }, [setCart]);

  const addToCart = useCallback((p: Product, qty = 1) => {
    if (!addLines([{ product: p, qty }])) {
      notify(t("{0} can’t be ordered right now", [p.name]), t("It is unavailable or has no published price. Request a price instead."), 'warning');
      return;
    }
    notify(t("{0} × {1} added to your cart", [qty, p.name]), t("Prices are excl. VAT. You can change quantities before sending the order request."), 'success', viewCart);
  }, [addLines, notify, viewCart]);

  /** Order again: the earlier order's products at today's prices and availability; the rest is left out and named. */
  const reorder = useCallback((order: Order) => {
    const found = order.items.map((i) => ({ item: i, product: products.find((p) => p.id === i.id) }));
    const archived = found.filter((f) => !f.product || f.product.status !== 'Published');
    const unavailable = found.filter((f) => f.product && f.product.status === 'Published' && !canOrder(f.product));
    const ok = found.filter((f) => f.product && canOrder(f.product));
    const added = addLines(ok.map((f) => ({ product: f.product!, qty: f.item.qty })));
    const changed = ok.some((f) => f.product!.price !== f.item.price);
    if (!added) {
      notify(t("Nothing could be added"), t("None of the products from {0} can be ordered right now.", [order.id]), 'warning');
      return;
    }
    const left = [
      archived.length ? t("{0} no longer offered", [archived.map((f) => f.item.name).join(', ')]) : '',
      unavailable.length ? t("{0} not available right now", [unavailable.map((f) => f.item.name).join(', ')]) : '',
    ].filter(Boolean).join('; ');
    notify(
      t("{0} from {1} added to your cart", [plural(added, 'product'), order.id]),
      [left && t("Left out: {0}.", [left]), changed ? t("Some prices have changed since this order; the cart shows today’s prices.") : t("Same quantities as last time, at today’s prices.")].filter(Boolean).join(' '),
      left || changed ? 'warning' : 'success',
      viewCart,
    );
    setCartOpen(true);
  }, [addLines, notify, products, viewCart]);

  const requestPrice = useCallback((p: Product, qty: number, note: string) => {
    const now = stamp();
    setRequests((list) => [{
      id: `PR-${now.year}-${String(list.length + 33).padStart(4, '0')}`, productId: p.id, productName: p.name, qty, note,
      date: now.both, requestedBy: CURRENT_USER.name, email: CURRENT_USER.email, phone: CURRENT_USER.phone, status: 'Submitted',
    }, ...list]);
    notify(t("Price request sent"), t("Syniotec will reply with a price for {0} × {1} by email. You can follow it under Requests.", [qty, p.name]), 'success',
      { label: t("View requests"), run: () => { window.location.hash = routeHref({ name: 'requests', tab: 'price-requests' }); } });
  }, [notify, setRequests]);

  const setQty = useCallback((productId: string, qty: number) => {
    setCart((list) => list.map((l) => (l.productId === productId ? { ...l, qty: Math.max(1, Math.min(999, qty)) } : l)));
  }, [setCart]);
  const removeFromCart = useCallback((productId: string) => setCart((list) => list.filter((l) => l.productId !== productId)), [setCart]);

  /**
   * Sends the cart as an order request. Rejects when the submission fails (the prototype's "Fail the next submission"
   * switch); the cart and the form stay as they were so the customer can try again.
   */
  const submitOrder = useCallback(async (details: OrderDetails) => {
    await wait(700);
    if (settings.failNextSubmit) {
      setSettings((s) => ({ ...s, failNextSubmit: false }));
      throw new Error('submit-failed');
    }
    const now = stamp();
    const id = `SO-${now.year}-${String(orders.length + 126).padStart(5, '0')}`;
    const order: Order = {
      id, date: now.date, time: now.time, orderedBy: CURRENT_USER.name, org: CURRENT_USER.company, ...details,
      items: orderable.map((l) => ({ id: l.product!.id, name: l.product!.name, qty: l.qty, price: l.product!.price, type: l.product!.type, image: l.product!.image })),
      total: cartTotal, status: 'Submitted', history: [['Submitted', now.both]],
    };
    setOrders((list) => [order, ...list]);
    setCart([]);
    return id;
  }, [cartTotal, orderable, orders.length, setCart, setOrders, setSettings, settings.failNextSubmit]);

  /** Customers can cancel only while the order is Submitted; after that they contact Syniotec. */
  const cancelOrder = useCallback((id: string) => {
    const now = stamp();
    setOrders((list) => list.map((o) => (o.id === id && o.status === 'Submitted'
      ? { ...o, status: 'Cancelled', reason: t("Cancelled by {0} in the Shop.", [CURRENT_USER.name]), history: [...o.history, ['Cancelled', now.both]] }
      : o)));
    notify(t("Order {0} cancelled", [id]), t("Syniotec will not process this order request."), 'success');
  }, [notify, setOrders]);

  // Prototype controls: show the states the V1 scope asks for without a backend.
  const updateSettings = useCallback((patch: Partial<DemoSettings>) => setSettings((s) => ({ ...s, ...patch })), [setSettings]);
  const simulatePriceChange = useCallback(() => {
    const target = orderable[0]?.product ?? products.find((p) => p.id === 'CORE')!;
    const price = Math.round(target.price * 1.08 * 10) / 10;
    setProducts((list) => list.map((p) => (p.id === target.id ? { ...p, price } : p)));
    notify(t("Prototype: price changed"), t("{0} now costs {1}.", [target.name, price.toFixed(2)]), 'info');
  }, [notify, orderable, products, setProducts]);
  const simulateUnavailable = useCallback(() => {
    const target = orderable[0]?.product;
    if (!target) { notify(t("Prototype: cart is empty"), t("Add a product to the cart first."), 'info'); return; }
    setProducts((list) => list.map((p) => (p.id === target.id ? { ...p, availability: 'Temporarily unavailable' } : p)));
    notify(t("Prototype: product unavailable"), t("{0} is now temporarily unavailable.", [target.name]), 'info');
  }, [notify, orderable, setProducts]);
  const reset = useCallback(() => {
    setProducts(structuredClone(defaultProducts));
    setOrders(structuredClone(seedOrders));
    setRequests(structuredClone(seedPriceRequests));
    setCart([]);
    setSettings(structuredClone(defaultSettings));
  }, [setCart, setOrders, setProducts, setRequests, setSettings]);

  return {
    products, orders, cart: lines, cartQty, cartTotal, cartBlocked, priceChanged, addToCart, addLines, reorder, setQty, removeFromCart,
    requests, requestPrice, submitOrder, cancelOrder,
    route, go, cartOpen, setCartOpen, toasts, notify, dismiss,
    settings, updateSettings, simulatePriceChange, simulateUnavailable, reset,
  };
}

export type Shop = ReturnType<typeof useShopState>;
const ShopContext = createContext<Shop | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const shop = useShopState();
  return <ShopContext.Provider value={shop}>{children}</ShopContext.Provider>;
}

export function useShop(): Shop {
  const shop = useContext(ShopContext);
  if (!shop) throw new Error('useShop must be used inside ShopProvider');
  return shop;
}

/**
 * Loading for a screen's data, as the real app will have it: with "Slow loading" on, the screen shows its skeleton
 * first; with "Loading error" on, the first load fails and Try again succeeds.
 */
export function useLoad(key: string) {
  const { settings } = useShop();
  const [state, setState] = useState<'loading' | 'error' | 'ready'>(settings.slowLoading || settings.loadError ? 'loading' : 'ready');
  const failed = useRef(false);
  const run = useCallback((retry: boolean) => {
    if (!settings.slowLoading && !settings.loadError) { setState('ready'); return () => undefined; }
    setState('loading');
    const timer = window.setTimeout(() => {
      if (settings.loadError && !retry && !failed.current) { failed.current = true; setState('error'); } else setState('ready');
    }, settings.slowLoading ? 1200 : 400);
    return () => window.clearTimeout(timer);
  }, [settings.loadError, settings.slowLoading]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => run(false), [key, run]);
  return { state, retry: () => run(true) };
}
