/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Straight Talk Dynamic Media / Scene7 images.
 *
 * The Straight Talk homepage sources its imagery from Scene7 Dynamic Media
 * (https://s7d1.scene7.com/is/image/tracfone/...). Those original DM URLs are
 * preserved as keys in migration-work/metadata.json `.images.mapping` (40 DM
 * URLs, all Scene7 `/is/image/` — verified during the STEP 4 detection gate).
 *
 * This transformer rewrites each DM `<img>` into an anchor so the DM URL
 * round-trips through docx → markdown intact (a raw `<img src>` would not).
 * A companion auto-block (`buildDynamicMediaImages` in scripts/scripts.js,
 * installed by the site-migration orchestrator) rebuilds those anchors into
 * responsive `<picture>` elements at render time.
 *
 * Runs in `afterTransform` ONLY: block parsers run between the two hooks and
 * extract `<img>` references into block cells (cards/carousel etc.). Rewriting
 * imgs to anchors in `beforeTransform` would leave parsers with no img and emit
 * empty image cells. Running afterTransform lets parsers build their cells,
 * then we walk the parser-modified DOM and rewrite DM imgs wherever they sit.
 *
 * Helpers below are copied byte-identically from the canonical
 * dm-scene7-helpers.js (transformer-side subset only: detectDynamicMediaUrl,
 * findLinkedDmCarrier, EMPTY_ALT_SENTINEL, altToLinkText).
 */

// ---- Begin canonical helpers (transformer-side subset, per the transformer
// template in references/dm-scene7-transformer.md). The transformer walks
// <img src> values, which are always absolute Scene7 URLs from the source, so
// it uses the transformer-template form of detectDynamicMediaUrl WITHOUT the
// relative-URL guard that the auto-block copy needs (the auto-block scans every
// anchor href). All other helpers stay byte-identical with the canonical
// dm-scene7-helpers.js. ----
function detectDynamicMediaUrl(urlStr) {
  let u;
  try { u = new URL(urlStr, 'https://x/'); } catch { return false; }
  // Scene7 detected by path alone — hostname is irrelevant because
  // customer sites routinely CNAME a vanity domain to Scene7 (e.g.
  // media-assets.brand.example).
  if (u.pathname.startsWith('/is/image/')) {
    return 'scene7';
  }
  if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname)
      && u.pathname.startsWith('/adobe/assets/urn:')) {
    return 'dm-openapi';
  }
  return false;
}

// Walk up from a DM <img> through allow-listed inline wrappers (currently
// just <picture>) to find the carrier anchor for the linked-image
// round-trip. Returns the outer <a> when the img is the sole meaningful
// descendant; null otherwise. Without the walk, parsers that pre-wrap
// the img in <picture> — e.g. cards-portfolio on 2026-05-13 producing
// <a href="/page"><picture><img src=DM></picture></a> — slip past the
// linked branch and end up nested-anchored, splitting into two siblings
// in markdown. Keep byte-identical with dm-scene7-helpers.js.
const LINKED_DM_INLINE_WRAPPER_TAGS = new Set(['PICTURE']);
const LINKED_DM_WRAPPER_SIBLING_TAGS = new Set(['SOURCE']); // standard <picture> siblings
function findLinkedDmCarrier(img) {
  if (!img || !img.parentElement) return null;
  let node = img;
  let parent = img.parentElement;
  while (parent && LINKED_DM_INLINE_WRAPPER_TAGS.has(parent.tagName)) {
    let foundNode = false;
    for (const child of parent.children) {
      if (child === node) {
        foundNode = true;
      } else if (!LINKED_DM_WRAPPER_SIBLING_TAGS.has(child.tagName)) {
        return null;
      }
    }
    if (!foundNode) return null;
    node = parent;
    parent = parent.parentElement;
  }
  if (!parent || parent.tagName !== 'A') return null;
  if (parent.children.length !== 1 || parent.children[0] !== node) return null;
  if (parent.textContent.trim() !== '') return null;
  return parent;
}

const EMPTY_ALT_SENTINEL = 'Image without alt text';

function altToLinkText(alt) {
  return alt || EMPTY_ALT_SENTINEL;
}
// ---- End canonical helpers ----

export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;
  const doc = element.ownerDocument;

  element.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (!detectDynamicMediaUrl(src)) return;

    // Preserve alt verbatim, including empty string for decorative images.
    // The auto-block uses the URL pattern (not the text) to find these
    // anchors, so the link text is purely a Document-view UX cue. When alt
    // is empty we substitute EMPTY_ALT_SENTINEL ('Image without alt text')
    // so authors editing the doc see a visible cell at the image's
    // position; the auto-block translates the sentinel back to alt="" via
    // linkTextToAlt() so screen readers correctly skip decorative images.
    const alt = img.getAttribute('alt') || '';

    // Linked image (incl. parser-wrapped `<a><picture><img></picture></a>`).
    // Stash DM URL in title, keep outer href; setting textContent replaces
    // any wrapper descendants with the link text.
    const linkedAnchor = findLinkedDmCarrier(img);
    if (linkedAnchor) {
      linkedAnchor.setAttribute('title', src);
      linkedAnchor.textContent = altToLinkText(alt);
      return;
    }

    // Inside an anchor but not a sole-meaningful-child shape — mixed
    // content. No clean single-anchor markdown representation; skip.
    const parent = img.parentElement;
    if (parent && parent.tagName === 'A') {
      // eslint-disable-next-line no-console
      console.warn('DM image inside mixed-content anchor, skipped:', src);
      return;
    }

    // Unlinked image: create an anchor whose href is the DM URL.
    const a = doc.createElement('a');
    a.href = src;
    a.textContent = altToLinkText(alt);
    img.replaceWith(a);
  });
}
