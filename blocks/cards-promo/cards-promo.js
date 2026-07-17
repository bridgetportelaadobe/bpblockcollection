import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../ue/scripts/ue-utils.js';

// Accent phrases the source renders in the lime brand color inside the card
// heading (first paragraph). The source markup wraps these in a colored span;
// the imported plain text runs them inline, so we re-wrap them here.
const ACCENT_PHRASES = ['ON US', 'SAVE $150'];

// Wrap a known accent phrase in the card heading with a lime accent span.
function markAccent(headingP) {
  if (!headingP) return;
  let html = headingP.innerHTML;
  if (html.includes('cards-promo-accent')) return;
  ACCENT_PHRASES.forEach((phrase) => {
    if (html.includes(phrase)) {
      html = html.replace(phrase, `<span class="cards-promo-accent">${phrase}</span>`);
    }
  });
  headingP.innerHTML = html;
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-promo-card-image';
      else div.className = 'cards-promo-card-body';
    });
    // Highlight accent words in the heading (first paragraph of the body cell).
    const body = li.querySelector('.cards-promo-card-body');
    if (body) markAccent(body.querySelector('p'));
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  // The product images are Scene7 assets served with a transparent alpha
  // channel (fmt=webp-alpha). createOptimizedPicture rewrites the format to a
  // flat webp/jpg, which bakes a white background behind the phone. Restore the
  // alpha-preserving format so the product sits directly on the black card.
  ul.querySelectorAll('picture source, picture img').forEach((node) => {
    const attr = node.tagName === 'SOURCE' ? 'srcset' : 'src';
    const value = node.getAttribute(attr);
    if (value && value.includes('scene7.com') && /fmt=(webp|jpg|jpeg|png)(?!-alpha)/.test(value)) {
      node.setAttribute(attr, value.replace(/fmt=(webp|jpg|jpeg|png)(?!-alpha)/g, 'fmt=webp-alpha'));
      if (node.tagName === 'SOURCE') node.setAttribute('type', 'image/webp');
    }
  });
  block.textContent = '';
  block.append(ul);
}
