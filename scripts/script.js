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
};

function init() {
  debugLog("init");
  els.dealsCount.textContent = `Loaded ${deals.length} deals.`;
}

init();
