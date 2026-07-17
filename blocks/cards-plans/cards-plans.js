import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../ue/scripts/ue-utils.js';

const PLAN_VARIANTS = ['silver', 'gold', 'platinum', 'bronze'];

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-plans-card-image';
      else div.className = 'cards-plans-card-body';
    });

    const body = li.querySelector('.cards-plans-card-body');
    const image = li.querySelector('.cards-plans-card-image');

    if (body) {
      // Detect plan variant from the heading text (silver/gold/platinum/bronze).
      const heading = body.querySelector('h2');
      const label = (heading?.textContent || '').toLowerCase();
      const variant = PLAN_VARIANTS.find((v) => label.includes(v));
      if (variant) li.classList.add(`cards-plans-${variant}`);

      // Split the card body into a dark "header" (eyebrow, name, price, subprice)
      // and a light "features" region (feature list + CTA), matching the source design.
      const header = document.createElement('div');
      header.className = 'cards-plans-header';
      const features = document.createElement('div');
      features.className = 'cards-plans-features';

      // Move the badge icon into the header so it sits beside the plan name.
      if (image) header.append(image);

      [...body.children].forEach((el) => {
        const tag = el.tagName;
        if (tag === 'UL' || tag === 'OL') {
          features.append(el);
        } else if (tag === 'P' && el.querySelector('a')) {
          // CTA link paragraph -> features footer
          features.append(el);
        } else {
          header.append(el);
        }
      });

      // Tag the eyebrow (first <p><strong>) and price/subprice paragraphs.
      const eyebrow = header.querySelector('p > strong');
      if (eyebrow) eyebrow.closest('p').classList.add('cards-plans-eyebrow');
      const priceP = [...header.querySelectorAll('p')].find((p) => p.querySelector('sup'));
      if (priceP) priceP.classList.add('cards-plans-price');
      if (priceP && priceP.nextElementSibling && priceP.nextElementSibling.tagName === 'P') {
        priceP.nextElementSibling.classList.add('cards-plans-subprice');
      }

      body.textContent = '';
      body.append(header, features);
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
