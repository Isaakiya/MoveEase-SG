# Plan: MoveEase SG implementation roadmap

The next work should focus on the data path first: confirm that the backend can read live Botpress data, verify the payload shape, and only then adjust the frontend rendering and fallback behaviour. The current blocker is the backend port conflict on 3001, so the first implementation step is to make startup resilient and confirm that the site can be served locally.

## Phase 1: Stabilise local startup
1. Confirm the backend port conflict and decide whether to stop the existing process or make the server fall back to an alternate port.
2. Ensure the backend starts successfully and serves the expected API routes.
3. Validate the frontend can load the homepage and request the API endpoints without runtime errors.

## Phase 2: Validate Botpress data flow
1. Inspect the Botpress provider module and confirm which endpoint and query options are used.
2. Compare the live Botpress response shape with the mapper in the backend provider.
3. Adjust the mapper so the backend returns a consistent property shape for the frontend.
4. Verify that the API routes return the expected JSON for properties and related properties.

## Phase 3: Align frontend rendering with backend data
1. Review the property card and details rendering logic in app.js.
2. Ensure the UI uses the mapped fields consistently for cards, search results, and property details.
3. Confirm that missing data is handled gracefully with fallback text or placeholders.
4. Verify that the search and favourites pages consume the same property structure.

## Phase 4: Improve resilience and UX
1. Replace silent fallback behaviour with explicit loading and error states.
2. Confirm that favourites persist correctly and remain unique across refreshes.
3. Check image handling and ensure every card has a valid image source or fallback.
4. Review the moving services cards and homepage preview for consistency.

## Relevant files
- backend/server.js — backend startup and port handling
- backend/providers/botpressProvider.js — Botpress request and mapping logic
- backend/routes/properties.js — API response formatting and fallback behaviour
- app.js — frontend data fetching, rendering, favourites, and page initialisation
- index.html, search.html, property.html, favourites.html, moving.html — page-specific UI containers and hooks
- style.css — visual consistency and error/loading states

## Verification
1. Start the backend and confirm it serves the API successfully.
2. Open the site locally and verify the homepage loads without console errors.
3. Confirm the properties endpoint returns a valid payload and the UI renders cards from it.
4. Check that the property details page opens correctly for a selected listing.
5. Verify favourites and search interactions still work after the data-flow changes.
