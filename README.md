# Syniotec Shop

Clickable prototype of the SAM / Syniotec Shop, built with the Syn design system. Customers browse hardware and passive tags, add them to a cart or order by SKU, and send an order request. Shop Admin handles orders and products. The interface is in English and German.

## Run it

```bash
npm install
npm run dev        # local dev server
npm run build      # typecheck + static build in dist/
npm run preview    # serve the build
```

The build uses relative paths, so `dist/` works from any folder or static host (for example GitHub Pages).

## Structure

- `index.html`: the page entry.
- `src/`: the shop.
  - `App.tsx`: layout, top bar and page switching. Routes are hashes (`#/shop`, `#/product/EDGE`, `#/checkout`, `#/orders`, `#/admin/products`), defined in `store.tsx`.
  - `pages/`: the shop, product, checkout, confirmation, orders and admin pages, plus the product editor.
  - `CartDrawer.tsx`, `QuickOrder.tsx`, `PriceRequest.tsx`, `UserMenu.tsx`: drawers and the account menu.
  - `parts.tsx`: shared shop pieces (headers, badges, line icons, product art).
  - `store.tsx`: cart, orders and products, saved in the browser's localStorage under `syn-shop-v3:`.
  - `data.ts`: the product catalogue, prices and categories.
  - `i18n.ts`, `i18n-de.ts`: the language switch and the German texts. English is the source text; German comes from a dictionary keyed by it.
  - `shop.css`: shop styles, built from Syn tokens.
- `syn/`: the Syn design system (components, tokens, icons, base styles). Imported as `@syn`, `@syn/utils` and `@syn/styles/*`.

## Syn design system

`syn/` is a copy of `src/` from [Syn-Design-System](https://github.com/easyvibesuxui-sketch/Syn-Design-System), taken from commit `f8f7fa6` on branch `claude/eager-hopper-ji8for`. That commit also changed `src/components/Select.css` (option padding and type sizes, a thin scrollbar).

To take a newer library version, replace `syn/` with that repository's `src/` folder, then run `npm run build`.

## Fonts

Montserrat comes from `@fontsource/montserrat`. ABC Favorit Expanded is a commercial font that is not bundled: install it under that family name, or the titles fall back to Montserrat.

## Product photos

Hardware photos load from `sam.dev.syniotec.com`. When that host can't be reached, the cards show built-in illustrations instead.

## Live version

GitHub Pages: https://easyvibesuxui-sketch.github.io/SYN-Shop/

Every push to `main` runs `.github/workflows/pages.yml`, which builds the shop and publishes `dist/` to the `gh-pages` branch. Pages serves that branch.
