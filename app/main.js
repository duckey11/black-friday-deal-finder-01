// Deal Radar: list page with live search, category / store / discount filters
// and sorting, plus one detail page per deal on hash routes. All data lives
// in data.js, so the site works with no network at all.
//
//   #/            the deal list
//   #/deal/<id>   one deal
//
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { deals } from './data.js';
import { dealPage, listPage, missingPage, percentOff, rows, summaryLine } from './views.js';

const app = document.getElementById('app');
const VERDICT_RANK = { 'new-low': 0, strong: 1, routine: 2 };
const categories = [...new Set(deals.map((d) => d.category))].sort();
const stores = [...new Set(deals.map((d) => d.store))].sort();

const state = { q: '', category: '', store: '', minOff: 0, sort: 'verdict' };

function applyFilters() {
  const q = state.q.trim().toLowerCase();
  let shown = deals.filter((d) => {
    if (state.category && d.category !== state.category) return false;
    if (state.store && d.store !== state.store) return false;
    if (percentOff(d) < state.minOff) return false;
    if (q && !`${d.title} ${d.store} ${d.category}`.toLowerCase().includes(q)) return false;
    return true;
  });
  const byPct = (a, b) => percentOff(b) - percentOff(a);
  const bySaved = (a, b) => b.was - b.price - (a.was - a.price);
  if (state.sort === 'pct') shown.sort(byPct);
  else if (state.sort === 'saved') shown.sort(bySaved);
  else if (state.sort === 'price') shown.sort((a, b) => a.price - b.price);
  else shown.sort((a, b) => VERDICT_RANK[a.verdict] - VERDICT_RANK[b.verdict] || byPct(a, b));
  return shown;
}

function refreshList() {
  const cards = document.getElementById('cards');
  const summary = document.getElementById('summary');
  if (!cards || !summary) return;
  const shown = applyFilters();
  const totalSaved = shown.reduce((sum, d) => sum + (d.was - d.price), 0);
  cards.innerHTML = rows(shown);
  summary.innerHTML = summaryLine(deals.length, shown.length, totalSaved);
}

function renderList() {
  document.title = 'Deal Radar — Black Friday 2026';
  app.innerHTML = listPage(applyFilters(), categories, stores);
  const q = document.getElementById('q');
  const category = document.getElementById('category');
  const store = document.getElementById('store');
  const minOff = document.getElementById('minOff');
  const sort = document.getElementById('sort');
  q.value = state.q;
  category.value = state.category;
  store.value = state.store;
  minOff.value = String(state.minOff);
  sort.value = state.sort;
  q.addEventListener('input', () => { state.q = q.value; refreshList(); });
  category.addEventListener('change', () => { state.category = category.value; refreshList(); });
  store.addEventListener('change', () => { state.store = store.value; refreshList(); });
  minOff.addEventListener('change', () => { state.minOff = Number(minOff.value); refreshList(); });
  sort.addEventListener('change', () => { state.sort = sort.value; refreshList(); });
  refreshList();
}

function render() {
  window.__shotReady = false;
  const match = location.hash.match(/^#\/deal\/([^/?]+)/);
  if (match) {
    const found = deals.find((d) => d.id === decodeURIComponent(match[1]));
    document.title = `${found ? found.title : 'Deal not found'} | Deal Radar`;
    app.innerHTML = found ? dealPage(found) : missingPage();
  } else {
    renderList();
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener('hashchange', render);
render();
