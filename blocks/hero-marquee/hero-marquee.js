/*
 * Hero Marquee Block
 * A full-width black, rounded promo bar with a centered statement, an inline
 * accent CTA and a small fine-print line beneath.
 *
 * Content model (single row, single cell):
 *   <p>STATEMENT ... <a>CTA</a></p>
 *   <p>fine print</p>
 */

export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div');
  if (cell) cell.classList.add('hero-marquee-content');

  const paras = cell ? [...cell.querySelectorAll(':scope > p')] : [];

  // First paragraph holds the statement + inline CTA link.
  if (paras[0]) {
    paras[0].classList.add('hero-marquee-statement');
    const cta = paras[0].querySelector('a');
    if (cta) cta.classList.add('hero-marquee-cta');
  }

  // Any following paragraph is fine print.
  paras.slice(1).forEach((p) => p.classList.add('hero-marquee-fineprint'));
}
