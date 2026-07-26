# Agent guide

Keep changes local to the feature being edited. Do not scan `assets/`, `dist/`, or
`node_modules/` unless the task specifically concerns them.

## Fast reading map

- App entry and pathname routing: `src/main.jsx`
- Homepage composition only: `src/App.jsx`
- Shared content and external URLs: `src/data.js`
- Image imports and component asset maps: `src/config/assets.js`
- Homepage sections: `src/components/home/`
- Shared header, footer, and sticky actions: `src/components/layout/`
- Booking page and form state: `src/BookingPage.jsx`
- Catalog page: `src/CatalogPage.jsx`
- CSS entry and cascade order: `src/styles/index.css`

## CSS rules

`src/styles/index.css` defines the production cascade. Keep its import order
unless a visual regression check confirms the change. Edit the narrowest
feature stylesheet first; files ending in `-refinements.css` intentionally load
after the original broad layout rules.

## Validation

Run `npm run build` after source or CSS changes. The build recreates `dist/`;
never edit generated files there.
