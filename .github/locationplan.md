## Plan: Add location autocomplete to search filters

The search experience already centers on a single form in [search.html](search.html) and a dedicated initialization flow in [app.js](app.js), so the autocomplete should extend that structure rather than introduce a separate page-specific implementation.

### What I found
- The location filter is a plain text input inside the existing search form in [search.html](search.html).
- Search-page initialization happens in the existing initSearchPage flow in [app.js](app.js), which already reads and writes the form values and updates the search state.
- The current form controls share styling in [style.css](style.css), so the autocomplete should reuse the same field appearance and spacing.

### Implementation plan
1. Add a reusable autocomplete widget in [app.js](app.js) that can be attached to the existing location input without changing the form contract.
2. Extend the search form markup in [search.html](search.html) with a small wrapper around the location input so the dropdown can render in the same visual context as the form field.
3. Implement a location dataset and ranking algorithm that is case-insensitive and prioritizes:
   - values that start with the query,
   - values where any individual word starts with the query,
   - values that contain the query anywhere,
   - and optionally fuzzy matching for minor typos.
4. Limit the visible suggestions to 6–8 results and show a friendly empty state when no matches exist.
5. Add keyboard support for Up/Down, Enter, and Escape, plus outside-click dismissal and ARIA roles for accessibility.
6. Keep the existing form submission flow intact by populating the input value when a suggestion is selected and letting the submit handler continue using the same form data.
7. Add lightweight styles in [style.css](style.css) for the dropdown, highlighted matches, active suggestion state, and empty state while preserving the current UI language.

### Files to modify
- [search.html](search.html) — wrap the location field and preserve the existing form structure.
- [style.css](style.css) — add autocomplete-specific styles that blend with the current filter controls.
- [app.js](app.js) — add the reusable autocomplete component, the location ranking logic, and the integration hooks for the search page.

### Verification
- Open the search page and confirm that typing in the Location field shows suggestions immediately.
- Verify that the dropdown closes on outside click, Escape, and selection.
- Confirm that Enter selects the highlighted suggestion and that form submission still works with the chosen value.
- Check that the UI remains responsive and visually consistent with the existing filter card.
