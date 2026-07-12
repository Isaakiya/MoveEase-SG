## Plan: Implement reusable Property Card (house card)

Goal

Build a reusable property card component that dynamically renders every property from the dataset while keeping changes small, incremental, modular and non-destructive.

--------------------------------------------------

Phase 1 — Debug Property Loading

Objectives

- Verify where property data comes from.
- Verify fetch/API succeeds.
- Verify payload structure.
- Verify HTML container exists.
- Verify JavaScript errors.
- Verify CSS is not hiding the cards.

Files

- app.js

Changes

- Add temporary logging only.
- Add global fetch/error logging if required.
- Display a friendly error message if loading fails.
- Do NOT use fallback/demo data.

Completion Criteria

- Fetch succeeds or meaningful error displayed.
- Payload structure confirmed.
- Container confirmed.
- Root cause identified.
- No rendering changes yet.

--------------------------------------------------

Phase 2 — Create Reusable Property Card

Objectives

Create ONE reusable

renderPropertyCard(property)

function.

The function should return a single card element.

The renderer must only display the property fields that contain valid data.

It must not render empty labels, badges, placeholders, or blank spacing for missing values.

The renderer should gracefully handle incomplete property data.

Files

- app.js

Future (optional)

- propertyCard.js

Completion Criteria

- Single renderer exists.
- Renderer accepts one property object.
- Renderer returns one card element.
- Only available property data is rendered.
- Missing data does not leave empty UI elements or spacing.
- No duplicate rendering logic.
- No hardcoded cards remain.

--------------------------------------------------

Phase 3 — Render Cards Dynamically

Objectives

Update

initHomePage()

and

loadSearchResults()

to:

Load Properties

↓

Render Cards

↓

Attach Events

Completion Criteria

- Every property renders.
- New properties appear automatically.
- No HTML changes required.

--------------------------------------------------

Phase 4 — Styling

Files

- style.css

Objectives

- Mobile-first
- Responsive
- Match existing design
- Improve spacing
- Improve buttons
- Improve images

Completion Criteria

- Cards display correctly on desktop, tablet and mobile.

--------------------------------------------------

Phase 5 — Favourites

Objectives

- Save favourites to Local Storage.
- Load favourites.
- Display favourites on favourites.html.

Completion Criteria

- Refresh preserves favourites.
- Favourite toggle works.

--------------------------------------------------

Phase 6 — Search & Filters

Implement

- Search
- Location
- Property Type
- Bedrooms
- Budget

Completion Criteria

- Results update correctly.

--------------------------------------------------

Phase 7 — Sorting

Implement

- Lowest Price
- Highest Price
- Newest Listings

Completion Criteria

- Sorting updates the displayed cards correctly.

--------------------------------------------------

Phase 8 — Property Details

Implement

property.html?id=...

Display

- Large image
- Description
- Amenities
- Schools
- MRT

Completion Criteria

- Clicking View Details loads the correct property.

--------------------------------------------------

Phase 9 — Pagination

Implement

- Load More

or

- Pagination

using PAGE_CONFIG.pageSize.

Completion Criteria

- Navigation between pages works correctly.

--------------------------------------------------

Phase 10 — Accessibility

Implement

- alt text
- aria-pressed
- keyboard navigation
- focus styles

Completion Criteria

- Cards are keyboard accessible.
- Screen reader support improved.

--------------------------------------------------

Operational Rules

- One phase at a time.
- Explain reasoning before code.
- Show only required code changes.
- Do not perform unrelated refactoring.
- Do not introduce demo data.
- Wait for my approval before moving to the next phase.

--------------------------------------------------

Definition of Done

A phase is complete only when:

- The feature works correctly.
- Existing functionality is preserved.
- No new console errors exist.
- The code is explained in beginner-friendly language.
- I have manually tested the changes.
- I have approved the phase before moving to the next one.