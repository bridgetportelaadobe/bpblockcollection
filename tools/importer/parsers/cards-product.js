/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-product. Base: cards.
 * Source: https://www.straighttalk.com/
 * Container (cards) block. Each phone card = 1 row, 2 cells: image (reference) + text (richtext).
 * Model fields per card item: image (reference), text (richtext).
 * Each .phone-card: promo eyebrow, phone name, product image, price(s), SEE DETAILS CTA.
 */
export default function parse(element, { document }) {
  let cardEls = Array.from(element.querySelectorAll('.phone-card'));

  // De-dupe (in case of desktop/mobile duplicates) by CTA href, else by element
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
    // Product image
    const img = card.querySelector('.phone-image img, img.responsiveimage, img');

    // Text content
    const eyebrow = card.querySelector('.promo-text.product-banner, .product-banner');
    const name = card.querySelector('.phone-name p, .phone-name, [role="heading"]');
    // Visible price block(s): the .retail-price container holds strikethrough + offered price.
    // Only take blocks that are not inside a hidden (.d-none) wrapper and have visible text.
    const priceBlocks = Array.from(card.querySelectorAll('.retail-price, .price-detail'))
      .filter((p) => p.textContent.trim().length > 0 && !p.closest('.d-none'));
    const cta = card.querySelector('a[href]');

    const imgFrag = document.createDocumentFragment();
    if (img) {
      imgFrag.appendChild(document.createComment(' field:image '));
      imgFrag.appendChild(img);
    }

    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    if (eyebrow && eyebrow.textContent.trim().length > 0) textFrag.appendChild(eyebrow);
    if (name) textFrag.appendChild(name);
    priceBlocks.forEach((p) => textFrag.appendChild(p));
    if (cta) textFrag.appendChild(cta);

    if (!img && !name && priceBlocks.length === 0 && !cta) return;

    cells.push([img ? imgFrag : '', textFrag]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });
  element.replaceWith(block);
}
