# Pizza Deal Finder (In My Town)

A simple single-page app to **search, filter, sort, and save favorite pizza deals**.

## How to run
- Open `index.html` in your browser, **or**
- Use VS Code **Live Server** and open the local URL it gives you.

## How to use
- **Search deals**: type at least 2 characters and click **Search**.
- Search checks all deal attributes (restaurant, deal name, type, price, rating, url, city, and tags, etc.).
- **Filters**: use the separate filters box to narrow results:
  - **Type**: Lunch / Carryout / Delivery
  - **Sort**: price or rating
  - **Price range**: set Min/Max price
    - If Min > Max, inputs turn red and **Search** is disabled until fixed.
- **Clear search**: clears only the search box.
- **Clear filters**: resets Type/Sort/Price filters.
- **Favorites**: click ♡ to save a favorite (becomes ♥). Favorites stay after refresh.
- **Deal details**: click a card to see details below. The URL updates (example `#deal-3`) so refresh/back/forward keeps the selected deal.

## Project structure note
- Deal data lives in `scripts/deals.js` (each deal includes an `image` field rendered on the card).

## What I practiced (high level)
- **DOM selection** with `getElementById` and `querySelector`
- **Creating elements** with `createElement` and adding them with `appendChild`
- **Templated rendering** using `<template>` + `cloneNode(true)` + `DocumentFragment`
- **Event-driven code** (submit/input/change/click)
- **Form validation** (HTML attributes + JS validation)
- **Browser features**: `localStorage` (favorites) and `location.hash` (selected deal)

