import { useState, type ReactNode } from 'react';
import { Button, Dialog, Drawer, EmptyState, Section, Select, Table, Tabs, TextField } from '@syn';
import { cx } from '@syn/utils';
import {
  CURRENT_USER, ORDER_STAGES, ORDER_STATUSES, PRICE_REQUEST_STATUSES, money, plural,
  type Order, type OrderStatus, type PriceRequest,
} from '../data';
import {
  DrawerContext, DrawerTitle, InfoNote, LoadError, OrderStatusBadge, PriceRequestStatusBadge, ProductArt, ShopHeader,
  SpecList, Summary, TableSkeleton,
} from '../parts';
import { routeHref, useLoad, useShop, type RequestsTab } from '../store';
import { t } from '../i18n';

const allStatuses = { value: 'all', label: 'All statuses' };

/**
 * The order's progress: Submitted → Confirmed → Shipped → Completed, each with when it happened. A rejected or
 * cancelled order ends at that state instead, with the reason where one was given; a shipped order shows its
 * tracking number.
 */
export function OrderTimeline({ order }: { order: Order }) {
  const stopped = order.status === 'Rejected' || order.status === 'Cancelled';
  const steps: OrderStatus[] = stopped ? order.history.map((h) => h[0]) : ORDER_STAGES;
  return (
    <ol className="shop-timeline">
      {steps.map((s) => {
        const when = order.history.find((h) => h[0] === s)?.[1];
        const final = stopped && s === order.status;
        return (
          <li key={s} className={cx(when && 'is-done', final && 'is-stopped')}>
            <strong>{t(s)}</strong>
            <span>{when ?? t("Pending")}</span>
            {s === 'Shipped' && when && order.trackingNumber && <span className="shop-timeline__extra">{t("Tracking number: {0}", [order.trackingNumber])}</span>}
            {final && order.reason && <span className="shop-timeline__extra">{t("Reason: {0}", [t(order.reason)])}</span>}
          </li>
        );
      })}
    </ol>
  );
}

/** Order lines at the prices they had when the order was sent; products no longer offered say so. */
export function OrderItems({ order }: { order: Order }) {
  const { products } = useShop();
  return (
    <ul className="shop-lines">
      {order.items.map((i) => {
        const gone = products.find((p) => p.id === i.id)?.status !== 'Published';
        return (
          <li key={i.id}>
            <ProductArt src={i.image} type={i.type} alt="" size="xs" />
            <span>
              <strong>{i.name}</strong>
              <span className="shop-muted">{i.qty} × {money(i.price)}</span>
              {gone && <span className="shop-line-flag">{t("No longer offered")}</span>}
            </span>
            <strong>{money(i.qty * i.price)}</strong>
          </li>
        );
      })}
    </ul>
  );
}

export function orderInfo(o: Order): Array<[string, string]> {
  return [
    ['Submitted by', `${o.orderedBy} · ${o.date} · ${o.time}`],
    ['Company', o.org],
    ['Contact', `${o.contactName || o.orderedBy} · ${o.email} · ${o.phone}`],
    ['Delivery address', o.address],
    ['Billing address', o.billing],
    ['PO / Reference', o.reference || '—'],
    ['Comment', o.comment || '—'],
  ];
}

/** What the customer can do about the order now: cancel while Submitted, otherwise contact Syniotec. */
function OrderChangeNote({ order: o }: { order: Order }) {
  if (o.status === 'Submitted') return <InfoNote>{t("You can cancel this order request until Syniotec confirms it.")}</InfoNote>;
  if (o.status === 'Confirmed' || o.status === 'Shipped') {
    return <InfoNote>{t("To change or cancel this order, contact Syniotec with the order number {0}.", [o.id])}</InfoNote>;
  }
  return null;
}

/** Cancel order with its confirmation popup; only offered while the order is Submitted. */
function useCancelOrder() {
  const { cancelOrder } = useShop();
  const [pending, setPending] = useState<Order | null>(null);
  const dialog = (
    <Dialog
      closeLabel={t('Close')}
      open={!!pending}
      onClose={() => setPending(null)}
      title={t("Cancel order?")}
      icon="warning"
      description={t("Are you sure you want to cancel this order request? It will no longer be processed by Syniotec.")}
      actions={<>
        <Button size="md" variant="secondary" onClick={() => setPending(null)}>{t("Keep order")}</Button>
        <Button size="md" onClick={() => { if (pending) cancelOrder(pending.id); setPending(null); }}>{t("Cancel order")}</Button>
      </>}
    />
  );
  return { ask: setPending, dialog };
}

function OrderDetail({ order: o }: { order: Order }) {
  const { reorder } = useShop();
  const cancel = useCancelOrder();
  return (
    <>
      <ShopHeader
        title={t("Order {0}", [o.id])}
        lead={t("Submitted {0} · {1} by {2}{3}", [o.date, o.time, o.orderedBy, o.reference ? ` · ${o.reference}` : ''])}
        back={{ href: routeHref({ name: 'requests', tab: 'orders' }), label: t("Requests") }}
        extra={<>
          <OrderStatusBadge status={o.status} />
          {o.status === 'Submitted' && <Button size="sm" variant="secondary" onClick={() => cancel.ask(o)}>{t("Cancel order")}</Button>}
          <Button size="sm" variant="secondary" iconStart="refresh" onClick={() => reorder(o)}>{t("Order again")}</Button>
        </>}
      />
      <div className="shop-order-grid">
        <div className="shop-stack">
          <Section title={t("Order items")}>
            <p className="shop-muted">{t("Prices excl. VAT as they were when the order was sent. Ordering again uses today’s prices and availability.")}</p>
            <OrderItems order={o} />
            <Summary total={o.total} subtotal={false} />
          </Section>
          <Section title={t("Order information")}>
            <SpecList rows={orderInfo(o)} />
          </Section>
        </div>
        <Section title={t("Order status")}>
          <p className="shop-muted">{t("Syniotec updates the status at each step and emails the contact person when it changes.")}</p>
          <OrderTimeline order={o} />
          <OrderChangeNote order={o} />
        </Section>
      </div>
      {cancel.dialog}
    </>
  );
}

/** One order in a record drawer: items, status with reason or tracking, information, and the actions it allows now. */
function OrderDrawer({ order: o, onClose }: { order: Order | null; onClose: () => void }) {
  const { reorder } = useShop();
  const cancel = useCancelOrder();
  return (
    <>
      <Drawer
        closeLabel={t('Close')}
        open={!!o}
        onClose={onClose}
        label={o ? t("Order {0}", [o.id]) : t("Order")}
        width={720}
        headerStart={o && <><OrderStatusBadge status={o.status} /><DrawerContext icon="cart">{o.id}</DrawerContext></>}
        footer={o && <>
          {o.status === 'Submitted'
            ? <Button variant="text" onClick={() => cancel.ask(o)}>{t("Cancel order")}</Button>
            : <Button variant="text" onClick={onClose}>{t("Close")}</Button>}
          <Button size="sm" iconStart="refresh" onClick={() => { reorder(o); onClose(); }}>{t("Order again")}</Button>
        </>}
      >
        {o && <DrawerTitle title={t("Order {0}", [o.id])} lead={t("Submitted {0} · {1} by {2}{3}", [o.date, o.time, o.orderedBy, o.reference ? ` · ${o.reference}` : ''])} />}
        {o && (
          <div className="shop-stack shop-order-drawer">
            <Section title={t("Order status")}>
              <OrderTimeline order={o} />
              <OrderChangeNote order={o} />
            </Section>
            <Section title={t("Order items")}>
              <p className="shop-muted">{t("Prices excl. VAT as they were when the order was sent. Ordering again uses today’s prices and availability.")}</p>
              <OrderItems order={o} />
              <Summary total={o.total} subtotal={false} />
            </Section>
            <Section title={t("Order information")}>
              <SpecList rows={orderInfo(o)} />
            </Section>
          </div>
        )}
      </Drawer>
      {cancel.dialog}
    </>
  );
}

/** A price request in the same record drawer as an order: product, quantity, comment, contact and status. */
function PriceRequestDrawer({ request: r, onClose }: { request: PriceRequest | null; onClose: () => void }) {
  const { products, go } = useShop();
  const product = r && products.find((p) => p.id === r.productId);
  return (
    <Drawer
      closeLabel={t('Close')}
      open={!!r}
      onClose={onClose}
      label={r ? t("Price request {0}", [r.id]) : t("Price request")}
      width={720}
      headerStart={r && <><PriceRequestStatusBadge status={r.status} /><DrawerContext icon="mail">{r.id}</DrawerContext></>}
      footer={r && <>
        <Button variant="text" onClick={onClose}>{t("Close")}</Button>
        {product?.status === 'Published' && <Button size="sm" variant="secondary" onClick={() => { onClose(); go({ name: 'product', id: product.id }); }}>{t("View product")}</Button>}
      </>}
    >
      {r && <DrawerTitle title={t("Price request {0}", [r.id])} lead={t("Submitted {0} by {1}", [r.date, r.requestedBy])} />}
      {r && (
        <div className="shop-stack shop-order-drawer">
          <Section title={t("Request status")}>
            <ol className="shop-timeline">
              <li className="is-done"><strong>{t("Submitted")}</strong><span>{r.date}</span></li>
              <li className={cx(r.status === 'Responded' && 'is-done')}><strong>{t("Responded")}</strong><span>{r.respondedAt ?? t("Pending")}</span></li>
            </ol>
            <InfoNote>{r.status === 'Responded'
              ? t("Syniotec sent the price to {0} by email. To order, add the product to your cart once its price is published, or reply to the email.", [r.email])
              : t("Syniotec answers price requests by email to {0}.", [r.email])}</InfoNote>
          </Section>
          <Section title={t("Requested product")}>
            <ul className="shop-lines">
              <li>
                <ProductArt src={product?.image ?? ''} type={product?.type ?? 'hardware'} alt="" size="xs" />
                <span><strong>{r.productName}</strong><span className="shop-muted">{product ? t(product.short) : r.productId}</span></span>
                <strong>{plural(r.qty, 'piece')}</strong>
              </li>
            </ul>
          </Section>
          <Section title={t("Request information")}>
            <SpecList rows={[
              ['Submitted by', `${r.requestedBy} · ${r.date}`],
              ['Contact', `${r.requestedBy} · ${r.email} · ${r.phone}`],
              ['Requested quantity', String(r.qty)],
              ['Comment', r.note || '—'],
            ]} />
          </Section>
        </div>
      )}
    </Drawer>
  );
}

/** Opens a row's drawer from a click anywhere on the row; links and buttons in the row keep their own action. */
function RowsOpen<T>({ list, onOpen, children }: { list: T[]; onOpen: (row: T) => void; children: ReactNode }) {
  return (
    <div
      className="shop-rows-open"
      onClick={(e) => {
        const target = e.target as Element;
        if (target.closest('button, a')) return;
        const row = target.closest('tbody tr');
        const index = row ? Array.from(row.parentElement!.children).indexOf(row) : -1;
        if (index >= 0) onOpen(list[index]);
      }}
    >
      {children}
    </div>
  );
}

function OrdersTab() {
  const { orders, reorder, go } = useShop();
  const load = useLoad('orders');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const q = search.trim().toLowerCase();
  const list = orders.filter((o) => (status === 'all' || o.status === status) && `${o.id} ${o.reference} ${o.orderedBy}`.toLowerCase().includes(q));

  let body: ReactNode;
  if (load.state === 'loading') body = <TableSkeleton label={t("Loading orders")} />;
  else if (load.state === 'error') body = <LoadError what={t("Orders")} onRetry={load.retry} />;
  else if (!orders.length) {
    body = (
      <EmptyState variant="general" title={t("No orders yet")} action={<Button size="sm" onClick={() => go({ name: 'shop' })}>{t("Browse products")}</Button>}>
        {t("Order requests from everyone in your organisation will appear here.")}
      </EmptyState>
    );
  } else if (!list.length) {
    body = (
      <EmptyState icon="search" action={<Button size="sm" variant="secondary" onClick={() => { setSearch(''); setStatus('all'); }}>{t("Show all orders")}</Button>}>
        {t("No orders match this search or status.")}
      </EmptyState>
    );
  } else {
    body = (
      <RowsOpen list={list} onOpen={(o) => setOpenId(o.id)}>
        <Table
          caption={t("Orders")}
          className="shop-table"
          rows={list}
          rowKey={(o) => o.id}
          columns={[
            { key: 'id', header: t("Order number"), render: (o) => <button type="button" className="shop-cell-link" onClick={() => setOpenId(o.id)}>{o.id}<span>{o.reference || t("No reference")}</span></button> },
            { key: 'date', header: t("Submission date"), render: (o) => <span className="shop-cell">{o.date}<span>{o.time}</span></span> },
            { key: 'by', header: t("Submitted by"), render: (o) => <span className="shop-cell">{o.orderedBy}{o.orderedBy === CURRENT_USER.name && <span>{t("You")}</span>}</span> },
            {
              key: 'items',
              header: t("Products"),
              render: (o) => (
                <ul className="shop-order-products">
                  {o.items.map((i) => (
                    <li key={i.id}>
                      <ProductArt src={i.image} type={i.type} alt="" size="xs" />
                      <span><strong>{i.qty} × {i.name}</strong><span>{money(i.price)} {t("each")}</span></span>
                    </li>
                  ))}
                </ul>
              ),
            },
            { key: 'total', header: t("Total"), align: 'end', render: (o) => <strong>{money(o.total)}</strong> },
            { key: 'status', header: t("Status"), render: (o) => <OrderStatusBadge status={o.status} /> },
          ]}
          rowActions={(o) => <Button size="sm" variant="secondary" iconStart="refresh" onClick={() => reorder(o)} aria-label={t("Order {0} again", [o.id])}>{t("Order again")}</Button>}
        />
      </RowsOpen>
    );
  }

  return (
    <>
      <div className="shop-toolbar">
        <TextField className="shop-toolbar__search" label={t("Search order, reference or person")} hideLabel size="sm" iconStart="search" value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} />
        <Select className="shop-toolbar__sort" label={t("Order status")} size="sm" options={[allStatuses, ...ORDER_STATUSES.map((s) => ({ value: s, label: s }))].map((o) => ({ ...o, label: t(o.label) }))} value={status} onChange={setStatus} />
      </div>
      {body}
      <OrderDrawer order={orders.find((o) => o.id === openId) ?? null} onClose={() => setOpenId(null)} />
    </>
  );
}

function PriceRequestsTab() {
  const { requests, go } = useShop();
  const load = useLoad('price-requests');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const q = search.trim().toLowerCase();
  const list = requests.filter((r) => (status === 'all' || r.status === status) && `${r.id} ${r.productName} ${r.requestedBy}`.toLowerCase().includes(q));

  let body: ReactNode;
  if (load.state === 'loading') body = <TableSkeleton label={t("Loading price requests")} />;
  else if (load.state === 'error') body = <LoadError what={t("Price requests")} onRetry={load.retry} />;
  else if (!requests.length) {
    body = (
      <EmptyState variant="general" title={t("No price requests yet")} action={<Button size="sm" variant="secondary" onClick={() => go({ name: 'shop' })}>{t("Browse products")}</Button>}>
        {t("Products marked “Price on request” have a Request price button. Requests from your organisation will appear here.")}
      </EmptyState>
    );
  } else if (!list.length) {
    body = (
      <EmptyState icon="search" action={<Button size="sm" variant="secondary" onClick={() => { setSearch(''); setStatus('all'); }}>{t("Show all price requests")}</Button>}>
        {t("No price requests match this search or status.")}
      </EmptyState>
    );
  } else {
    body = (
      <RowsOpen list={list} onOpen={(r) => setOpenId(r.id)}>
        <Table
          caption={t("Price requests")}
          className="shop-table"
          rows={list}
          rowKey={(r) => r.id}
          columns={[
            { key: 'id', header: t("Request number"), render: (r) => <button type="button" className="shop-cell-link" onClick={() => setOpenId(r.id)}>{r.id}</button> },
            { key: 'date', header: t("Submission date"), render: (r) => { const [d, time] = r.date.split(' · '); return <span className="shop-cell">{d}<span>{time}</span></span>; } },
            { key: 'product', header: t("Product"), render: (r) => <strong>{r.productName}</strong> },
            { key: 'qty', header: t("Requested quantity"), align: 'end', render: (r) => r.qty },
            { key: 'by', header: t("Submitted by"), render: (r) => <span className="shop-cell">{r.requestedBy}{r.requestedBy === CURRENT_USER.name && <span>{t("You")}</span>}</span> },
            { key: 'status', header: t("Status"), render: (r) => <PriceRequestStatusBadge status={r.status} /> },
          ]}
        />
      </RowsOpen>
    );
  }

  return (
    <>
      <div className="shop-toolbar">
        <TextField className="shop-toolbar__search" label={t("Search request, product or person")} hideLabel size="sm" iconStart="search" value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} />
        <Select className="shop-toolbar__sort" label={t("Request status")} size="sm" options={[allStatuses, ...PRICE_REQUEST_STATUSES.map((s) => ({ value: s, label: s }))].map((o) => ({ ...o, label: t(o.label) }))} value={status} onChange={setStatus} />
      </div>
      {body}
      <PriceRequestDrawer request={requests.find((r) => r.id === openId) ?? null} onClose={() => setOpenId(null)} />
    </>
  );
}

/**
 * Requests: everything the organisation has sent to Syniotec through the Shop, in two tabs. Everyone with Shop access
 * sees all of it; "Submitted by" says who sent each request.
 */
export function RequestsPage({ tab, id }: { tab: RequestsTab; id?: string }) {
  const { orders, requests, go } = useShop();
  const selected = tab === 'orders' && id ? orders.find((o) => o.id === id) : undefined;
  if (selected) return <OrderDetail order={selected} />;

  return (
    <>
      <ShopHeader
        title={t("Requests")}
        lead={t("Orders and price requests from everyone in {0}, newest first. Open one for its details.", [CURRENT_USER.company])}
        back={{ href: routeHref({ name: 'shop' }), label: t("Shop") }}
      />
      <Tabs
        className="shop-requests__tabs"
        label={t("Requests")}
        size="md"
        value={tab}
        onChange={(v) => go({ name: 'requests', tab: v as RequestsTab })}
        items={[
          { id: 'orders', label: `${t("Orders")} · ${orders.length}`, iconStart: 'list' },
          { id: 'price-requests', label: `${t("Price requests")} · ${requests.length}`, iconStart: 'mail' },
        ]}
      />
      {tab === 'orders' ? <OrdersTab /> : <PriceRequestsTab />}
    </>
  );
}

