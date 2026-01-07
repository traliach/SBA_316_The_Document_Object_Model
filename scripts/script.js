"use strict";



// --------------------
// Debug helper 
// --------------------
const DEBUG = false;
function debugLog(...args) {
  if (DEBUG) console.log(...args);
}

// --------------------
// BOM persistence key (SBA: localStorage)
// --------------------
const FAVORITES_KEY = "pizzaFavorites";

// --------------------
// Local data (SBA: array of objects)
// --------------------
const deals = [
  {
    id: "deal-1",
    restaurant: "Slice City",
    dealName: "2 Slices + Soda",
    price: 7.99,
    type: "Lunch",
    rating: 4.3,
    url: "https://example.com/slice-city",
  },
  {
    id: "deal-2",
    restaurant: "Mama Mia Pizza",
    dealName: "Large 1-Topping",
    price: 11.99,
    type: "Carryout",
    rating: 4.1,
    url: "https://example.com/mama-mia",
  },
  {
    id: "deal-3",
    restaurant: "Downtown Pies",
    dealName: "Family Combo",
    price: 19.99,
    type: "Delivery",
    rating: 4.6,
    url: "https://example.com/downtown-pies",
  },
];

// --------------------
// DOM caching (SBA: document.getElementById + document.querySelector)
// --------------------
const els = {
  filtersForm: document.getElementById("filtersForm"),
  qInput: document.getElementById("q"),
  qHelp: document.querySelector("#qHelp"),
  typeSelect: document.getElementById("type"),
  sortSelect: document.getElementById("sort"),
  minPrice: document.getElementById("minPrice"),
  maxPrice: document.getElementById("maxPrice"),
  priceHelp: document.querySelector("#priceHelp"),
  searchBtn: document.getElementById("searchBtn"),
  dealsGrid: document.getElementById("dealsGrid"),
  dealsCount: document.querySelector("#dealsCount"),
  emptyState: document.getElementById("emptyState"),
  dealCardTpl: document.getElementById("dealCardTpl"),
  detailsEmpty: document.getElementById("detailsEmpty"),
  detailsBody: document.getElementById("detailsBody"),
  detailsName: document.getElementById("detailsName"),
  detailsRestaurant: document.getElementById("detailsRestaurant"),
  detailsMeta: document.getElementById("detailsMeta"),
  detailsLink: document.getElementById("detailsLink"),
};

// --------------------
// App state (SBA: 3 variables)
// --------------------
let favorites = new Set();
let currentList = deals;
let selectedDealId = null;

// --------------------
// Small helpers (SBA: 3 functions)
// --------------------
function money(n) {
  return `$${n.toFixed(2)}`;
}

function normalize(s) {
  return s.trim().toLowerCase();
}

function parsePriceInput(el) {
  const raw = el.value.trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

// --------------------
// Build dropdown options (SBA: document.createElement + appendChild)
// --------------------
function buildTypeOptions(list) {
  const set = new Set();
  for (const d of list) set.add(d.type);
  const types = [...set].sort();

  for (const t of types) {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    els.typeSelect.appendChild(opt);
  }
}

// --------------------
// Validation (Demo part 1)
// - Search: 0 chars ok, 1 char shows error, 2+ ok
// - Price: if min > max, inputs turn red and Search disables (attribute change)
// --------------------
function validateSearch() {
  const q = normalize(els.qInput.value);
  const ok = q.length === 0 || q.length >= 2;

  // Bulma classes for user feedback
  els.qInput.classList.toggle("is-danger", !ok);
  els.qHelp.classList.toggle("is-hidden", ok);

  return ok;
}

function validatePriceRange() {
  const min = parsePriceInput(els.minPrice);
  const max = parsePriceInput(els.maxPrice);

  const ok = min === null || max === null || min <= max;

  // Bulma visual feedback
  els.minPrice.classList.toggle("is-danger", !ok);
  els.maxPrice.classList.toggle("is-danger", !ok);
  els.priceHelp.classList.toggle("is-hidden", ok);

  // Attribute change requirement: disable the button when invalid
  els.searchBtn.disabled = !ok;

  return ok;
}

// --------------------
// Filtering + sorting (Demo part 2)
// Order: search -> type -> price -> sort
// --------------------
function applySearch(list, q) {
  if (!q) return list;
  return list.filter(
    (d) =>
      normalize(d.restaurant).includes(q) || normalize(d.dealName).includes(q)
  );
}

function applyType(list, type) {
  if (!type) return list;
  return list.filter((d) => d.type === type);
}

function applyPriceRange(list, min, max) {
  return list.filter((d) => {
    if (min !== null && d.price < min) return false;
    if (max !== null && d.price > max) return false;
    return true;
  });
}

function applySort(list, sortKey) {
  if (!sortKey) return list;
  const copy = [...list];

  switch (sortKey) {
    case "priceAsc":
      copy.sort((a, b) => a.price - b.price);
      break;
    case "priceDesc":
      copy.sort((a, b) => b.price - a.price);
      break;
    case "ratingDesc":
      copy.sort((a, b) => b.rating - a.rating);
      break;
    default:
      break;
  }

  return copy;
}

// --------------------
// Favorites (BOM: localStorage) - Demo part 3
// --------------------
function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function saveFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
}

// --------------------
// Rendering cards (SBA: template + cloneNode + DocumentFragment)
// --------------------
function updateCount(showing, total) {
  els.dealsCount.textContent = `Showing ${showing} of ${total} deals.`;
}

function renderDeals(list) {
  els.dealsGrid.textContent = "";

  const frag = document.createDocumentFragment();

  for (const deal of list) {
    const card = els.dealCardTpl.content.cloneNode(true);

    card.querySelector('[data-role="dealName"]').textContent = deal.dealName;
    card.querySelector('[data-role="restaurant"]').textContent = deal.restaurant;
    card.querySelector('[data-role="type"]').textContent = deal.type;
    card.querySelector('[data-role="price"]').textContent = money(deal.price);
    card.querySelector('[data-role="rating"]').textContent = `⭐ ${deal.rating}`;

    const link = card.querySelector('[data-role="link"]');
    link.href = deal.url;

    const col = card.querySelector(".column");
    col.dataset.dealId = deal.id;

    const favBtn = card.querySelector('[data-action="favorite"]');
    const isFav = favorites.has(deal.id);
    favBtn.textContent = isFav ? "★" : "☆";
    favBtn.setAttribute("aria-pressed", String(isFav));

    frag.appendChild(card);
  }

  els.dealsGrid.appendChild(frag);

  // Re-apply active styling after rerender (DOM navigation: parent/child)
  if (selectedDealId) {
    const activeCol = els.dealsGrid.querySelector(
      `.column[data-deal-id="${selectedDealId}"]`
    );
    if (activeCol) {
      const activeCard = activeCol.firstElementChild;
      if (activeCard) activeCard.classList.add("is-active");
    }
  }
}

// --------------------
// Details panel (Demo part 4)
// - Clicking a card updates details text + link
// - Uses location.hash for deep-linking and refresh/back support
// --------------------
function renderDetails(deal) {
  if (!deal) {
    els.detailsBody.classList.add("is-hidden");
    els.detailsEmpty.classList.remove("is-hidden");
    selectedDealId = null;
    if (location.hash) location.hash = "";
    return;
  }

  els.detailsEmpty.classList.add("is-hidden");
  els.detailsBody.classList.remove("is-hidden");

  els.detailsName.textContent = deal.dealName;
  els.detailsRestaurant.textContent = deal.restaurant;
  els.detailsMeta.textContent = `${deal.type} • ${money(deal.price)} • ⭐ ${deal.rating}`;
  els.detailsLink.href = deal.url;
}

function clearActiveDeal() {
  selectedDealId = null;
  renderDetails(null);
  for (const col of els.dealsGrid.children) {
    const card = col.firstElementChild;
    if (card) card.classList.remove("is-active");
  }
}

function setActiveDeal(id) {
  selectedDealId = id;

  // DOM navigation requirement: parentElement + child traversal
  for (const col of els.dealsGrid.children) {
    const card = col.firstElementChild;
    if (!card) continue;
    card.classList.toggle("is-active", col.dataset.dealId === id);
  }

  const deal = deals.find((d) => d.id === id) || null;
  renderDetails(deal);

  // BOM: location.hash as state
  if (deal) location.hash = deal.id;
}

function getDealIdFromHash() {
  const id = (location.hash || "").replace(/^#/, "");
  return id || null;
}

// --------------------
// Init + event listeners (SBA: 2+ listeners)
// submit/input/change/click/hashchange
// --------------------
function init() {
  debugLog("init");
  favorites = loadFavorites();
  updateCount(deals.length, deals.length);
  currentList = deals;
  renderDeals(currentList);
  els.emptyState.classList.add("is-hidden");
  buildTypeOptions(deals);
  renderDetails(null);

  els.minPrice.addEventListener("input", validatePriceRange);
  els.maxPrice.addEventListener("input", validatePriceRange);

  function runFilters() {
    if (!validateSearch()) return;
    if (!validatePriceRange()) return;
    const q = normalize(els.qInput.value);
    const type = els.typeSelect.value;
    const sortKey = els.sortSelect.value;
    const min = parsePriceInput(els.minPrice);
    const max = parsePriceInput(els.maxPrice);

    const filtered = applySort(
      applyPriceRange(applyType(applySearch(deals, q), type), min, max),
      sortKey
    );
    currentList = filtered;
    updateCount(filtered.length, deals.length);
    renderDeals(currentList);

    els.emptyState.classList.toggle("is-hidden", currentList.length > 0);
    if (selectedDealId && !currentList.some((d) => d.id === selectedDealId)) {
      clearActiveDeal();
    }
  }

  // Auto-refresh results when user clears/updates the search input
  els.qInput.addEventListener("input", () => {
    const ok = validateSearch();
    const q = normalize(els.qInput.value);
    if (!ok) return;
    if (q.length === 0 || q.length >= 2) runFilters();
  });

  els.filtersForm.addEventListener("submit", (e) => {
    e.preventDefault();
    runFilters();
  });

  els.typeSelect.addEventListener("change", runFilters);
  els.sortSelect.addEventListener("change", runFilters);

  document.getElementById("clearBtn").addEventListener("click", () => {
    els.qInput.value = "";
    els.typeSelect.value = "";
    els.sortSelect.value = "";
    els.minPrice.value = "";
    els.maxPrice.value = "";
    validateSearch();
    validatePriceRange();
    updateCount(deals.length, deals.length);
    currentList = deals;
    renderDeals(currentList);
    els.emptyState.classList.add("is-hidden");
  });

  els.dealsGrid.addEventListener("click", (e) => {
    const btn = e.target.closest('[data-action="favorite"]');
    if (!btn) return;
    const col = btn.closest(".column");
    if (!col) return;

    const id = col.dataset.dealId;
    if (!id) return;

    if (favorites.has(id)) favorites.delete(id);
    else favorites.add(id);

    saveFavorites();
    renderDeals(currentList);
  });

  // Card click -> details (event delegation)
  els.dealsGrid.addEventListener("click", (e) => {
    if (e.target.closest('[data-action="favorite"]')) return;
    if (e.target.closest('a[data-role="link"]')) return;

    const col = e.target.closest(".column");
    if (!col) return;
    const id = col.dataset.dealId;
    if (!id) return;

    setActiveDeal(id);
  });

  window.addEventListener("hashchange", () => {
    const id = getDealIdFromHash();
    if (!id) return;
    if (!deals.some((d) => d.id === id)) return;
    setActiveDeal(id);
  });

  validatePriceRange();

  const initialId = getDealIdFromHash();
  if (initialId && deals.some((d) => d.id === initialId)) {
    setActiveDeal(initialId);
  }
}

init();
