/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-promo. Base: hero.
 * Source: https://www.straighttalk.com/
 * Simple block: 1 column, 2 content rows (image, text).
 * Model fields: image (reference), imageAlt (collapsed — not hinted), text (richtext).
 * Live DOM: image is a CSS background-image on .image-teaser-container (not an <img>);
 * desktop/mobile/tablet copies exist — use the desktop (.d-lg-block) teaser.
 */
export default function parse(element, { document }) {
  // Desktop teaser preferred, then any teaser/tile
  const teaser = element.querySelector('.image-teaser-container.d-lg-block, .image-teaser-container.d-none.d-lg-block, .d-none.d-lg-block .image-teaser-container')
    || element.querySelector('.image-teaser-container')
    || element.querySelector('.banner-tile')
    || element;

  // Background image: real <img> if present, else parse background-image URL from inline style
  let bgImage = teaser.querySelector('img');
  if (!bgImage) {
    const styleHost = teaser.matches('[style*="background-image"]')
      ? teaser
      : teaser.querySelector('[style*="background-image"]');
    const style = styleHost && styleHost.getAttribute('style');
    const m = style && style.match(/background-image:\s*url\((['"]?)(.*?)\1\)/i);
    if (m && m[2]) {
      bgImage = document.createElement('img');
      bgImage.src = m[2];
    }
  }

  // Headline
  const title = teaser.querySelector('h1, h2, .slide-title, .heading-four, [class*="title"]');

  // Supporting copy: the description wrapper, else first non-title paragraph
  let description = teaser.querySelector('.slide-description');
  if (!description) {
    const paras = Array.from(teaser.querySelectorAll('div > p, p'));
    description = paras.find((p) => (!title || !title.contains(p)) && p.textContent.trim().length > 0) || null;
  }
  if (description) {
    description.querySelectorAll('a.details-trigger, a.icon-trigger, a:not([href])').forEach((a) => {
      if (!a.getAttribute('href')) a.remove();
    });
  }

  // Call-to-action
  const cta = teaser.querySelector('.banner-btn a.btn[href], .slide-button a[href], a.btn[href]');

  const cells = [];

  // Row 2: background image
  if (bgImage) {
    const imgFrag = document.createDocumentFragment();
    imgFrag.appendChild(document.createComment(' field:image '));
    imgFrag.appendChild(bgImage);
    cells.push([imgFrag]);
  } else {
    cells.push(['']);
  }

  // Row 3: text (title + copy + CTA) as richtext
  const textFrag = document.createDocumentFragment();
  textFrag.appendChild(document.createComment(' field:text '));
  if (title) textFrag.appendChild(title);
  if (description) textFrag.appendChild(description);
  if (cta) textFrag.appendChild(cta);
  cells.push([textFrag]);

  // Empty-block guard
  if (!bgImage && !title && !description && !cta) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-promo', cells });
  element.replaceWith(block);
}
