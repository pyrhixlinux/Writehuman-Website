/**
 * html-loader.js
 * Loads HTML components dynamically and replaces placeholders.
 */
async function loadComponents() {
  const includes = document.querySelectorAll("[data-include]");
  const promises = [];

  includes.forEach((include) => {
    const file = include.getAttribute("data-include");
    const promise = fetch(file + '?t=' + new Date().getTime())
      .then((response) => {
        if (!response.ok) throw new Error(`Could not load ${file}`);
        return response.text();
      })
      .then((html) => {
        include.outerHTML = html;
        // Recursive call/Check if the loaded content has includes?
        // For now, assuming 1-level deep or index.html only has includes.
      })
      .catch((err) => {
        console.error("Error loading component:", err);
        include.innerHTML = `<p style="color:red">Error loading ${file}</p>`;
      });
    promises.push(promise);
  });

  await Promise.all(promises);

  // Dispatch event to signal that components are loaded
  document.dispatchEvent(new Event("componentsLoaded"));
}

// Start loading when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadComponents);
} else {
  loadComponents();
}
