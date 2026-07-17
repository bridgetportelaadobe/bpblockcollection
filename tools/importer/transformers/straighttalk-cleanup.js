/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Straight Talk site-wide cleanup.
 *
 * Straight Talk is a deeply-nested AEM responsivegrid SPA. All authorable
 * content lives under `#main > div.root.responsivegrid`. Everything else is
 * site shell/chrome (header, footer, butterbar) or body-level modals/popups
 * that authors would never create when authoring a page — the header and
 * footer are auto-populated in EDS.
 *
 * All selectors below were verified against migration-work/cleaned.html and
 * the noiseSelectors list in migration-work/page-structure.json.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

// Body-level modals/popups (from page-structure.json noiseSelectors). These
// are siblings of #main and are pure noise — not page sections.
// Verified in cleaned.html (opening tags around lines 5062-7521).
const BODY_LEVEL_NOISE = [
  '.location-dropdown',                     // <div class="location-dropdown"> (5062)
  '.modal_wrapper.responsivegrid',          // <div class="modal_wrapper responsivegrid"> (5064)
  '.cart-full',                             // <div class="cart-full"> (6284)
  '.learn-more-modal',                      // <div class="learn-more-modal"> (many)
  '.smart-pay-limit-reached',               // <div class="smart-pay-limit-reached"> (6372)
  '.pre-order-modal-container',             // <div class="pre-order-modal-container"> (6525)
  '.my-account-modal',                      // <div class="my-account-modal">
  '.home-internet-limit-reached',           // <div class="home-internet-limit-reached">
  '.container.home-internet-check-availablity', // <div class="container home-internet-check-availablity">
  '.check-avialability-success',            // <div class="check-avialability-success">
  '.hiddendiv.common',                      // <div class="hiddendiv common">
  '.fb_lightbox-overlay.fb_lightbox-overlay-fixed', // FB lightbox overlay
];

// Site shell / chrome — non-authorable, auto-populated in EDS.
// Verified in cleaned.html: #page-header-wrapper (11), #pageHeader (39),
// #page-footer-wrapper (6606), #ae_enabled_site (2), #tDrkDiv (7).
const SITE_CHROME = [
  '#page-header-wrapper',
  '#pageHeader',
  'header',
  '#page-footer-wrapper',
  'footer',
  '#ae_enabled_site', // AudioEye accessibility blurb (body-level scaffolding)
  '#tDrkDiv',         // empty overlay scaffolding div
];

// Hidden React/AEM SPA scaffolding that lives inside #main but is not
// authorable content. Verified in cleaned.html: .cusg-details-base-page (886),
// #basePageH1 (889, an SEO-only visually-hidden h1).
const MAIN_SCAFFOLDING = [
  '.cusg-details-base-page',
  '#basePageH1',
];

// Leaked non-content that also appears *inside* #main (not just body-level).
// These are the same modal/scaffolding classes the SPA reuses throughout the
// content tree — legal disclaimers, hidden learn-more/account dialogs,
// reservation/availability dialogs, and hidden scaffolding. They are NOT
// authorable page content and were leaking into the imported markdown as
// visible text. Removed in beforeTransform so block parsers never extract them.
//
// Each selector was verified against migration-work/cleaned.html for both its
// occurrence count and (via a nesting-aware subtree text scan) that it does NOT
// contain real authorable content (plan names/headings such as
// "Silver Unlimited", "GET HOME INTERNET", "5G Phones at prices", "TAX SEASON").
const IN_MAIN_LEAKED_NOISE = [
  '.terms-conditions-modal',                          // 60 — legal/disclaimer modals ("Offer valid through…")
  '.learn-more-modal',                                // 32 — hidden learn-more dialogs (also body-level above)
  '.learn-more-btn-container',                         // 29 — learn-more dialog trigger/scaffolding
  '.generic-modal',                                   // 2  — generic dialog scaffolding
  '.my-account-modal',                                // 1  — leaked "Account Dashboard / Manage Lines" account dialog
  '.icon.my-account.sliding-menu',                     // 23 (in #main) — account-dashboard sliding-menu nav items
  '.container.activation-node-reservation-success',    // 1  — "verify your identity" / reservation dialog
  '.trying-new-zipcode',                               // 1  — zipcode-retry dialog scaffolding
  '.check-avialability-success',                       // 1  — home-internet availability dialog
  '.check-avialability-serive-not-available',          // 1  — "service is not currently available" dialog
  '.check-avialability-thanks',                        // 1  — availability thank-you dialog
  '.container.otc-container',                           // 1  — hidden OTC scaffolding container
  '.hiddendiv',                                        // 1  — hidden scaffolding div
  '.modal-content',                                    // 111 — Bootstrap modal bodies (banner/reservation/zipcode dialogs, "Offer valid through…" legal text, {{mustache}} cart templates); verified no authorable headings inside
  '.sr-only',                                          // 135 — screen-reader-only labels ("Navbar Menu", "DataSpeed"); redundant a11y text, not visible content
  '.sliding-menu-widget-container',                    // account-dashboard sliding-menu widget ("Account Dashboard / Manage Lines" nav) injected into #main
  '.modal',                                            // remaining Bootstrap modal shells (dynamically-injected disclaimer/cart dialogs) not caught by more specific selectors above
];

// Responsive duplicate copies. The source ships desktop + mobile + tablet
// copies of the same content via Bootstrap display utilities, causing content
// to import 2-3×. We scraped at the desktop breakpoint (1440px), so we remove
// the copies that are HIDDEN at desktop (mobile/tablet-only twins) and KEEP the
// desktop copies (.d-none.d-lg-block / .d-lg-block — intentionally NOT listed).
//
// Verified in cleaned.html: .d-lg-none (36) and .d-none.d-md-block.d-lg-none (5)
// are the hidden-at-desktop variants; their desktop twins (.d-none.d-lg-block,
// 36) carry the same headings. A nesting-aware simulated removal confirmed that
// afterwards each key heading (TAX SEASON, SAME PRICE SINCE 2009,
// Connect to Wi-Fi, GET HOME INTERNET) appears exactly once — i.e. the desktop
// counterpart survives and no content is lost.
const RESPONSIVE_HIDDEN_TWINS = [
  '.d-lg-none',
  '.d-none.d-md-block.d-lg-none',
];

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove body-level modals/popups before block parsing so they never get
    // matched/extracted by block parsers.
    WebImporter.DOMUtils.remove(element, BODY_LEVEL_NOISE);

    // Remove leaked in-#main modal/scaffolding noise and the redundant
    // mobile/tablet responsive twins before parsing, so parsers only see the
    // single (desktop) copy of authorable content.
    WebImporter.DOMUtils.remove(element, IN_MAIN_LEAKED_NOISE);
    WebImporter.DOMUtils.remove(element, RESPONSIVE_HIDDEN_TWINS);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove non-authorable site chrome and hidden SPA scaffolding after block
    // parsers have run on the authored content. Only DOM-verified selectors are
    // used; broad blanket removals (iframe/link/style) are intentionally
    // avoided because Straight Talk's live SPA carries its authored content
    // inside a runtime iframe shell (#main-iframe) that does not exist in the
    // captured cleaned.html — blanket-removing it would strip all content.
    WebImporter.DOMUtils.remove(element, [
      ...SITE_CHROME,
      ...MAIN_SCAFFOLDING,
      'noscript',
    ]);
  }
}
