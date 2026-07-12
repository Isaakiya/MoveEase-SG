## Plan: Replace the legacy MoveEase assistant UI with the Botpress embed

This plan is intentionally slow and conservative. It only replaces the old custom chatbot UI with the Botpress embed and leaves all property search, listings, mortgage, navigation, API, and integration logic untouched.

### Safety rules for this migration
- Do not delete any HTML, CSS, or JavaScript.
- Do not disable JavaScript until Botpress has been tested successfully.
- Only edit one page at a time.
- Stop after each step and wait for your confirmation before moving on.
- Protect all non-chatbot features: property search, property listings, mortgage calculator, navigation, API calls, n8n integrations, NotebookLM integrations, AI recommendation logic, and shared utility functions.

### Dependency check before any JavaScript change
I verified that the old assistant initialization is handled by [app.js](app.js) through `initAssistantFeature()`. I also verified that the current workspace does not show any other feature calling `initAssistantFeature()` outside [app.js](app.js), so it appears to be used only by the old assistant startup path. Because of that, it is safe to disable only after the Botpress widget has already been tested successfully.

### Pre-step check: verify whether [index.html](index.html) already includes [app.js](app.js)
- File to edit: [index.html](index.html)
- Current code before change:

```html
    <footer id="site-footer" class="site-footer"></footer>

    <button class="assistant-launcher" type="button" id="assistant-launcher" aria-controls="assistant-panel" aria-expanded="false">
      <span class="assistant-launcher__icon" aria-hidden="true">?</span>
      <span class="assistant-launcher__label">Assistant</span>
    </button>

    <aside class="assistant-panel" id="assistant-panel" aria-labelledby="assistant-panel-title" hidden>
      <header class="assistant-panel__header">
        <div>
          <p class="assistant-panel__eyebrow">MoveEase AI</p>
          <h2 id="assistant-panel-title">MoveEase AI Assistant</h2>
        </div>
        <button class="assistant-panel__close" type="button" id="assistant-close" aria-label="Close assistant">�</button>
      </header>

      <div class="assistant-panel__messages" id="assistant-messages" aria-live="polite" tabindex="0">
        <div id="assistant-empty-state" class="assistant-panel__empty-state">
          <p>Ask me about homes, budgets, or nearby amenities.</p>
        </div>
        <div id="assistant-typing" class="assistant-panel__typing" hidden aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <form class="assistant-panel__composer" id="assistant-form" novalidate>
        <label class="assistant-panel__field" for="assistant-input">
          <span class="sr-only">Ask the assistant</span>
          <input type="text" id="assistant-input" name="assistantInput" placeholder="Ask about homes, budgets, or locations" autocomplete="off" />
        </label>
        <button class="assistant-panel__send" type="submit" id="assistant-send">Send</button>
      </form>
    </aside>

    <script src="app.js" defer></script>
  </body>
</html>
```

- What to do: do not add another `<script src="app.js" defer></script>`.
- Instead, insert only the two Botpress scripts immediately before the existing app.js script.
- Why this is safe: it avoids duplicate script loading and keeps the existing site script intact.
- Test: refresh the page and check that the site still loads normally.
- Expected result: the page loads as before, and the next step will add the Botpress scripts without duplicating app.js.

- After this check, stop and wait for your confirmation before continuing.

### Step 1 � Add the Botpress scripts to the homepage only
- File to edit: [index.html](index.html)
- Exact insertion location: insert the two Botpress scripts immediately before the existing app.js script tag.
- Code before change:

```html
    <script src="app.js" defer></script>
  </body>
</html>
```

- Code after change:

```html
    <script src="https://cdn.botpress.cloud/webchat/v3.6/inject.js"></script>
    <script src="https://files.bpcontent.cloud/2026/07/12/05/20260712053030-XLQ28LEK.js" defer></script>
    <script src="app.js" defer></script>
  </body>
</html>
```

- Why this is safe: it adds the new Botpress embed without deleting or changing any existing HTML, CSS, or JavaScript. It also keeps the shared app.js file intact.
- How to test: open [index.html](index.html) in your browser, hard refresh the page, and look for the Botpress widget in the lower-right area.
- Expected result: the homepage loads normally and the Botpress widget appears without breaking navigation or page content.

- After this step, stop and wait for your confirmation before continuing.

### Step 2 � Add the Botpress scripts to the property page only
- File to edit: [property.html](property.html)
- Exact insertion location: insert the two Botpress scripts immediately before the existing app.js script tag.
- Code before change:

```html
    <script src="app.js" defer></script>
  </body>
</html>
```

- Code after change:

```html
    <script src="https://cdn.botpress.cloud/webchat/v3.6/inject.js"></script>
    <script src="https://files.bpcontent.cloud/2026/07/12/05/20260712053030-XLQ28LEK.js" defer></script>
    <script src="app.js" defer></script>
  </body>
</html>
```

- Why this is safe: it adds Botpress to the property page only, without touching property rendering, mortgage logic, or shared site JavaScript.
- How to test: open [property.html](property.html), hard refresh it, and check that the Botpress widget appears and the page still renders correctly.
- Expected result: the property page still works normally and the Botpress widget appears.

- After this step, stop and wait for your confirmation before continuing.

### Step 3 � Add the Botpress scripts to the search page only
- File to edit: [search.html](search.html)
- Exact insertion location: insert the two Botpress scripts immediately before the existing app.js script tag.
- Code before change:

```html
    <script src="app.js" defer></script>
  </body>
</html>
```

- Code after change:

```html
    <script src="https://cdn.botpress.cloud/webchat/v3.6/inject.js"></script>
    <script src="https://files.bpcontent.cloud/2026/07/12/05/20260712053030-XLQ28LEK.js" defer></script>
    <script src="app.js" defer></script>
  </body>
</html>
```

- Why this is safe: it adds Botpress to the search page only, without altering search filtering, pagination, or the shared app logic.
- How to test: open [search.html](search.html), hard refresh it, and check that the Botpress widget appears and the search page is still usable.
- Expected result: the search page still works normally and the Botpress widget appears.

- After this step, stop and wait for your confirmation before continuing.

### Step 4 � Hide the old chatbot UI only after Botpress has been tested on all three pages
- File to edit: [style.css](style.css)
- Exact insertion location: insert the temporary rule immediately before the existing `.assistant-launcher` block.
- Code before change:

```css
.site-footer a {
  color: #f8fafc;
}

.assistant-launcher {
```

- Code after change:

```css
.site-footer a {
  color: #f8fafc;
}

.assistant-launcher,
.assistant-panel {
  display: none !important;
}

.assistant-launcher {
```

- Why this is safe: it only hides the old assistant UI visually. It does not delete any HTML, CSS, or JavaScript and it leaves the old code available if you want to restore it later.
- How to test: reload the homepage, property page, and search page and confirm that the old assistant launcher and panel are no longer visible while the Botpress widget remains visible.
- Expected result: the old custom chatbot UI is hidden and Botpress is the only visible chatbot interface.

- After this step, stop and wait for your confirmation before continuing.

### Step 5 � Disable the old assistant startup in JavaScript only after Botpress has been confirmed working
- File to edit: [app.js](app.js)
- Exact insertion location: change the first line inside `initApp()` so the old assistant startup is commented out.
- Code before change:

```js
function initApp() {
  initAssistantFeature();
  renderNavigation(document.getElementById("site-nav"));
  renderFooter(document.getElementById("site-footer"));
```

- Code after change:

```js
function initApp() {
  // initAssistantFeature();
  renderNavigation(document.getElementById("site-nav"));
  renderFooter(document.getElementById("site-footer"));
```

- Why this is safe: it disables only the old assistant startup path. I verified that no other website features call `initAssistantFeature()` outside [app.js](app.js), so this change should not affect property search, listings, mortgage, navigation, or the shared API logic.
- How to test: reload the site and confirm that the old custom assistant no longer opens or responds while the Botpress widget still works.
- Expected result: the website continues to work normally, and Botpress is the active chatbot experience.

- After this step, stop and wait for your confirmation before continuing.

### Final safety note
No HTML, CSS, or JavaScript should be deleted during this migration. The plan above only adds the Botpress embed, temporarily hides the old assistant UI, and then disables the old assistant startup path after Botpress has been verified.