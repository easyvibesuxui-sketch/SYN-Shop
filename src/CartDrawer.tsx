import { useCallback, useState } from 'react';
import { Button, Drawer, EmptyState } from '@syn';
import { minQty, money, plural } from './data';
import { DrawerIntro, DrawerLabel, InfoNote, OrderUnitNote, ProductArt, QuantityStepper, Summary } from './parts';
import { useShop, type CartItem } from './store';
import { t } from './i18n';

/**
 * Messages above the cart lines, shared by the cart and the checkout: a price that changed since the product was
 * added, and products that can no longer be ordered (which block the order until they are removed).
 */
export function CartNotices() {
  const { priceChanged, cartBlocked } = useShop();
  return (
    <>
      {priceChanged && <InfoNote tone="warning">{t("A product price has been updated. Please review your order before submitting.")}</InfoNote>}
      {cartBlocked && <InfoNote tone="warning">{t("Some products can no longer be ordered. Remove them to continue.")}</InfoNote>}
    </>
  );
}

/** A cart line: today's price, the old price when it changed, or why the product can't be ordered any more. */
function CartLineView({ line: l, onValidChange }: { line: CartItem; onValidChange: (id: string, valid: boolean) => void }) {
  const { setQty, removeFromCart } = useShop();
  const ok = l.state === 'ok' && l.product;
  return (
    <li className={`shop-cart__line${ok ? '' : ' is-blocked'}`}>
      <ProductArt src={l.product?.image ?? ''} type={l.product?.type ?? 'hardware'} alt="" size="xs" />
      <div className="shop-cart__main">
        <strong>{l.name}</strong>
        {ok ? (
          <span className="shop-muted">
            {money(l.product!.price)} {t("/ item")}
            {l.priceChanged && <span className="shop-price-was">{t("was {0}", [money(l.price!)])}</span>}
          </span>
        ) : (
          <span className="shop-line-problem">{l.state === 'archived' ? t("No longer offered") : t("Not available for ordering right now")}</span>
        )}
        {ok && <OrderUnitNote product={l.product!} />}
        <div className="shop-row shop-row--top">
          {ok && <QuantityStepper size="xs" label={l.name} value={l.qty} min={minQty(l.product!)} onChange={(q) => setQty(l.productId, q)} onValidChange={(v) => onValidChange(l.productId, v)} />}
          <Button size="xs" variant="text" onClick={() => removeFromCart(l.productId)} aria-label={t("Remove {0}", [l.name])}>{t("Remove")}</Button>
        </div>
      </div>
      <strong>{ok ? money(l.qty * l.product!.price) : '—'}</strong>
    </li>
  );
}

/** The cart lines; `onValidChange` reports a line whose typed quantity is not valid yet, so Continue can wait. */
export function CartLines({ onValidChange }: { onValidChange: (id: string, valid: boolean) => void }) {
  const { cart } = useShop();
  return <ul className="shop-cart__lines">{cart.map((l) => <CartLineView key={l.productId} line={l} onValidChange={onValidChange} />)}</ul>;
}

/** The cart as a narrow Syn drawer: lines with a quantity stepper, the summary and "Continue to order". */
export function CartDrawer() {
  const { cart, cartQty, cartTotal, cartBlocked, cartOpen, setCartOpen, go, route } = useShop();
  const close = () => setCartOpen(false);
  const [invalid, setInvalid] = useState<string[]>([]);
  const onValidChange = useCallback((id: string, valid: boolean) => {
    setInvalid((list) => (valid ? (list.includes(id) ? list.filter((x) => x !== id) : list) : list.includes(id) ? list : [...list, id]));
  }, []);
  const typing = invalid.some((id) => cart.some((l) => l.productId === id));
  const to = (name: 'checkout' | 'shop') => {
    close();
    // The checkout page itself opens the cart for "Back to cart"; going there again only closes the drawer.
    if (route.name !== name) go({ name });
  };

  return (
    <Drawer
      open={cartOpen}
      onClose={close}
      label={t("Your cart")}
      width={480}
      closeLabel={t("Close cart")}
      headerStart={<DrawerLabel>{t("Your cart")}</DrawerLabel>}
      footer={cart.length ? <Button size="sm" fullWidth iconEnd="arrow" disabled={cartBlocked || typing} onClick={() => to('checkout')}>{t("Continue to order")}</Button> : undefined}
    >
      <DrawerIntro>{cartQty ? t("{0} · prices excl. VAT", [plural(cartQty, 'item')]) : t("No products added yet")}</DrawerIntro>
      {cart.length ? (
        <div className="shop-cart">
          <CartNotices />
          <CartLines onValidChange={onValidChange} />
          <Summary total={cartTotal} />
          <InfoNote>{t("No online payment. You send an order request; Syniotec processes it and invoices separately.")}</InfoNote>
        </div>
      ) : (
        <div className="shop-cart shop-cart--empty">
          <EmptyState icon="inventory" action={<Button size="sm" onClick={() => to('shop')}>{t("Browse products")}</Button>}>
            {t("Your cart is empty. Add Syniotec hardware to start an order.")}
          </EmptyState>
        </div>
      )}
    </Drawer>
  );
}
