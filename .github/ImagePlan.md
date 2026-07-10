## Plan: Homepage hero background slideshow

Replace the static hero background with a full-screen background slideshow that rotates local house images and keeps the existing hero content layered on top.

**Steps**
1. Create a local image set in an images/homepage folder using four compressed house-themed assets.
2. Update the homepage hero markup in index.html to add a slideshow container and overlay behind the existing hero content.
3. Extend style.css with full-screen slideshow positioning, fade transitions, overlay styling, and responsive behavior.
4. Update app.js to initialize the slideshow, preload the first image, and rotate between images every 6 seconds.
5. Verify the homepage still shows the existing navigation, hero text, buttons, and search form while the background changes automatically.

**Relevant files**
- index.html — add the background slideshow container behind the hero content.
- style.css — style the full-screen slideshow, overlay, fade animation, and responsive layout.
- app.js — initialize the slideshow and rotate the images automatically.

**Decisions**
- The slideshow will use local assets only so the home page remains self-contained.
- The existing layout and functionality will remain unchanged; only the hero background will be replaced.
- The implementation will stay lightweight and use vanilla HTML, CSS, and JavaScript only.

**Verification**
1. Open the home page and confirm the hero background now fades between local house images.
2. Confirm the hero text, buttons, and search form remain readable and positioned correctly.
3. Confirm the slideshow loops continuously and the homepage still works as before.
