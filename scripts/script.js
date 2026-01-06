"use strict";

const DEBUG = false;
function debugLog(...args) {
  if (DEBUG) console.log(...args);
}

const FAVORITES_KEY = "pizzaFavorites";

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
  dealCardTpl: document.getElementById("dealCardTpl"),
};

let favorites = new Set();
let currentList = deals;

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

function validateSearch() {
  const q = normalize(els.qInput.value);
  const ok = q.length === 0 || q.length >= 2;

  els.qInput.classList.toggle("is-danger", !ok);
  els.qHelp.classList.toggle("is-hidden", ok);

  return ok;
}

function validatePriceRange() {
  const min = parsePriceInput(els.minPrice);
  const max = parsePriceInput(els.maxPrice);

  const ok = min === null || max === null || min <= max;

  els.minPrice.classList.toggle("is-danger", !ok);
  els.maxPrice.classList.toggle("is-danger", !ok);
  els.priceHelp.classList.toggle("is-hidden", ok);

  // Attribute change requirement: disable the button when invalid
  els.searchBtn.disabled = !ok;

  return ok;
}

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
}

function init() {
  debugLog("init");
  favorites = loadFavorites();
  updateCount(deals.length, deals.length);
  currentList = deals;
  renderDeals(currentList);
  buildTypeOptions(deals);

  els.qInput.addEventListener("input", validateSearch);
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
  }

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

  validatePriceRange();
}

init();
