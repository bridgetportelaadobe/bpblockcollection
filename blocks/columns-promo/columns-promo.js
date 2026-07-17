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

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-promo-${cols.length}-cols`);

  // Each column is a promo panel: a background media (image/video/link) with
  // an absolutely-positioned text overlay (eyebrow, heading, description, CTA).
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      col.classList.add('columns-promo-panel');

      // Identify the media element: a <picture>, or the media link/paragraph
      // (import may render the video/image source as a plain link).
      const pic = col.querySelector('picture');
      let mediaWrapper = null;

      if (pic) {
        mediaWrapper = pic.closest('p') || pic.parentElement;
      } else {
        // First paragraph whose link points at an image/video/scene7 asset.
        const firstP = col.querySelector('p');
        const firstLink = firstP && firstP.querySelector('a');
        if (firstLink && firstP && firstP.previousElementSibling === null) {
          mediaWrapper = firstP;
          // A video carrier link becomes a real <video> background; image
          // carriers stay as links (styled as a cover background via CSS).
          const href = firstLink.getAttribute('href');
          if (isVideoUrl(href)) {
            firstLink.replaceWith(buildVideo(href));
          }
        }
      }

      if (mediaWrapper) {
        mediaWrapper.classList.add('columns-promo-media');
      }

      // Everything else forms the text overlay.
      const overlay = document.createElement('div');
      overlay.className = 'columns-promo-content';
      [...col.children].forEach((child) => {
        if (child === mediaWrapper) return;
        overlay.append(child);
      });
      col.append(overlay);
    });
  });
}
