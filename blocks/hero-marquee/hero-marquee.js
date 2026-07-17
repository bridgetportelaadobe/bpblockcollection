/*
 * Hero Marquee Block
 * A full-width black, rounded promo bar with a centered statement, an inline
 * accent CTA and a small fine-print line beneath.
 *
 * Content model (single row, single cell):
 *   <p>STATEMENT ... <a>CTA</a></p>
 *   <p>fine print</p>
 */

// The source renders the lead phrase (up to and including the trailing
// asterisk) in the lime brand color; the rest of the statement is white.
function markAccent(statement) {
  if (!statement) return;
  const link = statement.querySelector('a');
  const firstNode = statement.firstChild;
  if (!firstNode || firstNode.nodeType !== Node.TEXT_NODE) return;
  // Accent everything up to the first period that follows an asterisk.
  const match = firstNode.textContent.match(/^(.*?\*)(.*)$/s);
  if (!match) return;
  const [, accentText, restText] = match;
  const span = document.createElement('span');
  span.className = 'hero-marquee-accent';
  span.textContent = accentText;
  const rest = document.createTextNode(restText);
  statement.insertBefore(rest, firstNode);
  statement.insertBefore(span, rest);
  firstNode.remove();
  if (link) statement.appendChild(link);
}

export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div');
  if (cell) cell.classList.add('hero-marquee-content');

  const paras = cell ? [...cell.querySelectorAll(':scope > p')] : [];

  // First paragraph holds the statement + inline CTA link.
  if (paras[0]) {
    paras[0].classList.add('hero-marquee-statement');
    const cta = paras[0].querySelector('a');
    if (cta) cta.classList.add('hero-marquee-cta');
    markAccent(paras[0]);
  }

  // Any following paragraph is fine print.
  paras.slice(1).forEach((p) => p.classList.add('hero-marquee-fineprint'));
}
