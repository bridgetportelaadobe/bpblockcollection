/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-marquee. Base: hero.
 * Source: https://www.straighttalk.com/
 * Model fields: image (reference), imageAlt (collapsed), text (richtext)
 * Hero layout: 1 column, 3 rows (name, image, text).
 */
export default function parse(element, { document }) {
  // Background image (optional) — either a rendered <img> or a data-bgbannersrc attribute
  let bgImage = element.querySelector('.image-teaser-container img, .responsivebackground img, img');
  if (!bgImage) {
    const bgHost = element.querySelector('[data-bgbannersrc], .responsivebackground, .image-teaser-container');
    const bgSrc = bgHost && (bgHost.getAttribute('data-bgbannersrc') || bgHost.getAttribute('data-background-image'));
    if (bgSrc) {
      bgImage = document.createElement('img');
      bgImage.src = bgSrc;
    }
  }

  // Headline
  const title = element.querySelector('.slide-title, h1, h2, [class*="title"]');
  // Prefer the desktop-visible variant, drop duplicate mobile clones
  if (title) {
    const desktopP = title.querySelector('p.d-lg-block, p.d-none.d-lg-block');
    if (desktopP) {
      title.querySelectorAll('p').forEach((p) => {
        if (p !== desktopP) p.remove();
      });
    }
  }

  // Description / subheading
  let description = element.querySelector('.slide-description, [class*="description"], [class*="subtitle"]');
  if (description) {
    const desktopP = description.querySelector('p.d-lg-block, p.d-none.d-lg-block');
    if (desktopP) {
      description.querySelectorAll(':scope > p').forEach((p) => {
        if (p !== desktopP) p.remove();
      });
    }
  }

  // Call-to-action link(s)
  const ctaLinks = Array.from(
    element.querySelectorAll('.slide-button a[href], .banner-btn a[href], a.btn[href]'),
  );
  // Drop hidden accessibility/compliance duplicate text inside CTAs
  ctaLinks.forEach((a) => {
    a.querySelectorAll('.ae-compliance-indent, [class*="compliance"], .sr-only').forEach((s) => s.remove());
  });

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

  // Row 3: text (title + subheading + CTA) as richtext
  const textFrag = document.createDocumentFragment();
  textFrag.appendChild(document.createComment(' field:text '));
  if (title) textFrag.appendChild(title);
  if (description) textFrag.appendChild(description);
  ctaLinks.forEach((a) => textFrag.appendChild(a));
  cells.push([textFrag]);

  // Empty-block guard
  if (!title && !description && ctaLinks.length === 0 && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-marquee', cells });
  element.replaceWith(block);
}
