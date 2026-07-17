/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-promo. Base: columns.
 * Source: https://www.straighttalk.com/
 * Columns block: 2 columns x 1 content row. NO field hints (columns blocks use default content).
 * Left column = video promo card; right column = image promo card. Each has heading/copy/CTA.
 * Source contains duplicated desktop/tablet/mobile markup — extract the desktop (d-lg-block) copy only.
 */
export default function parse(element, { document }) {
  // The two promo panels are the two flex columns
  const columnEls = Array.from(
    element.querySelectorAll(':scope .row > .col-md-6, :scope .row > [class*="col-"], :scope [class*="col-lg-"]'),
  ).filter((el) => el.className.includes('col-'));

  // Fallback: first two banner-tile ancestors' columns
  let panels = columnEls;
  if (panels.length < 2) {
    panels = Array.from(element.querySelectorAll('.banner-tile')).map((t) => t.closest('[class*="col-"]') || t);
  }
  // De-dup and keep first two distinct panels
  const seen = new Set();
  panels = panels.filter((p) => {
    if (!p || seen.has(p)) return false;
    seen.add(p);
    return true;
  }).slice(0, 2);

  const buildCell = (panel) => {
    const cell = [];
    if (!panel) return cell;

    // Prefer the desktop-only content wrapper to avoid tablet/mobile duplicates
    const desktopContent = panel.querySelector('.position-absolute.d-lg-block, .position-absolute.d-none.d-lg-block, .d-none.d-lg-block .position-absolute')
      || panel.querySelector('.position-absolute');

    // Video (left card) or image (right card), desktop variant
    const desktopMedia = panel.querySelector('.d-none.d-lg-block .video-wrapper, .d-none.d-lg-block > img, img.vas-plan-card');
    if (desktopMedia) {
      if (desktopMedia.tagName === 'IMG') {
        cell.push(desktopMedia);
      } else {
        // video-wrapper: convert first <source> to a linked reference so DM transformer can pick it up
        const src = desktopMedia.querySelector('video source[src], source[src]');
        const videoUrl = src && src.getAttribute('src');
        if (videoUrl) {
          const a = document.createElement('a');
          a.href = videoUrl;
          a.textContent = 'Video';
          cell.push(a);
        }
      }
    }

    // Text content: eyebrow, heading, copy, CTA
    if (desktopContent) {
      Array.from(desktopContent.querySelectorAll(':scope > p, :scope > h1, :scope > h2, :scope > h3'))
        .forEach((n) => {
          // strip empty tooltip trigger anchors
          n.querySelectorAll('a.details-trigger, a.icon-trigger, a:empty').forEach((a) => {
            if (!a.getAttribute('href')) a.remove();
          });
          cell.push(n);
        });
      const ctaBtn = desktopContent.querySelector('.button a[href], a.btn[href], a.btn');
      if (ctaBtn) cell.push(ctaBtn);
    }
    return cell;
  };

  const leftCell = buildCell(panels[0]);
  const rightCell = buildCell(panels[1]);

  if (leftCell.length === 0 && rightCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  cells.push([leftCell, rightCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-promo', cells });
  element.replaceWith(block);
}
