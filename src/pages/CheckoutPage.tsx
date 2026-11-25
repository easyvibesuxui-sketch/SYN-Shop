import { useState, type FormEvent } from 'react';
import { Button, Card, Checkbox, Grid, GridItem, Section, Select, TextArea, TextField } from '@syn';
import { COUNTRIES, CURRENT_USER, money, plural } from '../data';
import { InfoNote, ProductArt, ShopHeader, Summary } from '../parts';
import { CartNotices } from '../CartDrawer';
import { routeHref, useShop } from '../store';
import { t } from '../i18n';

/**
 * Prefilled from the account wherever it has the data: contact, email and phone, the delivery address and the
 * company billing address. All of them stay editable; only the company is read-only.
 */
const initial = {
  name: CURRENT_USER.name, email: CURRENT_USER.email, phone: CURRENT_USER.phone,
  street: CURRENT_USER.street, zip: CURRENT_USER.zip, city: CURRENT_USER.city, country: CURRENT_USER.country,
  billingAddress: CURRENT_USER.billing.street, billingZip: CURRENT_USER.billing.zip, billingCity: CURRENT_USER.billing.city, billingCountry: CURRENT_USER.billing.country,
  reference: '', comment: '',
};
const companyBilling = `${CURRENT_USER.billing.street}, ${CURRENT_USER.billing.zip} ${CURRENT_USER.billing.city}, ${CURRENT_USER.billing.country}`;
type Form = typeof initial;
type Field = keyof Form;

const required: Field[] = ['name', 'email', 'phone', 'street', 'zip', 'city'];
const billingRequired: Field[] = ['billingAddress', 'billingZip', 'billingCity', 'billingCountry'];

/** Error copy says what to enter, not that something is wrong. */
const missing: Partial<Record<Field, string>> = {
  name: 'Enter who Syniotec should contact about this order',
  email: 'Enter an email address for order updates',
  phone: 'Enter a phone number for delivery questions',
  street: 'Enter the street and house number',
  zip: 'Enter the postal code',
  city: 'Enter the city',
  billingAddress: 'Enter the billing street and house number',
  billingZip: 'Enter the billing postal code',
  billingCity: 'Enter the billing city',
  billingCountry: 'Enter the billing country',
};

function validate(form: Form, billingSame: boolean) {
  const errors: Partial<Record<Field, string>> = {};
  for (const f of [...required, ...(billingSame ? [] : billingRequired)]) {
    if (!form[f].trim()) errors[f] = missing[f];
  }
  if (!errors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter an email address like name@company.com';
  return errors;
}

const nextSteps = [
  ['Syniotec reviews your order request', 'and processes it. Prices are excl. VAT.'],
  ['You get email updates', 'on relevant changes to your order. The invoice follows separately.'],
  ['Track it under Requests', 'with its status and messages from Syniotec. Until it is confirmed you can cancel it there.'],
];

export function CheckoutPage() {
  const { cart, cartTotal, cartBlocked, submitOrder, setCartOpen, go, notify } = useShop();
  const [form, setForm] = useState(initial);
  const [billingSame, setBillingSame] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const orderable = cart.filter((l) => l.state === 'ok');
  const orderQty = orderable.reduce((n, l) => n + l.qty, 0);

  if (!cart.length) {
    return (
      <>
        <ShopHeader title={t("Your cart is empty")} lead={t("Add products to your cart, then come back here to send the order request.")} back={{ href: routeHref({ name: 'shop' }), label: t("Shop") }} />
      </>
    );
  }

  const field = (key: Field, label: string, extra?: { type?: string; placeholder?: string; hint?: string }) => (
    <TextField
      label={t(label)}
      size="md"
      value={form[key]}
      error={errors[key] && t(errors[key]!)}
      onChange={(e) => {
        setForm({ ...form, [key]: e.target.value });
        if (errors[key]) setErrors({ ...errors, [key]: undefined });
      }}
      {...extra}
    />
  );

  const send = async () => {
    setSending(true);
    setFailed(false);
    try {
      const id = await submitOrder({
        contactName: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(),
        address: `${form.street.trim()}, ${form.zip.trim()} ${form.city.trim()}, ${form.country}`,
        billing: billingSame ? companyBilling : `${form.billingAddress.trim()}, ${form.billingZip.trim()} ${form.billingCity.trim()}, ${form.billingCountry.trim()}`,
        reference: form.reference.trim(), comment: form.comment.trim(),
      });
      go({ name: 'confirmation', id });
    } catch {
      // Nothing was sent: the cart and the form stay as they are, and Try again sends the same request.
      setFailed(true);
      setSending(false);
      notify(t("Your order request couldn’t be sent"), t("Nothing was sent and your cart is unchanged. Check your connection and try again."), 'error', { label: t("Try again"), run: () => void send() });
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (sending || cartBlocked) return;
    const found = validate(form, billingSame);
    setErrors(found);
    const count = Object.keys(found).length;
    if (count) {
      notify(t("{0} still {1} your input", [plural(count, 'field'), count === 1 ? 'needs' : 'need']), t("Fill in the highlighted fields, then submit the order again."), 'error');
      document.querySelector<HTMLInputElement>('.shop-checkout [aria-invalid="true"]')?.focus();
      return;
    }
    void send();
  };

  return (
    <>
      <ShopHeader title={t("Submit order request")} lead={t("You are sending an order request, not buying online. Syniotec reviews and processes it before anything is delivered or invoiced.")} back={{ href: routeHref({ name: 'shop' }), label: t("Shop") }} />

      <form className="shop-checkout" onSubmit={submit} noValidate>
        <div className="shop-checkout__main">
          <Section title={t("Company & contact")}>
            <p className="shop-muted">{t("Filled in from your account. Change them if someone else should be contacted.")}</p>
            <Grid gap={16}>
              <GridItem span={6}><TextField label={t("Company")} size="md" value={CURRENT_USER.company} readOnly hint={t("From your account")} /></GridItem>
              <GridItem span={6}>{field('name', 'Contact person *')}</GridItem>
              <GridItem span={6}>{field('email', 'Email *', { type: 'email' })}</GridItem>
              <GridItem span={6}>{field('phone', 'Phone *', { type: 'tel' })}</GridItem>
            </Grid>
          </Section>

          <Section title={t("Delivery address")}>
            <p className="shop-muted">{t("Where the hardware should go.")}</p>
            <Grid gap={16}>
              <GridItem span={12}>{field('street', 'Street / address *')}</GridItem>
              <GridItem span={6}>{field('zip', 'ZIP / Postal code *')}</GridItem>
              <GridItem span={6}>{field('city', 'City *')}</GridItem>
              <GridItem span={12}>
                <Select label={t("Country *")} hideLabel={false} size="md" value={form.country} onChange={(country) => setForm({ ...form, country })} options={COUNTRIES.map((c) => ({ value: c, label: t(c) }))} />
              </GridItem>
            </Grid>
          </Section>

          <Section title={t("Billing & reference")}>
            <p className="shop-muted">{t("You pay by invoice after Syniotec confirms the order. No payment is taken here.")}</p>
            <Checkbox label={t("Use company billing address")} checked={billingSame} onChange={(e) => setBillingSame(e.target.checked)} />
            {billingSame && <p className="shop-billing-preview">{companyBilling}</p>}
            {!billingSame && (
              <Grid gap={16}>
                <GridItem span={12}>{field('billingAddress', 'Billing address *')}</GridItem>
                <GridItem span={6}>{field('billingZip', 'ZIP / Postal code *')}</GridItem>
                <GridItem span={6}>{field('billingCity', 'City *')}</GridItem>
                <GridItem span={12}>
                  <Select label={t("Country *")} hideLabel={false} size="md" value={form.billingCountry} onChange={(billingCountry) => setForm({ ...form, billingCountry })} options={COUNTRIES.map((c) => ({ value: c, label: t(c) }))} />
                </GridItem>
              </Grid>
            )}
            <Grid gap={16}>
              <GridItem span={12}>{field('reference', 'PO / Reference number (optional)', { hint: t("For example SITE-NORD-042. Printed on the invoice so your accounting can match it.") })}</GridItem>
              <GridItem span={12}>
                <TextArea label={t("Comment (optional)")} hideLabel={false} labelPosition="outside" hint={t("For example a contact on site or delivery hours")} placeholder={t("Add delivery or order instructions")} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} rows={3} />
              </GridItem>
            </Grid>
          </Section>
        </div>

        <Card className="shop-order-summary" title={t("Order summary")} actions={<Button size="xs" variant="text" onClick={() => setCartOpen(true)}>{t("Edit cart")}</Button>}>
          <p className="shop-muted">{plural(orderQty, 'item')} {t("in this order request")}</p>
          <CartNotices />
          <ul className="shop-lines">
            {orderable.map((l) => (
              <li key={l.productId}>
                <ProductArt src={l.product!.image} type={l.product!.type} alt="" size="xs" />
                <span>
                  <strong>{l.name}</strong>
                  <span className="shop-muted">{l.qty} × {money(l.product!.price)}{l.priceChanged && <span className="shop-price-was">{t("was {0}", [money(l.price!)])}</span>}</span>
                </span>
                <strong>{money(l.qty * l.product!.price)}</strong>
              </li>
            ))}
          </ul>
          <Summary total={cartTotal} />
          <InfoNote>{t("Prices are excl. VAT. No online payment: Syniotec reviews and processes your request, then invoices separately.")}</InfoNote>
          {failed && <InfoNote tone="warning">{t("The last attempt failed and nothing was sent. Submit again to retry.")}</InfoNote>}
          <Button type="submit" size="md" fullWidth loading={sending} disabled={cartBlocked || !orderable.length}>{t("Submit order request ·")} {money(cartTotal)}</Button>
          <div className="shop-next">
            <span className="shop-eyebrow">{t("What happens next")}</span>
            <ol>
              {nextSteps.map(([title, text]) => <li key={title}><strong>{t(title)}</strong> {t(text)}</li>)}
            </ol>
          </div>
        </Card>
      </form>
    </>
  );
}
