import { useState } from 'react';
import { Button, Icon, Segmented, Switch } from '@syn';
import { useShop } from './store';
import { t } from './i18n';

/**
 * Prototype only, not part of the product: a small panel in the bottom-left corner that switches the application
 * (SAM / RAM), Shop access, and the states a reviewer needs to see without a backend (slow loading, a loading
 * error, a failed submission, a changed price, a product that became unavailable).
 */
export function PrototypePanel() {
  const { settings, updateSettings, simulatePriceChange, simulateUnavailable, reset } = useShop();
  const [open, setOpen] = useState(false);
  return (
    <div className="shop-proto">
      {open && (
        <section className="shop-proto__panel" aria-label={t("Prototype states")}>
          <header className="shop-proto__head">
            <strong>{t("Prototype states")}</strong>
            <span className="shop-muted">{t("Not part of the product. Use these to review the V1 states.")}</span>
          </header>
          <div className="shop-proto__row">
            <span>{t("Application")}</span>
            <Segmented label={t("Application")} options={[{ value: 'SAM', label: 'SAM' }, { value: 'RAM', label: 'RAM' }]} value={settings.app} onChange={(v) => updateSettings({ app: v as 'SAM' | 'RAM' })} />
          </div>
          <Switch size={20} label={t("User has Shop access")} checked={settings.shopAccess} onChange={(e) => updateSettings({ shopAccess: e.target.checked })} />
          <Switch size={20} label={t("Slow loading")} checked={settings.slowLoading} onChange={(e) => updateSettings({ slowLoading: e.target.checked })} />
          <Switch size={20} label={t("Loading fails once")} checked={settings.loadError} onChange={(e) => updateSettings({ loadError: e.target.checked })} />
          <Switch size={20} label={t("Next order submission fails")} checked={settings.failNextSubmit} onChange={(e) => updateSettings({ failNextSubmit: e.target.checked })} />
          <div className="shop-proto__actions">
            <Button size="xs" variant="secondary" onClick={simulatePriceChange}>{t("Change a price in the cart")}</Button>
            <Button size="xs" variant="secondary" onClick={simulateUnavailable}>{t("Make a cart product unavailable")}</Button>
            <Button size="xs" variant="text" iconStart="refresh" onClick={reset}>{t("Reset demo data")}</Button>
          </div>
        </section>
      )}
      <button type="button" className="shop-proto__toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Icon name="settings" size={16} />{t("Prototype")}
      </button>
    </div>
  );
}
