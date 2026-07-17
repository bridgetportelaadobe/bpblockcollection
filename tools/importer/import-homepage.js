/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroMarqueeParser from './parsers/hero-marquee.js';
import columnsPromoParser from './parsers/columns-promo.js';
import cardsPromoParser from './parsers/cards-promo.js';
import heroPromoParser from './parsers/hero-promo.js';
import cardsIconParser from './parsers/cards-icon.js';
import cardsPlansParser from './parsers/cards-plans.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import cardsProductParser from './parsers/cards-product.js';
import cardsTileParser from './parsers/cards-tile.js';
import accordionFaqParser from './parsers/accordion-faq.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/straighttalk-cleanup.js';
import dmImagesTransformer from './transformers/straighttalk-dm-images.js';
import sectionsTransformer from './transformers/straighttalk-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-marquee': heroMarqueeParser,
  'columns-promo': columnsPromoParser,
  'cards-promo': cardsPromoParser,
  'hero-promo': heroPromoParser,
  'cards-icon': cardsIconParser,
  'cards-plans': cardsPlansParser,
  'cards-feature': cardsFeatureParser,
  'cards-product': cardsProductParser,
  'cards-tile': cardsTileParser,
  'accordion-faq': accordionFaqParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Straight Talk homepage: hero/marquee promo, promotional banner grid, home internet skinny banner, get-started tiles, phone plans comparison cards, why-choose-us feature grid, bundle discount banner, featured 5G phones grid, more-ways-to-connect device tiles, and FAQ accordion.',
  urls: [
    'https://www.straighttalk.com/',
  ],
  blocks: [
    { name: 'hero-marquee', instances: ['#main .dark-theme.primary-carousel.pr-0.pl-0.container-fluid'] },
    { name: 'columns-promo', instances: ['#main .cmp-experiencefragment--st-home-bento'] },
    { name: 'cards-promo', instances: ['#main .cmp-experiencefragment--st-hp-three-card-bento'] },
    { name: 'hero-promo', instances: ['#main .primary-carousel.bg-white:has(a[href*="5g-lte-home-internet"])', '#main .primary-carousel.bg-white:has(a[href*="fiber-home-internet"])'] },
    { name: 'cards-icon', instances: ['#main .columncontrol.bg-white.pt-40:has(a[href*="bring-your-own-phone.html"])'] },
    { name: 'cards-plans', instances: ['#main .columncontrol.bg-white.pt-40:has(.plan-card.small-plan-card)'] },
    { name: 'cards-feature', instances: ['#main .columncontrol.bg-white.pt-40:has(a[href*="plans/walmart-plus"])'] },
    { name: 'cards-product', instances: ['#main .phone-genie-content'] },
    { name: 'cards-tile', instances: ['#main .columncontrol.bg-white.pt-40:has(a[href*="devices/wifi-hotspots"])'] },
    { name: 'accordion-faq', instances: ['#main .accordion-new.cmp-accordion'] },
  ],
  sections: [
    { id: 'section-1', name: 'Hero / Marquee Promo', selector: '#main .dark-theme.primary-carousel.pr-0.pl-0.container-fluid', style: 'dark', blocks: ['hero-marquee', 'columns-promo'], defaultContent: [] },
    { id: 'section-2', name: 'Promotional Banner Grid (3-up)', selector: '#main .cmp-experiencefragment--st-hp-three-card-bento', style: 'dark', blocks: ['cards-promo'], defaultContent: [] },
    { id: 'section-3', name: 'Home Internet Skinny Banner', selector: '#main .primary-carousel.bg-white:has(a[href*="5g-lte-home-internet"])', style: null, blocks: ['hero-promo'], defaultContent: [] },
    { id: 'section-4', name: "Let's Get Started Tiles + Award Badges", selector: '#main .columncontrol.bg-white.pt-40:has(a[href*="bring-your-own-phone.html"])', style: 'light', blocks: ['cards-icon'], defaultContent: ['#main .cmp-experiencefragment--st-hp-rewards-section'] },
    { id: 'section-5', name: 'Phone Plans Comparison Cards', selector: '#main .columncontrol.bg-white.pt-40:has(.plan-card.small-plan-card)', style: 'light', blocks: ['cards-plans'], defaultContent: [] },
    { id: 'section-6', name: 'Wi-Fi Calling Note', selector: '#main > div.root.responsivegrid', style: null, blocks: [], defaultContent: [] },
    { id: 'section-7', name: 'Why Choose Straight Talk? Feature Grid', selector: '#main .columncontrol.bg-white.pt-40:has(a[href*="plans/walmart-plus"])', style: 'light', blocks: ['cards-feature'], defaultContent: [] },
    { id: 'section-8', name: 'Fios Bundle Discount Banner', selector: '#main .primary-carousel.bg-white:has(a[href*="fiber-home-internet"])', style: null, blocks: ['hero-promo'], defaultContent: [] },
    { id: 'section-9', name: '5G Phones Featured Grid', selector: '#main .phone-genie-content', style: 'light', blocks: ['cards-product'], defaultContent: [] },
    { id: 'section-10', name: 'More Ways To Stay Connected Device Tiles', selector: '#main .columncontrol.bg-white.pt-40:has(a[href*="devices/wifi-hotspots"])', style: 'light', blocks: ['cards-tile'], defaultContent: [] },
    { id: 'section-11', name: 'FAQ Accordion + Store Locator', selector: '#main .accordion-new.cmp-accordion', style: 'light', blocks: ['accordion-faq'], defaultContent: ['#main .columncontrol.store-locator.text-center'] },
  ],
};

// TRANSFORMER REGISTRY
// cleanup + dm-images register both hooks internally; sections runs in afterTransform.
const transformers = [
  cleanupTransformer,
  dmImagesTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      let elements = [];
      try {
        elements = document.querySelectorAll(selector);
      } catch (e) {
        console.warn(`Invalid selector for "${blockDef.name}": ${selector}`, e.message);
      }
      if (!elements || elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already detached by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + DM image carriers + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index',
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
