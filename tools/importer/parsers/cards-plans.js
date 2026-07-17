/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-plans. Base: cards.
 * Source: https://www.straighttalk.com/
 * Container (cards) block. Each plan card = 1 row, 2 cells: image/icon (reference) + text (richtext).
 * Model fields per card item: image (reference), text (richtext).
 * Plan card is rich: badge/eyebrow, plan name, price, autopay subprice, feature list, SEE DETAILS CTA.
 * Source has desktop + mobile carousel duplicates — de-dupe by CTA href.
 */
export default function parse(element, { document }) {
  let cardEls = Array.from(element.querySelectorAll('.plan-card.small-plan-card, .plan-card'));

  // De-dupe by CTA href (each plan renders twice: desktop + mobile carousel)
  const seenHref = new Set();
  const seenEl = new Set();
  cardEls = cardEls.filter((card) => {
    if (!card || seenEl.has(card)) return false;
    seenEl.add(card);
    const cta = card.querySelector('a[href]');
    const href = cta && cta.getAttribute('href');
    if (href) {
      if (seenHref.has(href)) return false;
      seenHref.add(href);
    }
    return true;
  });

  const cells = [];

  cardEls.forEach((card) => {
    // Plan icon (small SVG) → image cell
    const icon = card.querySelector('.promo-text .icon img, .icon img, img');

    // Text content
    const badge = card.querySelector('.pln-card-pill');
    const name = card.querySelector('.promo-text h2, .promo-text');
    const price = card.querySelector('.plan-price');
    const subprice = card.querySelector('.plan-price-offer');
    const featureList = card.querySelector('ul, ol');
    const cta = card.querySelector('.secondary-btn-black a[href], a[href]');

    // Clean the feature list: drop accessibility-only / icon-name spans, keep the visible label
    let cleanedList = null;
    if (featureList) {
      cleanedList = featureList.cloneNode(true);
      cleanedList.querySelectorAll('.sr-only, [class*="sr-only"], .icon, [aria-hidden="true"]').forEach((n) => n.remove());
      // remove empty spans left behind
      cleanedList.querySelectorAll('span:empty').forEach((n) => n.remove());
    }

    const imgFrag = document.createDocumentFragment();
    if (icon) {
      imgFrag.appendChild(document.createComment(' field:image '));
      imgFrag.appendChild(icon);
    }

    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    if (badge) textFrag.appendChild(badge);
    if (name) textFrag.appendChild(name);
    if (price) textFrag.appendChild(price);
    if (subprice) textFrag.appendChild(subprice);
    if (cleanedList) textFrag.appendChild(cleanedList);
    if (cta) textFrag.appendChild(cta);

    // Skip a card with nothing meaningful
    if (!name && !price && !cleanedList && !cta) return;

    cells.push([icon ? imgFrag : '', textFrag]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-plans', cells });
  element.replaceWith(block);
}
