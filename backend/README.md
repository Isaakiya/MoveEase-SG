MoveEase Backend Bridge
=======================

What this is
------------
This folder contains a minimal Express-based backend bridge that exposes the exact API endpoints the frontend expects:

- `GET /api/properties?featured=true` — featured properties
- `GET /api/properties` — search/listing endpoint (supports basic query params)
- `GET /api/properties/:id` — property details
- `GET /api/properties/related?type=...&limit=...` — related properties

Why this exists
---------------
The frontend issues requests to `/api/properties` (via `API_BASE_URL` + `API_ENDPOINTS`). This bridge sits between the browser and your Botpress data store and returns JSON shaped for the frontend.

Configuration
-------------
1. Install dependencies inside the `backend` folder:

```bash
cd backend
npm install
```

2. Configure environment variables (example):

- `PROVIDER` (optional) - provider implementation to use (default: `botpress`)
- `BOTPRESS_TABLE_ROWS_URL` - REQUIRED for the `botpress` provider. Set this to the exact HTTP URL that returns rows for `Property_ListingsTable`. Example (replace with your Botpress Cloud endpoint):
  - `https://api.botpress.cloud/v1/tables/Property_ListingsTable/rows`
- `BOTPRESS_API_TOKEN` - REQUIRED bearer token for the Botpress Tables API.
- `BOTPRESS_BOT_ID` - optional bot id if your Botpress Cloud setup requires the `x-bot-id` header.
- `PORT` - optional port for the bridge (default 4000).

Important notes
---------------
- This implementation intentionally does not hardcode any Botpress internal admin paths. You must provide the exact URL that returns the table rows via `BOTPRESS_TABLE_ROWS_URL`.
- The provider maps table rows to the frontend property shape using permissive field names (see `providers/botpressProvider.js`). Adjust the mapping if your table uses different field names.
- For security, do not expose Botpress admin credentials to the browser — keep them server-side in environment variables.

Run the bridge
--------------
From the workspace root:

```bash
cd backend
npm start
```

After the bridge is running, set `API_BASE_URL` in the frontend `app.js` to the bridge origin, for example `http://localhost:4000`.

If you want, I can now:
- Update the frontend `API_BASE_URL` to point to the running bridge (one-line change), or
- Scaffold an example Botpress admin URL for you to use if you provide Botpress access details.
