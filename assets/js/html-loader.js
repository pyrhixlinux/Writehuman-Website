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

  // Highlight active mobile menu item
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const mobileNavLinks = document.querySelectorAll(".mobile-bottom-navigation a.action-btn");
  
  mobileNavLinks.forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });

  setupSearch();
  setupMobilePopup();
}

function setupMobilePopup() {
  const serviceBtn = document.getElementById("mobile-service-btn");
  const popup = document.querySelector("[data-mobile-service-popup]");
  const overlay = document.querySelector("[data-overlay]");
  const closeBtn = document.querySelector("[data-mobile-service-close-btn]");

  if (!serviceBtn || !popup || !overlay) return;

  const togglePopup = () => {
    popup.classList.toggle("active");
    overlay.classList.toggle("active");
    document.body.classList.toggle("active"); // Prevent scrolling if needed, but simple CSS active is mostly enough
  };

  const closePopup = () => {
    popup.classList.remove("active");
    overlay.classList.remove("active");
    document.body.classList.remove("active");
  };

  serviceBtn.addEventListener("click", togglePopup);
  if (closeBtn) closeBtn.addEventListener("click", closePopup);
  overlay.addEventListener("click", closePopup);
}

function setupSearch() {
  const searchInput = document.querySelector(".header-search-container .search-field");
  const searchBtn = document.querySelector(".header-search-container .search-btn");

  if (!searchInput || !searchBtn) return;

  const keywordMap = {
    "skripsi": "jasaskripsidetail.html",
    "ta": "jasaskripsidetail.html",
    "tugas akhir": "jasaskripsidetail.html",
    
    "jurnal": "jasajurnaldetail.html",
    "publikasi": "jasajurnaldetail.html",
    "paper": "jasajurnaldetail.html",
    "journal": "jasajurnaldetail.html",
    
    "parafrase": "jasaparafasedetail.html",
    "parafase": "jasaparafasedetail.html", 
    "parapase": "jasaparafasedetail.html", // User typo
    "rewrite": "jasaparafasedetail.html",
    
    "turnitin": "cekturnitindetail.html",
    "cek plagiasi": "cekturnitindetail.html",
    "plagiasi": "cekturnitindetail.html",
    "cek": "cekturnitindetail.html",
    
    "ketik": "jasaketikdetail.html",
    "ngetik": "jasaketikdetail.html",
    "word": "jasaketikdetail.html",
    "typing": "jasaketikdetail.html",
    
    "desain": "jasadesaindetail.html",
    "design": "jasadesaindetail.html",
    "ppt": "jasadesaindetail.html",
    "powerpoint": "jasadesaindetail.html",
    "presentasi": "jasadesaindetail.html",
    "poster": "jasadesaindetail.html",
    
    "makalah": "makalahdetail.html",
    
    "edit": "jasaeditingdetail.html",
    "editing": "jasaeditingdetail.html",
    "editor": "jasaeditingdetail.html"
  };

  const handleSearch = () => {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) return;

    let targetPage = "services.html"; // Default fallback

    // Check for exact or partial matches in the map
    for (const [key, page] of Object.entries(keywordMap)) {
      if (query.includes(key)) {
        targetPage = page;
        break; 
      }
    }
    
    window.location.href = targetPage;
  };

  searchBtn.addEventListener("click", handleSearch);

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  });
}

// Start loading when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadComponents);
} else {
  loadComponents();
}
