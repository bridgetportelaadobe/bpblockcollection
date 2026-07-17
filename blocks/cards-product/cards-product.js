import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../ue/scripts/ue-utils.js';

/**
 * Classify the paragraphs inside a product card's text cell so styling can
 * target them precisely. Card content pattern (per source):
 *   1. eyebrow / offer banner  (e.g. "$199 w/ Silver Unlimited Plan or higher")
 *   2. product name            (e.g. "iPhone 16e 128GB")
 *   3. was-price (optional)    (e.g. "$599.99")  -> strikethrough
 *   4. now-price / sole price  (e.g. "$349.99")  -> emphasized
 *   5. financing line (opt.)   ("As low as ... SmartPay")
 *   6. CTA link                ("SEE DETAILS")
 */
function decorateProductBody(body) {
  const paragraphs = [...body.querySelectorAll(':scope > p')];
  if (!paragraphs.length) return;

  // Eyebrow = first paragraph.
  const eyebrow = paragraphs[0];
  eyebrow.classList.add('cards-product-eyebrow');

  // Product name = second paragraph (if not a price / cta).
  const name = paragraphs[1];
  if (name && !name.querySelector('a')) name.classList.add('cards-product-name');

  // Price paragraphs: text begins with a currency amount and has no link.
  const priceRe = /^\s*\$\s*\d/;
  const prices = paragraphs.filter(
    (p) => !p.querySelector('a') && priceRe.test(p.textContent),
  );
  if (prices.length > 1) {
    prices.slice(0, -1).forEach((p) => p.classList.add('cards-product-price-was'));
    prices[prices.length - 1].classList.add('cards-product-price-now');
  } else if (prices.length === 1) {
    prices[0].classList.add('cards-product-price-now');
  }

  // Financing line: contains an inline image (SmartPay logo) or "As low as".
  paragraphs.forEach((p) => {
    if (p.classList.length) return;
    if (p.querySelector('img, picture') || /as low as/i.test(p.textContent)) {
      p.classList.add('cards-product-financing');
    }
  });

  // CTA: the paragraph that holds the link.
  const cta = paragraphs.find((p) => p.querySelector('a'));
  if (cta) cta.classList.add('cards-product-cta');
}

export default function decorate(block) {
  /* transform authored rows into ul > li cards */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && (div.querySelector('picture') || div.querySelector('img'))) {
        div.className = 'cards-product-card-image';
      } else {
        div.className = 'cards-product-card-body';
        decorateProductBody(div);
      }
    });

    /* Reorder to match source: eyebrow band (full width) and product name
       sit above the phone image, which sits above the prices/financing/cta. */
    const imageCell = li.querySelector(':scope > .cards-product-card-image');
    const eyebrow = li.querySelector(':scope > .cards-product-card-body .cards-product-eyebrow');
    const name = li.querySelector(':scope > .cards-product-card-body .cards-product-name');
    if (imageCell) {
      if (eyebrow) li.insertBefore(eyebrow, imageCell);
      if (name) li.insertBefore(name, imageCell);
    }

    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
