# Copilot Instructions – Moving House SG Website

## House rules

1. **Vanilla HTML, CSS and JavaScript only.** No React, Vue, Angular, Bootstrap, Tailwind, jQuery, npm packages, build tools or external frameworks. Browser APIs only.

2. **Only use approved project files.** `index.html`, `search.html`, `property.html`, `mortgage.html`, `favourites.html`, `moving.html`, `style.css`, `app.js`. Do not create additional files unless asked.

3. **Keep JavaScript modular.** Organise code into reusable functions. Avoid duplicated logic. Separate rendering, event handling and API calls.

4. **No inline CSS or inline JavaScript.** Place all styling in `style.css` and all scripting in `app.js`. Use `addEventListener()` instead of inline event attributes.

5. **Write semantic and accessible HTML.** Use `header`, `nav`, `main`, `section`, `article` and `footer`. Always include meaningful `alt` text, labels and ARIA attributes where appropriate.

6. **Build mobile first.** The website must be fully responsive using Flexbox and CSS Grid. Avoid fixed widths whenever possible.

7. **Use consistent naming conventions.** Function and variable names must clearly describe their purpose. Avoid abbreviations and meaningless names.

8. **Comment only when the reasoning is non-obvious.** Do not explain what the code does if the code is already self-explanatory.

9. **Never rewrite unrelated code.** Modify only the requested feature while preserving all existing functionality.

10. **Use reusable components and functions.** Reuse layouts, helper functions and rendering logic instead of duplicating code.

11. **Separate frontend and backend logic.** Keep API requests separate from UI rendering. Use dedicated functions for fetching and displaying data.

12. **Assume backend APIs exist.** Use `fetch()` for API communication and structure code so endpoints can be easily updated later.

13. **Property cards must remain consistent.** Every property listing should include image, title, location, price, bedrooms, bathrooms, floor area, property type, favourite button and details button.

14. **Search filters must be reusable.** Support filtering by location, property type, price range, bedrooms and bathrooms without duplicating code.

15. **Mortgage calculator must validate input.** Prevent invalid values and calculate monthly repayment, total repayment and total interest using the standard mortgage formula.

16. **Store favourites using localStorage.** Prevent duplicates and ensure favourites persist after page refresh.

17. **Navigation must remain consistent.** Every page should share the same responsive navigation bar and highlight the active page.

18. **Moving services must use reusable layouts.** Display service image, title, description, pricing and call-to-action button using a consistent card design.

19. **Maintain a consistent design system.** Reuse colours, typography, spacing, buttons, border radius and shadows across all pages.

20. **Handle errors gracefully.** Display user-friendly messages for invalid input, empty search results, failed API requests and missing property data.

21. **Optimise performance.** Minimise DOM manipulation, cache selectors where appropriate and avoid unnecessary event listeners.

22. **Follow existing project style.** Match formatting, indentation and coding conventions throughout the project.

23. **Ask before changing the project structure.** Do not create new folders, files or dependencies unless explicitly instructed.

24. **Build a PropertyGuru-style experience.** The final website should include a responsive homepage, property search, property listings, property details, mortgage calculator, favourites page, moving services, backend integration and a clean, maintainable user interface.