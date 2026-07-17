// Scene7 /is/content/ or a direct video file = a video asset the import
// rendered as a plain carrier link; everything else in the media cell is an
// image (handled as a cover background/img).
function isVideoUrl(url) {
  if (!url) return false;
  return /\/is\/content\//.test(url) || /\.(mp4|webm|m3u8|mov)(\?|$)/i.test(url);
}

// Replace a media carrier <a> with an autoplaying, muted, looping <video>
// so the source's background video renders instead of a dark fallback fill.
function buildVideo(url) {
  const video = document.createElement('video');
  video.src = url;
  video.autoplay = true;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  return video;
}

// Pull the real media node (picture/video) out of whatever paragraph the
// import/EDS decoration nested it in, and mark accent words in a heading.
function markAccents(heading) {
  if (!heading) return;
  // Accent phrases the source renders in the lime brand color.
  const accents = ['JUST $250', 'FREE'];
  let html = heading.innerHTML;
  accents.forEach((phrase) => {
    if (html.includes(phrase) && !html.includes('columns-promo-accent')) {
      html = html.replace(phrase, `<span class="columns-promo-accent">${phrase}</span>`);
    }
  });
  heading.innerHTML = html;
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-promo-${cols.length}-cols`);

  // Each column is a promo panel: a background media (image/video/link) with
  // a text overlay (eyebrow, heading, description, CTA) on top.
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      col.classList.add('columns-promo-panel');

      // The overlay holds all text/CTA content on top of the media.
      const overlay = document.createElement('div');
      overlay.className = 'columns-promo-content';

      // Locate the media node. It is a <picture>, or a plain carrier <a>
      // (import may render the video/image source as a bare link). Because
      // <picture>/<img> cannot legally sit inside a <p>, EDS decoration can
      // nest sibling paragraphs inside the media paragraph — so we extract
      // only the media node itself, not its wrapping <p>.
      let mediaNode = col.querySelector('picture');
      if (!mediaNode) {
        // First link that points at an image/video/scene7 asset.
        const links = [...col.querySelectorAll('a')];
        const carrier = links.find((a) => {
          const href = a.getAttribute('href') || '';
          return isVideoUrl(href) || /\/is\/(image|content)\//.test(href);
        });
        if (carrier) {
          const href = carrier.getAttribute('href');
          if (isVideoUrl(href)) {
            const video = buildVideo(href);
            carrier.replaceWith(video);
            mediaNode = video;
          } else {
            mediaNode = carrier;
          }
        }
      }

      let mediaWrapper = null;
      if (mediaNode) {
        // <picture>/<img> cannot live inside a <p>, so EDS may have nested the
        // following text paragraphs inside the media's <p>. Unwrap that <p>
        // (hoisting its remaining children up to the column) before removing
        // the media node, so the text is not lost with the media wrapper.
        const mediaP = mediaNode.closest('p');
        if (mediaP && mediaP.parentElement) {
          while (mediaP.firstChild) {
            mediaP.parentElement.insertBefore(mediaP.firstChild, mediaP);
          }
          mediaP.remove();
        }
        mediaWrapper = document.createElement('div');
        mediaWrapper.className = 'columns-promo-media';
        mediaWrapper.append(mediaNode);
      }

      // Everything remaining (text + CTA) moves into the overlay, in order.
      [...col.childNodes].forEach((node) => {
        // Drop empty wrappers left behind after pulling out the media.
        if (node.nodeType === Node.ELEMENT_NODE
          && node.children.length === 0
          && !node.textContent.trim()) {
          node.remove();
          return;
        }
        if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) {
          return;
        }
        overlay.append(node);
      });

      col.textContent = '';
      if (mediaWrapper) col.append(mediaWrapper);
      col.append(overlay);

      markAccents(overlay.querySelector('h2'));
    });
  });
}
