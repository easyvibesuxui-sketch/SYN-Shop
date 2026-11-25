import { useEffect, useState } from 'react';
import { Button, Dialog, TextArea } from '@syn';
import { CURRENT_USER, minQty, type Product } from './data';
import { OrderUnitNote, QuantityStepper } from './parts';
import { useShop } from './store';
import { t } from './i18n';

/** "Price on request" products get a real next step instead of a disabled button. */
export function PriceRequestDialog({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { requestPrice } = useShop();
  const [qty, setQty] = useState(product ? minQty(product) : 1);
  const [valid, setValid] = useState(true);
  const [note, setNote] = useState('');
  // A price is requested for at least the product's minimum order quantity.
  useEffect(() => { if (product) setQty(minQty(product)); }, [product?.id]);
  return (
    <Dialog
      closeLabel={t('Close')}
      open={!!product}
      onClose={onClose}
      title={product ? t("Request a price for {0}", [product.name]) : t("Request a price")}
      icon={null}
      description={t("Syniotec replies by email with a price for your quantity. Nothing is ordered yet.")}
      actions={<Button size="md" fullWidth disabled={!valid} onClick={() => { if (product) requestPrice(product, qty, note.trim()); onClose(); }}>{t("Send price request")}</Button>}
    >
      {product && (
        <div className="shop-stack shop-price-request">
          <div className="shop-row shop-row--between shop-row--top">
            <span className="shop-stack shop-stack--tight">
              <span className="shop-field-label">{t("Quantity")}</span>
              <OrderUnitNote product={product} />
            </span>
            <QuantityStepper label={product.name} value={qty} onChange={setQty} min={minQty(product)} onValidChange={setValid} />
          </div>
          <p className="shop-muted">{t("Syniotec replies to {0} at {1}. Everyone in your organisation can see the request under Requests.", [CURRENT_USER.name, CURRENT_USER.email])}</p>
          <TextArea label={t("Note for Syniotec")} hideLabel={false} labelPosition="outside" hint={t("Optional, e.g. intended use or site")} rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      )}
    </Dialog>
  );
}
