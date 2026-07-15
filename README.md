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
- `VITE_BOOKING_SHEET_ENDPOINT`: the deployed Google Apps Script Web App URL ending in `/exec`.

Restart the Vite development server after changing `.env`.

## Google Sheets booking integration

1. Create the destination Google Sheet.
2. Open **Extensions > Apps Script** and paste the contents of `google-apps-script/Code.gs`.
3. In **Project Settings > Script properties**, add `SPREADSHEET_ID` with the ID from the private Sheet URL. Optionally add `SHEET_NAME`; the default is `Bookings`.
4. Run `setupBookingsSheet` once and approve the requested Google Sheets permission.
5. Select **Deploy > New deployment > Web app**. Run as yourself and allow access to anyone who can submit the public booking form.
6. Put the deployed `/exec` URL in `.env` as `VITE_BOOKING_SHEET_ENDPOINT`, then restart Vite.

The spreadsheet ID stays in Apps Script properties and is not bundled into React. The Web App endpoint remains visible to the browser because client-side code cannot securely hide or encrypt a request destination.
