// HTML for each page, built from the deal data. Every value is escaped before
// it goes into the page, and every discount is computed from the two prices,
// so a card can never show a discount the prices do not support.

const escape = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const usd = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
export const percentOff = (d) => Math.round((1 - d.price / d.was) * 100);
const saved = (d) => d.was - d.price;
const day = (iso) => new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }) + ' UTC';

export const VERDICTS = {
  'new-low': { label: 'New low', hint: 'Cheapest it has ever been' },
  strong: { label: 'Strong price', hint: 'A genuinely good cut' },
  routine: { label: 'Routine sale', hint: 'This price comes around often' },
};

export function verdictBadge(d) {
  const v = VERDICTS[d.verdict] || VERDICTS.routine;
  return `<span class="verdict verdict-${escape(d.verdict)}" title="${escape(v.hint)}">${escape(v.label)}</span>`;
}

function dealCard(d) {
  return `<li class="card">
  <a class="card-title" href="#/deal/${encodeURIComponent(d.id)}">${escape(d.title)}</a>
  <p class="card-meta">${escape(d.store)} &middot; ${escape(d.category)}</p>
  <p class="card-price"><strong>${usd(d.price)}</strong> <s>${usd(d.was)}</s> <span class="pct">${percentOff(d)}% off</span></p>
  <p class="card-save">You save ${usd(saved(d))}</p>
  <p class="card-verdict">${verdictBadge(d)} <span class="evidence">${escape(d.evidence)}</span></p>
  <p class="card-checked">Checked ${day(d.checked)}</p>
  <p class="card-links"><a class="store-link" href="${escape(d.url)}" rel="noopener" target="_blank">View at ${escape(d.store)} &rarr;</a></p>
</li>`;
}

export function rows(shown) {
  if (shown.length === 0) {
    return '<li class="empty">No deal matches those filters. Try clearing the search or a filter.</li>';
  }
  return shown.map(dealCard).join('');
}

export function summaryLine(total, shown, totalSaved) {
  return `<p class="summary"><strong>${shown} of ${total} deals</strong> &middot; ${usd(totalSaved)} in total savings across the deals shown</p>`;
}

export function listPage(deals, categories, stores) {
  const catOptions = categories.map((c) => `<option value="${escape(c)}">${escape(c)}</option>`).join('');
  const storeOptions = stores.map((s) => `<option value="${escape(s)}">${escape(s)}</option>`).join('');
  return `<section class="hero">
  <h1>Black Friday deals worth your money</h1>
  <p class="lede">26 deals from Amazon, Best Buy, Walmart and Costco, each checked on 27 Nov 2026. Every card shows the sale price, the usual price, the discount, when it was checked, where the price was read, and an honest verdict on whether it is really a deal.</p>
  <p class="legend"><span class="verdict verdict-new-low">New low</span> cheapest ever &nbsp; <span class="verdict verdict-strong">Strong price</span> a genuinely good cut &nbsp; <span class="verdict verdict-routine">Routine sale</span> this price comes around often</p>
</section>
<section class="controls" aria-label="Search and filter deals">
  <label class="control search-control">Search <input id="q" type="search" placeholder="Try &ldquo;Dyson&rdquo;, &ldquo;LEGO&rdquo;, &ldquo;headphones&rdquo;&hellip;" autocomplete="off"></label>
  <label class="control">Category <select id="category"><option value="">All categories</option>${catOptions}</select></label>
  <label class="control">Store <select id="store"><option value="">All stores</option>${storeOptions}</select></label>
  <label class="control">Discount <select id="minOff"><option value="0">Any discount</option><option value="20">20% off or more</option><option value="40">40% off or more</option><option value="50">50% off or more</option></select></label>
  <label class="control">Sort by <select id="sort"><option value="verdict">Best verdict first</option><option value="pct">Biggest % off</option><option value="saved">Most dollars saved</option><option value="price">Lowest price</option></select></label>
</section>
<p class="summary" id="summary"></p>
<ul class="cards" id="cards">${rows(deals)}</ul>`;
}

export function dealPage(d) {
  const v = VERDICTS[d.verdict] || VERDICTS.routine;
  return `<p class="back"><a href="#/">&larr; All deals</a></p>
<article class="detail">
  <p class="card-meta">${escape(d.store)} &middot; ${escape(d.category)}</p>
  <h1>${escape(d.title)}</h1>
  <p class="detail-price"><strong>${usd(d.price)}</strong> <s>${usd(d.was)}</s> <span class="pct">${percentOff(d)}% off</span></p>
  <p class="card-save">You save ${usd(saved(d))} off the usual price.</p>
  <p class="detail-verdict">${verdictBadge(d)} <strong>${escape(v.hint)}.</strong> ${escape(d.evidence)}</p>
  ${d.alsoAt ? `<p class="also">Compare: ${escape(d.alsoAt)}</p>` : ''}
  ${d.note ? `<p class="note">Note: ${escape(d.note)}</p>` : ''}
  <dl class="facts">
    <dt>Store</dt><dd>${escape(d.store)}</dd>
    <dt>Category</dt><dd>${escape(d.category)}</dd>
    <dt>Sale price</dt><dd>${usd(d.price)}</dd>
    <dt>Usual price</dt><dd>${usd(d.was)}</dd>
    <dt>Discount</dt><dd>${percentOff(d)}% off, ${usd(saved(d))} saved</dd>
    <dt>Price checked</dt><dd>${day(d.checked)}</dd>
    <dt>Price read in</dt><dd>${escape(d.source)}</dd>
  </dl>
  <p><a class="store-link big" href="${escape(d.url)}" rel="noopener" target="_blank">View it at ${escape(d.store)} &rarr;</a></p>
  <p class="check-note">Checked on 27 Nov 2026. Prices change during the sale, so confirm the price on the store page before buying.</p>
</article>`;
}

export function missingPage() {
  return `<h1>Deal not found</h1>
<p>There is no deal at this address. <a href="#/">See all deals</a>.</p>`;
}
