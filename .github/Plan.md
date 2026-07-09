## Plan: MoveEase SG Website Architecture

This plan defines a modular, responsive, vanilla HTML/CSS/JavaScript build for a PropertyGuru-style moving-house website. The implementation will use only the approved files and keep shared behavior in app.js so each page stays focused on layout and page-specific UI.

### File-by-file plan

#### 1) index.html
- Responsibilities: Provide the homepage shell, hero section, fully functional property search panel, featured property highlights, moving services preview, and footer.
- UI components: Responsive header and navigation, hero banner, search panel with location, property type, minimum price, maximum price, and Search button, featured property cards, service cards, trust/benefit section, footer, skip-to-content link.
- JavaScript functions: initHomePage(): void, renderFeaturedProperties(properties: Array): void, bindHomeEvents(): void, handleHomeSearchSubmit(event: Event): void.
- Data it reads or updates: Featured properties, search form values, favourite state for displayed cards, current navigation state.
- Backend/localStorage communication: Fetch featured properties from the properties API, read favourite IDs from localStorage, and update favourite buttons without reloading the page.
- Additional requirements: Show a loading state while featured data is being fetched and display a friendly error message if the request fails. The Search button should redirect to search.html while preserving selected filters as URL query parameters.

#### 2) search.html
- Responsibilities: Provide the property search experience with filters, result list, empty-state handling, sorting, pagination, and navigation to property details.
- UI components: Search bar, filter controls, sort/select controls, results count, property card grid/list, empty-state message, pagination controls, accessible form feedback, and filter validation messages.
- JavaScript functions: initSearchPage(): void, renderPropertyResults(properties: Array): void, applySearchFilters(): void, bindSearchEvents(): void, buildSearchQueryParams(): string, parseSearchParams(queryString: string): Object, updateSearchParams(params: Object): string, sortProperties(properties: Array, sortBy: string): Array, renderPagination(totalPages: number, currentPage: number): void, changePage(pageNumber: number): void, validateSearchFilters(filters: Object): Object.
- Data it reads or updates: Search query parameters, selected filters, filtered property results, favourite state, current page number, current sort option.
- Backend/localStorage communication: Fetch properties from the search endpoint using query params; read and update favourites from localStorage.
- Additional requirements: Support bookmarked/shareable URLs, show loading state while results load, show image fallback placeholders, and handle validation and empty-result states gracefully. Filtering, sorting, and pagination should be performed by the backend API whenever possible; the frontend should only build query parameters, send the request, and render the returned results.

#### 3) property.html
- Responsibilities: Display one property in detail, including gallery-like content, key facts, description, amenities, price summary, and action buttons.
- UI components: Property hero/header, image area, price and key stats, description, amenities, contact/CTA area, favourite button, related properties section, error/empty states, property gallery or image placeholder state.
- JavaScript functions: initPropertyPage(): void, renderPropertyDetails(property: Object): void, renderRelatedProperties(properties: Array): void, bindPropertyEvents(): void.
- Data it reads or updates: Property ID from the URL, selected property details, favourite state, related properties.
- Backend/localStorage communication: Fetch a single property from the property-details endpoint using its ID; read/write favourites in localStorage.
- Additional requirements: Show loading state while property data loads, display a fallback image if the main image fails, and show a friendly 404-style message when the property cannot be found.

#### 4) mortgage.html
- Responsibilities: Host the mortgage calculator and show a repayment summary with validation and clear error states.
- UI components: Loan amount input, interest rate input, loan tenure input, calculate button, clear summary cards for loan amount, interest rate, tenure, monthly repayment, total repayment, total interest, and principal amount, plus inline validation messages.
- JavaScript functions: initMortgagePage(): void, calculateMortgage(values: Object): Object, validateMortgageInputs(values: Object): boolean, renderMortgageResults(result: Object): void, bindMortgageEvents(): void.
- Data it reads or updates: Loan amount, interest rate, tenure, calculation results, validation state.
- Backend/localStorage communication: No backend required; use client-side calculation only. Optionally persist recent calculations in localStorage.
- Additional requirements: Display a clear repayment summary and validation errors for invalid numeric input.

#### 5) favourites.html
- Responsibilities: Show all saved properties and allow users to remove items or revisit details.
- UI components: Page heading, empty-state block, favourite property cards, remove button, clear-all action, loading state, and error messaging.
- JavaScript functions: initFavouritesPage(): void, renderFavouriteProperties(properties: Array): void, removeFavourite(propertyId: string): void, clearFavourites(): void.
- Data it reads or updates: Favourite list from localStorage, displayed property cards, user actions.
- Backend/localStorage communication: Read/write favourites from localStorage; optionally fetch full property detail data for each favourite if the stored values are minimal.
- Additional requirements: Show a loading state while favourite data is being hydrated and handle empty or unavailable favourites gracefully.

#### 6) moving.html
- Responsibilities: Present moving services and pricing in a reusable card-based layout with clear CTAs.
- UI components: Intro section, service cards, price tag, description, CTA button, contact/help section, loading state, and empty/error state.
- JavaScript functions: initMovingPage(): void, renderMovingServices(services: Array): void, bindMovingEvents(): void.
- Data it reads or updates: Moving service catalogue, CTA state.
- Backend/localStorage communication: Fetch moving-services data from the backend endpoint; no localStorage interaction required unless saving selected services is desired.
- Additional requirements: Display fallback images when service images are missing or fail to load.

#### 7) style.css
- Responsibilities: Define the shared visual system, responsive layout rules, component styles, utility classes, focus-visible styles, and state styling for loading, errors, and empty states.
- UI components: Navigation, hero, buttons, cards, forms, filters, alert/error states, responsive grids, spacing, typography, colour system, skip-to-content styles.
- JavaScript functions: None directly; it should support page-state classes and data attributes used by app.js.
- Data it reads or updates: CSS variables and class-based DOM state; no runtime data.
- Backend/localStorage communication: None.
- Additional requirements: Ensure sufficient colour contrast, touch-friendly controls, and responsive breakpoints for mobile, tablet, and desktop.

#### 8) app.js
- Responsibilities: Centralise shared logic for navigation, API calls, localStorage favourites, rendering, validation, sorting, pagination, loading states, error handling, and page initialisation.
- UI components: Shared DOM helpers, reusable render functions, event-binding helpers, state management utilities.
- JavaScript functions: initApp(): void, getPageName(): string, fetchJson(url: string, options: Object): Promise, getFavourites(): Array, saveFavourites(favourites: Array): void, toggleFavourite(property: Object): void, renderPropertyCard(property: Object, container: Element): void, renderMovingServiceCard(service: Object, container: Element): void, renderNavigation(container: Element): void, renderFooter(container: Element): void, renderSearchFilters(container: Element, filters: Object): void, renderFavouriteButton(property: Object, container: Element): void, buildPropertyUrl(propertyId: string): string, parseSearchParams(queryString: string): Object, updateSearchParams(params: Object): string, showLoading(container: Element | null): void, hideLoading(container: Element | null): void, showError(message: string, type: string): void, clearError(): void, formatCurrency(value: number): string, formatArea(value: number): string, formatPrice(value: number): string, formatDate(value: string): string, validateSearchFilters(filters: Object): Object, sortProperties(properties: Array, sortBy: string): Array, renderPagination(totalPages: number, currentPage: number): void, changePage(pageNumber: number): void, initHomePage(): void, initSearchPage(): void, initPropertyPage(): void, initMortgagePage(): void, initFavouritesPage(): void, initMovingPage(): void.
- Data it reads or updates: Page-specific DOM elements, API response data, favourites state, URL query params, form values, loading state, error state, search results, selected property, and current page state.
- Backend/localStorage communication: Use fetch() for API requests and localStorage for favourites, recent filters, and other lightweight client state.
- Additional requirements: All API routes should be defined centrally through a single API_BASE_URL and API_ENDPOINTS object.

### Overall application architecture
- Use a multi-page structure with a shared HTML shell pattern and one central JavaScript file.
- Keep the app modular by separating state, API helpers, rendering helpers, storage helpers, validation helpers, formatting helpers, and page-specific initialisers.
- Use query parameters for navigation between list and detail views, such as search terms and property IDs.
- Make the UI resilient with empty states, validation messages, loading states, and graceful error handling.
- Support modern browsers such as Chrome, Edge, Firefox, and Safari using standard browser APIs only.
- Ensure all pages share the same core UI structure: a consistent navigation bar, footer, property card pattern, loading indicators, empty states, and error messages.

### Navigation flow between pages
1. The home page is the entry point and links to search, mortgage, favourites, and moving services.
2. The search page is reached from the home hero CTA or main navigation and returns results based on user filters.
3. Users can bookmark or share filtered search URLs such as search.html?location=Tampines&type=Condo&bedrooms=3.
4. Clicking a property card navigates to the property details page using a property ID in the URL.
5. The property details page can link back to search, favourites, or the mortgage calculator.
6. The favourites page is reachable from the main navigation and lists saved properties for quick revisiting.
7. The moving services page is reachable from the main navigation and functions as a standalone service landing page.

### Shared constants and configuration
- Define a single API_BASE_URL constant so backend URLs can be changed in one place.
- Centralise API endpoints in an API_ENDPOINTS object for homes, search, property details, related properties, and moving services.
- Define shared constants for storage keys, default filters, pagination settings, and responsive breakpoints.
- Avoid hardcoding repeated strings or values throughout the application.
- Define shared design tokens such as primary, secondary, accent, neutral colours, typography scale, spacing scale, button styles, card styles, form styles, icon style, shadows, and border radius.

### API endpoints to use
- Home page: GET /api/properties?featured=true
- Search page: GET /api/properties?location=...&propertyType=...&minPrice=...&maxPrice=...&bedrooms=...&bathrooms=...&sort=...&page=...
- Property details: GET /api/properties/:id
- Related properties: GET /api/properties?type=...&limit=4
- Moving services: GET /api/moving/services
- Optional favourites enrichment: GET /api/properties/:id for each saved favourite if the stored data is minimal
- Mortgage calculator: No backend required; use client-side logic only

### localStorage structure for favourites
- Key: favourites
- Value: JSON array of property objects with fields such as id, title, price, location, image, bedrooms, bathrooms, floorArea, propertyType, favouriteAddedAt
- Duplicate prevention: Before inserting, check whether a property with the same id already exists.
- Optional metadata: lastUpdated timestamp for future enhancements.

### Responsive design strategy
- Build mobile-first with a single-column layout on small screens.
- Use Flexbox and CSS Grid for layout composition and card arrangements.
- Introduce breakpoints for mobile, tablet, and desktop widths.
- Make navigation collapsible on small screens while keeping desktop navigation visible.
- Use fluid spacing, scalable typography, and consistent component styling across pages.
- Ensure forms, filters, property cards, and buttons remain touch-friendly and readable on all screen sizes.
- Use a responsive hamburger menu for mobile navigation and a horizontal menu for desktop navigation.

### Reusable functions inside app.js
- State and storage helpers: getPageName(), getFavourites(), saveFavourites(), toggleFavourite(), isFavourite(propertyId: string): boolean
- API helpers: fetchJson(url: string, options: Object): Promise, fetchProperties(query: string): Promise, fetchPropertyById(id: string): Promise, fetchMovingServices(): Promise
- Rendering helpers: renderPropertyCard(property: Object, container: Element): void, renderPropertyList(properties: Array, container: Element): void, renderMovingServiceCard(service: Object, container: Element): void, renderNavigation(container: Element): void, renderFooter(container: Element): void, renderSearchFilters(container: Element, filters: Object): void, renderFavouriteButton(property: Object, container: Element): void, renderLoadingState(container: Element): void, renderEmptyState(container: Element, message: string): void, renderError(message: string, type: string): void, renderPagination(totalPages: number, currentPage: number): void
- Form and interaction helpers: bindSearchEvents(): void, bindFilterEvents(): void, bindFavouriteButtons(): void, bindMortgageForm(): void, validateSearchFilters(filters: Object): Object
- Formatting helpers: formatCurrency(value: number): string, formatArea(value: number): string, formatPrice(value: number): string, formatDate(value: string): string
- Page initialisers: initHomePage(), initSearchPage(), initPropertyPage(), initMortgagePage(), initFavouritesPage(), initMovingPage()

### Error handling strategy
- Distinguish between validation errors, network errors, API errors, missing properties (404), and empty search results.
- Display user-friendly messages appropriate to each type of failure.
- Avoid showing technical error details to end users unless necessary for debugging.
- Ensure errors are recoverable with clear retry or return-to-search actions where relevant.

### Search and filter behaviour
- Validate filters before sending requests, including ensuring minimum price does not exceed maximum price and that values are within acceptable ranges.
- Support sorting for Price (Low to High), Price (High to Low), Newest Listings, Largest Floor Area, and Smallest Floor Area.
- Implement pagination for search results with page navigation and a consistent page-size default.
- Preserve the current filter and sort values in the URL so searches can be bookmarked and shared.

### Accessibility requirements
- Include a skip-to-content link for keyboard users.
- Use semantic HTML and ARIA attributes where appropriate.
- Ensure visible focus states for links, buttons, inputs, and form controls.
- Maintain keyboard navigability for menus, filters, tabs, pagination, and modals if used.
- Preserve sufficient colour contrast and support screen readers through meaningful labels and alt text.

### Application state
- Maintain shared state for currentPage, currentSearchFilters, searchResults, selectedProperty, favourites, loadingState, and errorState.
- Keep state updates centralised so all pages remain in sync with the same user context.
- Use localStorage for persisted favourites and optionally recent filters or last viewed property.

### Shared UI structure
- The navigation bar should appear on every page and include Home, Search Properties, Mortgage Calculator, Moving Services, and Favourites.
- The footer should appear on every page and include Quick Links, Contact Information, Social Media icons, Copyright, Privacy Policy, and Terms of Use.
- Shared UI elements such as navigation, footer, property cards, moving service cards, loading indicators, empty states, and error messages should be rendered using reusable JavaScript functions rather than duplicated HTML.

### Design system
- Define a consistent visual design across the website using a primary colour, secondary colour, accent colour, neutral colours, typography, spacing, buttons, cards, forms, icons, shadows, and border radius.
- Use reusable button styles for Primary, Secondary, Outline, Danger, and Disabled states.
- Reuse the same styling for text fields, number inputs, dropdowns, search bars, validation messages, and action buttons across all pages.

### Code quality guidelines
- Follow the Single Responsibility Principle by keeping functions focused on one job.
- Use descriptive function and variable names.
- Avoid duplicated logic by extracting shared behaviour into reusable helpers.
- Keep functions concise unless the complexity of the feature requires a larger structure.

### Documentation workflow
- Every major implementation stage should include the GitHub Copilot prompt used, the purpose of the prompt, any manual modifications made after generation, and the final outcome.
- Organise documentation by the following sections: Homepage, Search, Property Details, Mortgage Calculator, Favourites, Moving Services, Backend Integration, and Responsive Design.

### Backend data models
- Property object: id, title, slug, location, propertyType, price, bedrooms, bathrooms, floorArea, description, amenities, images, featured, postedDate, district, developer, status.
- Moving service object: id, title, description, price, category, image, ctaLabel, ctaUrl, featured, duration.
- All pages should use these field names consistently so rendering and filtering logic stay predictable.

### Standard property card layout
- Every property card should contain the property image, title, location, price, property type, number of bedrooms, number of bathrooms, floor area, a Favourite button, and a View Details button.
- The same card layout should be reused across the homepage, search results, favourites page, and related properties sections.

### Backend API contract
- All backend responses should use a consistent envelope so frontend components can handle success and failure predictably.
- Success responses should return a success flag, message, and data object.
- Failed responses should return a success flag, message, and optional error details.

#### Shared response format
- Success response:
  ```json
  {
    "success": true,
    "message": "Request completed successfully",
    "data": {}
  }
  ```
- Error response:
  ```json
  {
    "success": false,
    "message": "Request failed",
    "error": {
      "type": "validation_error",
      "details": []
    }
  }
  ```

#### 1) Get featured properties
- Method: GET
- Endpoint URL: /api/properties?featured=true
- Required query parameters: None
- Example request: GET /api/properties?featured=true
- Example JSON response:
  ```json
  {
    "success": true,
    "message": "Featured properties loaded",
    "data": {
      "properties": [
        {
          "id": "prop-001",
          "title": "Bright 3-Bedroom Condo",
          "location": "Tampines",
          "price": 980000,
          "propertyType": "Condo",
          "bedrooms": 3,
          "bathrooms": 2,
          "floorArea": 1200,
          "images": ["/images/prop-001.jpg"],
          "featured": true,
          "postedDate": "2026-06-15"
        }
      ]
    }
  }
  ```
- Expected success response codes: 200 OK
- Expected error response codes: 400 Bad Request, 500 Internal Server Error
- Error response structure:
  ```json
  {
    "success": false,
    "message": "Unable to load featured properties",
    "error": {
      "type": "api_error",
      "details": ["Service unavailable"]
    }
  }
  ```

#### 2) Search properties
- Method: GET
- Endpoint URL: /api/properties
- Required query parameters: Optional query parameters such as location, propertyType, minPrice, maxPrice, bedrooms, bathrooms, sort, page, and limit
- Example request: GET /api/properties?location=Tampines&propertyType=Condo&minPrice=800000&maxPrice=1200000&bedrooms=3&sort=price_asc&page=1&limit=12
- Example JSON response:
  ```json
  {
    "success": true,
    "message": "Properties found",
    "data": {
      "properties": [
        {
          "id": "prop-001",
          "title": "Bright 3-Bedroom Condo",
          "location": "Tampines",
          "price": 980000,
          "propertyType": "Condo",
          "bedrooms": 3,
          "bathrooms": 2,
          "floorArea": 1200,
          "images": ["/images/prop-001.jpg"],
          "featured": true,
          "postedDate": "2026-06-15"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 12,
        "totalItems": 48,
        "totalPages": 4
      }
    }
  }
  ```
- Expected success response codes: 200 OK
- Expected error response codes: 400 Bad Request, 422 Unprocessable Entity, 500 Internal Server Error
- Error response structure:
  ```json
  {
    "success": false,
    "message": "Invalid search parameters",
    "error": {
      "type": "validation_error",
      "details": ["minPrice cannot be greater than maxPrice"]
    }
  }
  ```

#### 3) Get property details
- Method: GET
- Endpoint URL: /api/properties/:id
- Required path parameters: id
- Example request: GET /api/properties/prop-001
- Example JSON response:
  ```json
  {
    "success": true,
    "message": "Property details loaded",
    "data": {
      "property": {
        "id": "prop-001",
        "title": "Bright 3-Bedroom Condo",
        "slug": "bright-3-bedroom-condo",
        "location": "Tampines",
        "propertyType": "Condo",
        "price": 980000,
        "bedrooms": 3,
        "bathrooms": 2,
        "floorArea": 1200,
        "description": "A bright and modern condo close to MRT and schools.",
        "amenities": ["Pool", "Gym", "Security"],
        "images": ["/images/prop-001.jpg"],
        "featured": true,
        "postedDate": "2026-06-15",
        "district": "East",
        "developer": "Apex Homes",
        "status": "Available"
      }
    }
  }
  ```
- Expected success response codes: 200 OK
- Expected error response codes: 404 Not Found, 500 Internal Server Error
- Error response structure:
  ```json
  {
    "success": false,
    "message": "Property not found",
    "error": {
      "type": "not_found",
      "details": ["Property with id prop-001 was not found"]
    }
  }
  ```

#### 4) Get related properties
- Method: GET
- Endpoint URL: /api/properties/related
- Required query parameters: Optional query parameters such as type and limit
- Example request: GET /api/properties/related?type=Condo&limit=4
- Example JSON response:
  ```json
  {
    "success": true,
    "message": "Related properties loaded",
    "data": {
      "properties": [
        {
          "id": "prop-002",
          "title": "Modern 2-Bedroom Condo",
          "location": "Pasir Ris",
          "price": 850000,
          "propertyType": "Condo",
          "bedrooms": 2,
          "bathrooms": 2,
          "floorArea": 980,
          "images": ["/images/prop-002.jpg"],
          "featured": false,
          "postedDate": "2026-06-20"
        }
      ]
    }
  }
  ```
- Expected success response codes: 200 OK
- Expected error response codes: 400 Bad Request, 500 Internal Server Error
- Error response structure:
  ```json
  {
    "success": false,
    "message": "Unable to load related properties",
    "error": {
      "type": "api_error",
      "details": ["Invalid query parameters"]
    }
  }
  ```

#### 5) Get moving services
- Method: GET
- Endpoint URL: /api/moving/services
- Required query parameters: None
- Example request: GET /api/moving/services
- Example JSON response:
  ```json
  {
    "success": true,
    "message": "Moving services loaded",
    "data": {
      "services": [
        {
          "id": "svc-001",
          "title": "Full Move Assistance",
          "description": "End-to-end moving support for your relocation.",
          "price": 450,
          "category": "Premium",
          "image": "/images/service-001.jpg",
          "ctaLabel": "Book Now",
          "ctaUrl": "/moving.html",
          "featured": true,
          "duration": "4 hours"
        }
      ]
    }
  }
  ```
- Expected success response codes: 200 OK
- Expected error response codes: 500 Internal Server Error
- Error response structure:
  ```json
  {
    "success": false,
    "message": "Unable to load moving services",
    "error": {
      "type": "api_error",
      "details": ["Service unavailable"]
    }
  }
  ```

### Page routing
- The website should use a multi-page navigation structure with standard HTML pages.
- Navigation between pages should use relative links such as index.html, search.html?location=Tampines&type=Condo, property.html?id=prop-001, mortgage.html, favourites.html, and moving.html.
- Dynamic content should use URL query parameters where appropriate, such as search filters and property IDs.
- The application should not use client-side routing or the History API.
- Each page should initialise only the functionality required for that page by detecting the current page inside initApp().

### Testing checklist
- Responsive layout on mobile, tablet, and desktop.
- Navigation links work correctly.
- Homepage search redirects correctly.
- Property search returns expected results.
- Search filters, sorting, and pagination function correctly.
- Property details load successfully.
- Mortgage calculator returns correct calculations.
- Favourite properties persist using localStorage.
- Moving services display correctly.
- Loading, empty, and error states behave correctly.
- API failures are handled gracefully.
- Accessibility features such as keyboard navigation and visible focus states work correctly.
- Browser compatibility is verified on Chrome, Edge, Firefox, and Safari.

### Logical build order
1. Foundation: Create the shared HTML structure for all pages and define the base CSS system, colour palette, spacing scale, typography, and responsive layout primitives.
2. Shared navigation and shell: Implement the consistent header, footer, mobile menu behaviour, skip link, and shared component placeholders so every page inherits the same structure.
3. Core page templates: Build the homepage, search page, property page, mortgage page, favourites page, and moving services page with semantic HTML and placeholders for dynamic content.
4. Shared JavaScript foundation: Add app.js initialisation, DOM helpers, state management, shared constants, storage helpers, formatting utilities, and reusable rendering functions.
5. Property content and interactions: Implement property card rendering, search filtering, sorting, pagination, favourite toggling, image fallback handling, and navigation to property details.
6. Specialised features: Build the mortgage calculator, favourites page, moving services rendering, empty/error states, and loading indicators.
7. Backend integration: Connect the pages to the planned API endpoints, replace placeholder data with live responses, and centralise endpoint handling using the single API_BASE_URL constant.
8. Testing and optimisation: Verify form validation, error handling, favourite persistence, search flows, shareable URL behaviour, accessibility, and responsive behaviour across device sizes, then refine performance and polish.
