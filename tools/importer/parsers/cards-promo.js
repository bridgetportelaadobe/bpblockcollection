/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-promo. Base: cards.
 * Source: https://www.straighttalk.com/
 * Container (cards) block. Each card = 1 row, 2 cells: image (reference) + text (richtext).
 * Model fields per card item: image (reference), text (richtext).
 * Source has desktop/mobile/tablet duplicates per card — de-dupe by CTA href so each product appears once.
 */
export default function parse(element, { document }) {
  // Each product renders as desktop/mobile/tablet .banner-tile copies.
  // Collect all tiles, then de-dupe by CTA href (keep first = desktop) so each product appears once.
  let tiles = Array.from(element.querySelectorAll('.banner-tile'));

  // Fallback: responsive card columns if .banner-tile isn't present
  if (tiles.length === 0) {
    tiles = Array.from(element.querySelectorAll('.d-lg-block[class*="col-"], [class*="col-lg-"]'))
      .filter((el) => el.querySelector('img, a[href]'));
  }

  const seenHref = new Set();
  const seenEl = new Set();
  tiles = tiles.filter((tile) => {
    if (!tile || seenEl.has(tile)) return false;
    seenEl.add(tile);
    const cta = tile.querySelector('a[href]');
    const key = cta ? cta.getAttribute('href') : null;
    if (key) {
      if (seenHref.has(key)) return false;
      seenHref.add(key);
    }
    return true;
  });

  const cells = [];

  tiles.forEach((tile) => {
    // Image cell
    const img = tile.querySelector('img');

    // Text cell: heading + description + CTA
    const heading = tile.querySelector('.subtitle-two, h1, h2, h3, [class*="title"]');
    const description = tile.querySelector('.caption-one-normal, [class*="caption"], .caption-one');
    const cta = tile.querySelector('.position-absolute a[href], a.border-0[href], a[href]');

    // Skip empty tooltip triggers with no href inside the description
    if (description) {
      description.querySelectorAll('a.details-trigger, a.icon-trigger, a:not([href])').forEach((a) => {
        if (!a.getAttribute('href')) a.remove();
      });
    }

    // Bail on cards with no real content
    if (!img && !heading && !description && !cta) return;

    const imgFrag = document.createDocumentFragment();
    if (img) {
      imgFrag.appendChild(document.createComment(' field:image '));
      imgFrag.appendChild(img);
    }

    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    if (heading) textFrag.appendChild(heading);
    if (description) textFrag.appendChild(description);
    if (cta) textFrag.appendChild(cta);

    cells.push([img ? imgFrag : '', textFrag]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo', cells });
  element.replaceWith(block);
}
