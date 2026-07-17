/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-icon. Base: cards.
 * Source: https://www.straighttalk.com/
 * Container (cards) block. Each card = 1 row, 2 cells: image/icon (reference) + text (richtext).
 * Model fields per card item: image (reference), text (richtext).
 * cards-icon = icon + label link. Source has desktop/mobile duplicates — de-dupe by link href.
 */
export default function parse(element, { document }) {
  // Label links identify each card (arrow-only imgs are excluded via text check)
  let anchors = Array.from(element.querySelectorAll('a.border-0[href], [class*="col-"] a[href]'))
    .filter((a) => a.textContent.trim().length > 0);

  // De-dupe by href (desktop + mobile copies share the same href)
  const seenHref = new Set();
  anchors = anchors.filter((a) => {
    const href = a.getAttribute('href');
    if (!href || seenHref.has(href)) return false;
    seenHref.add(href);
    return true;
  });

  const cells = [];

  anchors.forEach((anchor) => {
    const col = anchor.closest('[class*="col-"]') || anchor.parentElement;

    // Icon: the responsive image in this card (not the arrow glyph inside the link)
    let icon = col.querySelector('img.responsiveimage');
    if (!icon) {
      icon = Array.from(col.querySelectorAll('img')).find((img) => !anchor.contains(img)) || null;
    }
    // Fallback: CSS background-image icon
    if (!icon) {
      const bgHost = col.querySelector('[style*="background-image"]');
      const m = bgHost && (bgHost.getAttribute('style') || '').match(/background-image:\s*url\((['"]?)(.*?)\1\)/i);
      if (m && m[2]) {
        icon = document.createElement('img');
        icon.src = m[2];
      }
    }

    const imgFrag = document.createDocumentFragment();
    if (icon) {
      imgFrag.appendChild(document.createComment(' field:image '));
      imgFrag.appendChild(icon);
    }

    // Text: the label link (drop the inner arrow img so only the label + link remain)
    anchor.querySelectorAll('img').forEach((img) => img.remove());
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    textFrag.appendChild(anchor);

    cells.push([icon ? imgFrag : '', textFrag]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon', cells });
  element.replaceWith(block);
}
