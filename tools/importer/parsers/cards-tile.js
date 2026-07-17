/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-tile. Base: cards.
 * Source: https://www.straighttalk.com/
 * Container (cards) block. Each tile = 1 row, 2 cells: image (reference) + text (richtext).
 * Model fields per card item: image (reference), text (richtext).
 * cards-tile = title + description + arrow "Shop now" link, over a background image.
 * Source has desktop + mobile copies — de-dupe by tile href.
 */
export default function parse(element, { document }) {
  let tiles = Array.from(element.querySelectorAll('.image-container.banner-tile, .banner-tile'));

  const seenHref = new Set();
  const seenEl = new Set();
  tiles = tiles.filter((tile) => {
    if (!tile || seenEl.has(tile)) return false;
    seenEl.add(tile);
    const link = tile.querySelector('a[href]');
    const href = tile.getAttribute('data-tile-href') || (link && link.getAttribute('href'));
    if (href) {
      if (seenHref.has(href)) return false;
      seenHref.add(href);
    }
    return true;
  });

  const cells = [];

  tiles.forEach((tile) => {
    // Background/product image: real <img> or CSS background-image
    let img = tile.querySelector('img');
    if (!img) {
      const bgHost = tile.matches('[style*="background-image"]') ? tile : tile.querySelector('[style*="background-image"]');
      const m = bgHost && (bgHost.getAttribute('style') || '').match(/background-image:\s*url\((['"]?)(.*?)\1\)/i);
      if (m && m[2]) { img = document.createElement('img'); img.src = m[2]; }
    }

    // Title + description paragraphs, plus the Shop now link
    const link = tile.querySelector('a[href]');
    const paras = Array.from(tile.querySelectorAll('p'))
      .filter((p) => (!link || !link.contains(p)) && p.textContent.trim().length > 0);
    // Strip inner arrow imgs from the link, keep just the label + href
    if (link) link.querySelectorAll('img').forEach((i) => i.remove());

    const imgFrag = document.createDocumentFragment();
    if (img) {
      imgFrag.appendChild(document.createComment(' field:image '));
      imgFrag.appendChild(img);
    }

    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    paras.forEach((p) => textFrag.appendChild(p));
    if (link) textFrag.appendChild(link);

    if (!img && paras.length === 0 && !link) return;

    cells.push([img ? imgFrag : '', textFrag]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-tile', cells });
  element.replaceWith(block);
}
