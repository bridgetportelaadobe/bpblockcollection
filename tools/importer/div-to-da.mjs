// Convert EDS render-format .plain.html (block divs) into DA document format
// (block tables). DA carries block identity in a table whose first row names
// the block; the EDS renderer converts that back into <div class="blockname">.
// Usage: node div-to-da.mjs <input.plain.html> <output.da.html>
import { readFileSync, writeFileSync } from 'node:fs';
import { JSDOM } from '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts/node_modules/jsdom/lib/api.js';

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error('Usage: node div-to-da.mjs <input.plain.html> <output.da.html>');
  process.exit(1);
}

const raw = readFileSync(inPath, 'utf-8');
const dom = new JSDOM(`<!DOCTYPE html><html><body>${raw}</body></html>`);
const { document } = dom.window;
const body = document.body;

// The plain.html root is a single wrapper <div> containing block divs and
// default-content interleaved. Block divs have a class; default content and
// the section wrapper do not.
const KNOWN_BLOCKS = new Set([
  'hero-marquee', 'columns-promo', 'cards-promo', 'hero-promo', 'cards-icon',
  'cards-plans', 'cards-feature', 'cards-product', 'cards-tile', 'accordion-faq',
]);

// Build a DA <main> whose children are sections (<div>). We keep a single
// section and drop <hr> handling since the source plain.html had no section
// metadata. Blocks become tables; everything else is copied through.
const main = document.createElement('main');
const section = document.createElement('div');
main.append(section);

// Convert one block div (<div class="name"><div>row</div>...) into a DA table.
function blockToTable(blockDiv, blockName) {
  const table = document.createElement('table');
  // header row: block name spanning the widest row's column count
  const rows = [...blockDiv.children].filter((c) => c.tagName === 'DIV');
  const maxCols = rows.reduce(
    (m, r) => Math.max(m, [...r.children].filter((c) => c.tagName === 'DIV').length || 1),
    1,
  );
  const thead = document.createElement('tr');
  const th = document.createElement('td');
  if (maxCols > 1) th.setAttribute('colspan', String(maxCols));
  th.textContent = blockName;
  thead.append(th);
  table.append(thead);

  rows.forEach((row) => {
    const tr = document.createElement('tr');
    const cells = [...row.children].filter((c) => c.tagName === 'DIV');
    if (cells.length === 0) {
      // row is itself a single cell (its children are content)
      const td = document.createElement('td');
      while (row.firstChild) td.append(row.firstChild);
      tr.append(td);
    } else {
      cells.forEach((cell) => {
        const td = document.createElement('td');
        // strip field-marker comments; move real content
        [...cell.childNodes].forEach((n) => {
          if (n.nodeType === 8) return; // comment
          td.append(n.cloneNode(true));
        });
        tr.append(td);
      });
    }
    table.append(tr);
  });
  return table;
}

// Walk the top-level wrapper's children in order.
const wrapper = body.querySelector(':scope > div') || body;
[...wrapper.childNodes].forEach((node) => {
  if (node.nodeType === 1 && node.tagName === 'DIV') {
    const cls = (node.getAttribute('class') || '').trim();
    if (KNOWN_BLOCKS.has(cls)) {
      section.append(blockToTable(node, cls));
      return;
    }
    if (cls === 'metadata') {
      // metadata block -> table named "Metadata" (DA convention)
      section.append(blockToTable(node, 'Metadata'));
      return;
    }
    // unclassed div: could be a nested section wrapper — recurse its children
    [...node.childNodes].forEach((inner) => section.append(inner.cloneNode(true)));
    return;
  }
  // default content (text, headings, etc.)
  section.append(node.cloneNode(true));
});

const out = `<body>\n  <header></header>\n  ${main.outerHTML}\n  <footer></footer>\n</body>`;
writeFileSync(outPath, out, 'utf-8');

// Report
const tableCount = main.querySelectorAll('table').length;
console.log(`Wrote ${outPath}: ${tableCount} block tables`);
