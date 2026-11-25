import { useMemo, useState } from 'react';
import { Button, Drawer, Icon, TextArea } from '@syn';
import { cx } from '@syn/utils';
import { canOrder, minQty, money, plural, type Product } from './data';
import { DrawerIntro, DrawerLabel } from './parts';
import { useShop } from './store';
import { t } from './i18n';

interface Parsed {
  line: string;
  product?: Product;
  qty: number;
  problem?: string;
  /** Values for the problem text, e.g. the minimum order quantity. */
  args?: Array<string | number>;
}

const normalise = (v: string) => v.toUpperCase().replace(/[\s_]+/g, '-');

/**
 * One line per product: the SKU, then the quantity ("LINK 2", "TAG-S, 20", "QR-STICKER x50"). Only SKUs are matched,
 * not product names. Each line is checked against the product's minimum order quantity; there is no maximum.
 */
export function parseQuickOrder(text: string, products: Product[]): Parsed[] {
  return text.split('\n').map((l) => l.trim()).filter(Boolean).map((line) => {
    const m = line.match(/^(.*?)[\s,;:x×*]*(\d+)\s*(?:pcs|pc|st)?\.?$/i);
    const key = normalise((m ? m[1] : line).replace(/[,;:]+$/, '').trim());
    const qty = m ? Number(m[2]) : 0;
    // Drafts are not public, so they read as unknown; archived products say they are no longer offered.
    const product = products.find((p) => p.status !== 'Draft' && normalise(p.id) === key);
    if (!product) return { line, qty, problem: 'SKU not found' };
    if (product.status === 'Archived') return { line, product, qty, problem: 'No longer offered' };
    if (!canOrder(product)) return { line, product, qty, problem: product.availability === 'Temporarily unavailable' ? 'Temporarily unavailable' : 'Price on request' };
    if (!m) return { line, product, qty, problem: 'Add the quantity after the SKU' };
    if (!qty) return { line, product, qty, problem: 'Quantity is 0' };
    if (qty < minQty(product)) return { line, product, qty, problem: 'Below the minimum order quantity of {0}', args: [minQty(product)] };
    return { line, product, qty };
  });
}

/** Quick order: buyers who know the SKUs paste a list instead of browsing. */
export function QuickOrder({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { products, addLines, notify, setCartOpen } = useShop();
  const [text, setText] = useState('');
  const rows = useMemo(() => parseQuickOrder(text, products), [text, products]);
  const ok = rows.filter((r) => !r.problem);
  const total = ok.reduce((n, r) => n + r.qty * (r.product?.price ?? 0), 0);

  const add = () => {
    const added = addLines(ok.map((r) => ({ product: r.product!, qty: r.qty })));
    notify(t("{0} added to your cart", [plural(added, 'product')]), rows.length > ok.length ? t("{0} could not be added; check them in Quick order.", [plural(rows.length - ok.length, 'line')]) : t("You can change quantities in the cart."), rows.length > ok.length ? 'warning' : 'success');
    setText(rows.filter((r) => r.problem).map((r) => r.line).join('\n'));
    onClose();
    setCartOpen(true);
  };

  return (
    <Drawer
      closeLabel={t('Close')}
      open={open}
      onClose={onClose}
      label={t("Quick order")}
      width={560}
      headerStart={<DrawerLabel>{t("Quick order")}</DrawerLabel>}
      footer={<>
        <Button variant="text" onClick={onClose}>{t("Cancel")}</Button>
        <Button size="sm" disabled={!ok.length} onClick={add}>{ok.length ? t("Add {0} to cart", [plural(ok.length, 'product')]) : t("Add to cart")}</Button>
      </>}
    >
      {/* The header already names the drawer, so the body opens with what to do. */}
      <DrawerIntro>{t("Know the SKUs? Paste them here and add everything to the cart at once.")}</DrawerIntro>
      <div className="shop-drawer-body shop-quick-form">
        <TextArea
          label={t("Products and quantities")}
          hideLabel={false}
          labelPosition="outside"
          hint={t("One line per product: the SKU, then the quantity. You can paste two columns from Excel.")}
          placeholder={"LINK 2\nTAG-S 20\nQR-STICKER 50"}
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {rows.length > 0 && (
          <ul className="shop-quick" aria-label={t("Recognised lines")}>
            {rows.map((r, i) => (
              <li key={`${r.line}-${i}`} className={cx(r.problem && 'is-problem')}>
                <Icon name={r.problem ? 'warning' : 'check'} size={16} />
                <span className="shop-cell">
                  <strong>{r.product ? `${r.product.id} · ${r.product.name}` : r.line}</strong>
                  <span>{r.problem ? `${t(r.problem, r.args)}${r.product ? '' : ` · “${r.line}”`}` : `${r.qty} × ${money(r.product!.price)}`}</span>
                </span>
                {!r.problem && <strong>{money(r.qty * r.product!.price)}</strong>}
              </li>
            ))}
          </ul>
        )}
        {ok.length > 0 && <p className="shop-quick__total"><span>{t("Subtotal excl. VAT")}</span><strong>{money(total)}</strong></p>}
      </div>
    </Drawer>
  );
}
