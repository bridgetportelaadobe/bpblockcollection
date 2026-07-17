/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-feature. Base: cards.
 * Source: https://www.straighttalk.com/
 * Container (cards) block. Each feature card = 1 row, 2 cells: image/icon (reference) + text (richtext).
 * Model fields per card item: image (reference), text (richtext).
 * Each card: icon + title + copy + a "Shop/Check/Learn >" link. De-dupe by link href.
 */
export default function parse(element, { document }) {
  // Each feature card is identified by its action link (Shop plans, Check coverage, Learn more, ...)
  let anchors = Array.from(element.querySelectorAll('a[href]'))
    .filter((a) => a.textContent.trim().length > 0 && /shop|check|learn/i.test(a.textContent) && !/^\s*LEARN MORE\s*$/i.test(a.textContent.trim()));

  const seenHref = new Set();
  anchors = anchors.filter((a) => {
    const href = a.getAttribute('href');
    if (!href || seenHref.has(href)) return false;
    seenHref.add(href);
    return true;
  });

  const cells = [];

  anchors.forEach((anchor) => {
    const col = anchor.closest('.col-xl-6, .col-lg-6, [class*="col-"]') || anchor.parentElement;

    // Icon image
    let icon = col.querySelector('img.img-responsive, img.responsiveimage, img');
    if (!icon) {
      const bgHost = col.querySelector('[style*="background-image"]');
      const m = bgHost && (bgHost.getAttribute('style') || '').match(/background-image:\s*url\((['"]?)(.*?)\1\)/i);
      if (m && m[2]) { icon = document.createElement('img'); icon.src = m[2]; }
    }

    // Title + copy paragraphs (exclude the one that only holds the action link)
    const paras = Array.from(col.querySelectorAll('p'))
      .filter((p) => !p.contains(anchor) && p.textContent.trim().length > 0);

    const imgFrag = document.createDocumentFragment();
    if (icon) {
      imgFrag.appendChild(document.createComment(' field:image '));
      imgFrag.appendChild(icon);
    }

    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    paras.forEach((p) => textFrag.appendChild(p));
    textFrag.appendChild(anchor);

    cells.push([icon ? imgFrag : '', textFrag]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
  element.replaceWith(block);
}
