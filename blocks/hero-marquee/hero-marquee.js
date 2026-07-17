/*
 * Hero Marquee Block
 * Full-bleed marquee banner with a background image, headline and CTA.
 *
 * The image cell is promoted to a CSS background (--hero-marquee-bg) rather than
 * left as a foreground <picture>. This keeps the block self-contained and
 * prevents the EDS boilerplate's buildHeroBlock() auto-block from hoisting the
 * first <picture> out of the block into a separate .hero (which would leave the
 * marquee image cell empty).
 */

export default function decorate(block) {
  const rows = [...block.children];
  const imageCell = rows[0];
  if (!imageCell) return;

  const img = imageCell.querySelector('img');
  const src = img && (img.getAttribute('src') || img.src);
  if (src) {
    block.style.setProperty('--hero-marquee-bg', `url("${src}")`);
    block.classList.add('hero-marquee-has-bg');
  }
  // Remove the image cell so it doesn't render as a foreground element and
  // isn't eligible for picture-hoisting.
  imageCell.remove();

  // Tag the remaining text cell for overlay styling.
  const textCell = block.querySelector(':scope > div');
  if (textCell) textCell.classList.add('hero-marquee-content');
}
