"use strict";

const DEBUG = false;
function debugLog(...args) {
  if (DEBUG) console.log(...args);
}

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
  dealsGrid: document.getElementById("dealsGrid"),
  dealsCount: document.querySelector("#dealsCount"),
  dealCardTpl: document.getElementById("dealCardTpl"),
};

function money(n) {
  return `$${n.toFixed(2)}`;
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

    frag.appendChild(card);
  }

  els.dealsGrid.appendChild(frag);
}

function init() {
  debugLog("init");
  els.dealsCount.textContent = `Loaded ${deals.length} deals.`;
  renderDeals(deals);
}

init();
