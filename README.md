# Hoang Luxury Travel

React/Vite homepage for Hoang Luxury Travel.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Structure

- `src/App.jsx` - React components and page data.
- `src/App.css` - Page styling.
- `src/main.jsx` - React entry point.
- `assets/` - Place real images and brand assets here.

## External links

Copy `.env.example` to `.env` and provide:

- `VITE_CATALOG_URL`: the public Google Drive link for the catalog or price list.
- `VITE_CONTACT_FORM_ENDPOINT`: a Power Automate/Make webhook that accepts JSON and appends each inquiry to Excel.

Restart the Vite development server after changing `.env`.
