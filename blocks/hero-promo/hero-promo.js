/*
 * Hero Promo Block
 * Full-width skinny promotional banner. The source renders a single wide
 * banner artwork (photo on the left, solid dark panel on the right) as a
 * cover background, with the headline, supporting copy and CTA overlaid on
 * the right side.
 *
 * Authoring model (see .plain.html / _hero-promo.json):
 *   Row 1 -> image cell: an <a href="{image-url}"> (or a <picture>/<img>)
 *   Row 2 -> text cell:  <h2> headline, <p> copy, <p><a> CTA
 *
 * decorate() resolves the image cell into a background image on the block
 * and marks the text cell as the overlaid content panel.
 */

export default function decorate(block) {
  const rows = [...block.children];
  const imageRow = rows[0];
  const textRow = rows[1];

  // Resolve the background image URL from the image cell.
  // Source authoring provides it as an <a href> link; fall back to <img>.
  let imageUrl = '';
  if (imageRow) {
    const link = imageRow.querySelector('a[href]');
    const img = imageRow.querySelector('img');
    if (link) imageUrl = link.getAttribute('href');
    else if (img) imageUrl = img.getAttribute('src');
  }

  if (imageUrl) {
    // Scene7 smart-crops each width differently: the small (wid=750) rendition
    // frames a narrow slice that drops the subject, while the wide rendition
    // keeps the full banner (photo card left, dark field right). Force the wide
    // rendition so the intended artwork shows.
    if (imageUrl.includes('scene7.com')) {
      imageUrl = imageUrl.replace(/([?&]wid=)\d+/, '$12000');
    }
    block.style.setProperty('--hero-promo-bg', `url("${imageUrl}")`);
    block.classList.add('hero-promo-has-bg');
    if (imageRow) imageRow.remove();
  }

  if (textRow) {
    textRow.classList.add('hero-promo-content');
  }
}
