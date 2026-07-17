/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-marquee.js
  function parse(element, { document }) {
    let bgImage = element.querySelector(".image-teaser-container img, .responsivebackground img, img");
    if (!bgImage) {
      const bgHost = element.querySelector("[data-bgbannersrc], .responsivebackground, .image-teaser-container");
      const bgSrc = bgHost && (bgHost.getAttribute("data-bgbannersrc") || bgHost.getAttribute("data-background-image"));
      if (bgSrc) {
        bgImage = document.createElement("img");
        bgImage.src = bgSrc;
      }
    }
    const title = element.querySelector('.slide-title, h1, h2, [class*="title"]');
    if (title) {
      const desktopP = title.querySelector("p.d-lg-block, p.d-none.d-lg-block");
      if (desktopP) {
        title.querySelectorAll("p").forEach((p) => {
          if (p !== desktopP) p.remove();
        });
      }
    }
    let description = element.querySelector('.slide-description, [class*="description"], [class*="subtitle"]');
    if (description) {
      const desktopP = description.querySelector("p.d-lg-block, p.d-none.d-lg-block");
      if (desktopP) {
        description.querySelectorAll(":scope > p").forEach((p) => {
          if (p !== desktopP) p.remove();
        });
      }
    }
    const ctaLinks = Array.from(
      element.querySelectorAll(".slide-button a[href], .banner-btn a[href], a.btn[href]")
    );
    ctaLinks.forEach((a) => {
      a.querySelectorAll('.ae-compliance-indent, [class*="compliance"], .sr-only').forEach((s) => s.remove());
    });
    const cells = [];
    if (bgImage) {
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(" field:image "));
      imgFrag.appendChild(bgImage);
      cells.push([imgFrag]);
    } else {
      cells.push([""]);
    }
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(" field:text "));
    if (title) textFrag.appendChild(title);
    if (description) textFrag.appendChild(description);
    ctaLinks.forEach((a) => textFrag.appendChild(a));
    cells.push([textFrag]);
    if (!title && !description && ctaLinks.length === 0 && !bgImage) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-marquee", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-promo.js
  function parse2(element, { document }) {
    const columnEls = Array.from(
      element.querySelectorAll(':scope .row > .col-md-6, :scope .row > [class*="col-"], :scope [class*="col-lg-"]')
    ).filter((el) => el.className.includes("col-"));
    let panels = columnEls;
    if (panels.length < 2) {
      panels = Array.from(element.querySelectorAll(".banner-tile")).map((t) => t.closest('[class*="col-"]') || t);
    }
    const seen = /* @__PURE__ */ new Set();
    panels = panels.filter((p) => {
      if (!p || seen.has(p)) return false;
      seen.add(p);
      return true;
    }).slice(0, 2);
    const buildCell = (panel) => {
      const cell = [];
      if (!panel) return cell;
      const desktopContent = panel.querySelector(".position-absolute.d-lg-block, .position-absolute.d-none.d-lg-block, .d-none.d-lg-block .position-absolute") || panel.querySelector(".position-absolute");
      const desktopMedia = panel.querySelector(".d-none.d-lg-block .video-wrapper, .d-none.d-lg-block > img, img.vas-plan-card");
      if (desktopMedia) {
        if (desktopMedia.tagName === "IMG") {
          cell.push(desktopMedia);
        } else {
          const src = desktopMedia.querySelector("video source[src], source[src]");
          const videoUrl = src && src.getAttribute("src");
          if (videoUrl) {
            const a = document.createElement("a");
            a.href = videoUrl;
            a.textContent = "Video";
            cell.push(a);
          }
        }
      }
      if (desktopContent) {
        Array.from(desktopContent.querySelectorAll(":scope > p, :scope > h1, :scope > h2, :scope > h3")).forEach((n) => {
          n.querySelectorAll("a.details-trigger, a.icon-trigger, a:empty").forEach((a) => {
            if (!a.getAttribute("href")) a.remove();
          });
          cell.push(n);
        });
        const ctaBtn = desktopContent.querySelector(".button a[href], a.btn[href], a.btn");
        if (ctaBtn) cell.push(ctaBtn);
      }
      return cell;
    };
    const leftCell = buildCell(panels[0]);
    const rightCell = buildCell(panels[1]);
    if (leftCell.length === 0 && rightCell.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push([leftCell, rightCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-promo.js
  function parse3(element, { document }) {
    let tiles = Array.from(element.querySelectorAll(".banner-tile"));
    if (tiles.length === 0) {
      tiles = Array.from(element.querySelectorAll('.d-lg-block[class*="col-"], [class*="col-lg-"]')).filter((el) => el.querySelector("img, a[href]"));
    }
    const seenHref = /* @__PURE__ */ new Set();
    const seenEl = /* @__PURE__ */ new Set();
    tiles = tiles.filter((tile) => {
      if (!tile || seenEl.has(tile)) return false;
      seenEl.add(tile);
      const cta = tile.querySelector("a[href]");
      const key = cta ? cta.getAttribute("href") : null;
      if (key) {
        if (seenHref.has(key)) return false;
        seenHref.add(key);
      }
      return true;
    });
    const cells = [];
    tiles.forEach((tile) => {
      const img = tile.querySelector("img");
      const heading = tile.querySelector('.subtitle-two, h1, h2, h3, [class*="title"]');
      const description = tile.querySelector('.caption-one-normal, [class*="caption"], .caption-one');
      const cta = tile.querySelector(".position-absolute a[href], a.border-0[href], a[href]");
      if (description) {
        description.querySelectorAll("a.details-trigger, a.icon-trigger, a:not([href])").forEach((a) => {
          if (!a.getAttribute("href")) a.remove();
        });
      }
      if (!img && !heading && !description && !cta) return;
      const imgFrag = document.createDocumentFragment();
      if (img) {
        imgFrag.appendChild(document.createComment(" field:image "));
        imgFrag.appendChild(img);
      }
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      if (heading) textFrag.appendChild(heading);
      if (description) textFrag.appendChild(description);
      if (cta) textFrag.appendChild(cta);
      cells.push([img ? imgFrag : "", textFrag]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-promo.js
  function parse4(element, { document }) {
    const teaser = element.querySelector(".image-teaser-container.d-lg-block, .image-teaser-container.d-none.d-lg-block, .d-none.d-lg-block .image-teaser-container") || element.querySelector(".image-teaser-container") || element.querySelector(".banner-tile") || element;
    let bgImage = teaser.querySelector("img");
    if (!bgImage) {
      const styleHost = teaser.matches('[style*="background-image"]') ? teaser : teaser.querySelector('[style*="background-image"]');
      const style = styleHost && styleHost.getAttribute("style");
      const m = style && style.match(/background-image:\s*url\((['"]?)(.*?)\1\)/i);
      if (m && m[2]) {
        bgImage = document.createElement("img");
        bgImage.src = m[2];
      }
    }
    const title = teaser.querySelector('h1, h2, .slide-title, .heading-four, [class*="title"]');
    let description = teaser.querySelector(".slide-description");
    if (!description) {
      const paras = Array.from(teaser.querySelectorAll("div > p, p"));
      description = paras.find((p) => (!title || !title.contains(p)) && p.textContent.trim().length > 0) || null;
    }
    if (description) {
      description.querySelectorAll("a.details-trigger, a.icon-trigger, a:not([href])").forEach((a) => {
        if (!a.getAttribute("href")) a.remove();
      });
    }
    const cta = teaser.querySelector(".banner-btn a.btn[href], .slide-button a[href], a.btn[href]");
    const cells = [];
    if (bgImage) {
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(" field:image "));
      imgFrag.appendChild(bgImage);
      cells.push([imgFrag]);
    } else {
      cells.push([""]);
    }
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(" field:text "));
    if (title) textFrag.appendChild(title);
    if (description) textFrag.appendChild(description);
    if (cta) textFrag.appendChild(cta);
    cells.push([textFrag]);
    if (!bgImage && !title && !description && !cta) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon.js
  function parse5(element, { document }) {
    let anchors = Array.from(element.querySelectorAll('a.border-0[href], [class*="col-"] a[href]')).filter((a) => a.textContent.trim().length > 0);
    const seenHref = /* @__PURE__ */ new Set();
    anchors = anchors.filter((a) => {
      const href = a.getAttribute("href");
      if (!href || seenHref.has(href)) return false;
      seenHref.add(href);
      return true;
    });
    const cells = [];
    anchors.forEach((anchor) => {
      const col = anchor.closest('[class*="col-"]') || anchor.parentElement;
      let icon = col.querySelector("img.responsiveimage");
      if (!icon) {
        icon = Array.from(col.querySelectorAll("img")).find((img) => !anchor.contains(img)) || null;
      }
      if (!icon) {
        const bgHost = col.querySelector('[style*="background-image"]');
        const m = bgHost && (bgHost.getAttribute("style") || "").match(/background-image:\s*url\((['"]?)(.*?)\1\)/i);
        if (m && m[2]) {
          icon = document.createElement("img");
          icon.src = m[2];
        }
      }
      const imgFrag = document.createDocumentFragment();
      if (icon) {
        imgFrag.appendChild(document.createComment(" field:image "));
        imgFrag.appendChild(icon);
      }
      anchor.querySelectorAll("img").forEach((img) => img.remove());
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      textFrag.appendChild(anchor);
      cells.push([icon ? imgFrag : "", textFrag]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-icon", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-plans.js
  function parse6(element, { document }) {
    let cardEls = Array.from(element.querySelectorAll(".plan-card.small-plan-card, .plan-card"));
    const seenHref = /* @__PURE__ */ new Set();
    const seenEl = /* @__PURE__ */ new Set();
    cardEls = cardEls.filter((card) => {
      if (!card || seenEl.has(card)) return false;
      seenEl.add(card);
      const cta = card.querySelector("a[href]");
      const href = cta && cta.getAttribute("href");
      if (href) {
        if (seenHref.has(href)) return false;
        seenHref.add(href);
      }
      return true;
    });
    const cells = [];
    cardEls.forEach((card) => {
      const icon = card.querySelector(".promo-text .icon img, .icon img, img");
      const badge = card.querySelector(".pln-card-pill");
      const name = card.querySelector(".promo-text h2, .promo-text");
      const price = card.querySelector(".plan-price");
      const subprice = card.querySelector(".plan-price-offer");
      const featureList = card.querySelector("ul, ol");
      const cta = card.querySelector(".secondary-btn-black a[href], a[href]");
      let cleanedList = null;
      if (featureList) {
        cleanedList = featureList.cloneNode(true);
        cleanedList.querySelectorAll('.sr-only, [class*="sr-only"], .icon, [aria-hidden="true"]').forEach((n) => n.remove());
        cleanedList.querySelectorAll("span:empty").forEach((n) => n.remove());
      }
      const imgFrag = document.createDocumentFragment();
      if (icon) {
        imgFrag.appendChild(document.createComment(" field:image "));
        imgFrag.appendChild(icon);
      }
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      if (badge) textFrag.appendChild(badge);
      if (name) textFrag.appendChild(name);
      if (price) textFrag.appendChild(price);
      if (subprice) textFrag.appendChild(subprice);
      if (cleanedList) textFrag.appendChild(cleanedList);
      if (cta) textFrag.appendChild(cta);
      if (!name && !price && !cleanedList && !cta) return;
      cells.push([icon ? imgFrag : "", textFrag]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-plans", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-feature.js
  function parse7(element, { document }) {
    let anchors = Array.from(element.querySelectorAll("a[href]")).filter((a) => a.textContent.trim().length > 0 && /shop|check|learn/i.test(a.textContent) && !/^\s*LEARN MORE\s*$/i.test(a.textContent.trim()));
    const seenHref = /* @__PURE__ */ new Set();
    anchors = anchors.filter((a) => {
      const href = a.getAttribute("href");
      if (!href || seenHref.has(href)) return false;
      seenHref.add(href);
      return true;
    });
    const cells = [];
    anchors.forEach((anchor) => {
      const col = anchor.closest('.col-xl-6, .col-lg-6, [class*="col-"]') || anchor.parentElement;
      let icon = col.querySelector("img.img-responsive, img.responsiveimage, img");
      if (!icon) {
        const bgHost = col.querySelector('[style*="background-image"]');
        const m = bgHost && (bgHost.getAttribute("style") || "").match(/background-image:\s*url\((['"]?)(.*?)\1\)/i);
        if (m && m[2]) {
          icon = document.createElement("img");
          icon.src = m[2];
        }
      }
      const paras = Array.from(col.querySelectorAll("p")).filter((p) => !p.contains(anchor) && p.textContent.trim().length > 0);
      const imgFrag = document.createDocumentFragment();
      if (icon) {
        imgFrag.appendChild(document.createComment(" field:image "));
        imgFrag.appendChild(icon);
      }
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      paras.forEach((p) => textFrag.appendChild(p));
      textFrag.appendChild(anchor);
      cells.push([icon ? imgFrag : "", textFrag]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-product.js
  function parse8(element, { document }) {
    let cardEls = Array.from(element.querySelectorAll(".phone-card"));
    const seenHref = /* @__PURE__ */ new Set();
    const seenEl = /* @__PURE__ */ new Set();
    cardEls = cardEls.filter((card) => {
      if (!card || seenEl.has(card)) return false;
      seenEl.add(card);
      const cta = card.querySelector("a[href]");
      const href = cta && cta.getAttribute("href");
      if (href) {
        if (seenHref.has(href)) return false;
        seenHref.add(href);
      }
      return true;
    });
    const cells = [];
    cardEls.forEach((card) => {
      const img = card.querySelector(".phone-image img, img.responsiveimage, img");
      const eyebrow = card.querySelector(".promo-text.product-banner, .product-banner");
      const name = card.querySelector('.phone-name p, .phone-name, [role="heading"]');
      const priceBlocks = Array.from(card.querySelectorAll(".retail-price, .price-detail")).filter((p) => p.textContent.trim().length > 0 && !p.closest(".d-none"));
      const cta = card.querySelector("a[href]");
      const imgFrag = document.createDocumentFragment();
      if (img) {
        imgFrag.appendChild(document.createComment(" field:image "));
        imgFrag.appendChild(img);
      }
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      if (eyebrow && eyebrow.textContent.trim().length > 0) textFrag.appendChild(eyebrow);
      if (name) textFrag.appendChild(name);
      priceBlocks.forEach((p) => textFrag.appendChild(p));
      if (cta) textFrag.appendChild(cta);
      if (!img && !name && priceBlocks.length === 0 && !cta) return;
      cells.push([img ? imgFrag : "", textFrag]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-tile.js
  function parse9(element, { document }) {
    let tiles = Array.from(element.querySelectorAll(".image-container.banner-tile, .banner-tile"));
    const seenHref = /* @__PURE__ */ new Set();
    const seenEl = /* @__PURE__ */ new Set();
    tiles = tiles.filter((tile) => {
      if (!tile || seenEl.has(tile)) return false;
      seenEl.add(tile);
      const link = tile.querySelector("a[href]");
      const href = tile.getAttribute("data-tile-href") || link && link.getAttribute("href");
      if (href) {
        if (seenHref.has(href)) return false;
        seenHref.add(href);
      }
      return true;
    });
    const cells = [];
    tiles.forEach((tile) => {
      let img = tile.querySelector("img");
      if (!img) {
        const bgHost = tile.matches('[style*="background-image"]') ? tile : tile.querySelector('[style*="background-image"]');
        const m = bgHost && (bgHost.getAttribute("style") || "").match(/background-image:\s*url\((['"]?)(.*?)\1\)/i);
        if (m && m[2]) {
          img = document.createElement("img");
          img.src = m[2];
        }
      }
      const link = tile.querySelector("a[href]");
      const paras = Array.from(tile.querySelectorAll("p")).filter((p) => (!link || !link.contains(p)) && p.textContent.trim().length > 0);
      if (link) link.querySelectorAll("img").forEach((i) => i.remove());
      const imgFrag = document.createDocumentFragment();
      if (img) {
        imgFrag.appendChild(document.createComment(" field:image "));
        imgFrag.appendChild(img);
      }
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      paras.forEach((p) => textFrag.appendChild(p));
      if (link) textFrag.appendChild(link);
      if (!img && paras.length === 0 && !link) return;
      cells.push([img ? imgFrag : "", textFrag]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-tile", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-faq.js
  function parse10(element, { document }) {
    const panels = Array.from(element.querySelectorAll('.collapse, [class*="collapse"][id], .panel-collapse'));
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    panels.forEach((panel) => {
      if (!panel || seen.has(panel)) return;
      seen.add(panel);
      const id = panel.id;
      let trigger = null;
      if (id) {
        trigger = element.querySelector(`[aria-controls="${id}"]`) || element.querySelector(`[href="#${id}"]`) || element.querySelector(`[data-target="#${id}"]`);
      }
      if (!trigger) {
        let prev = panel.previousElementSibling;
        while (prev && prev.textContent.trim().length === 0) prev = prev.previousElementSibling;
        trigger = prev;
      }
      const questionText = trigger ? trigger.textContent.replace(/\s+/g, " ").trim() : "";
      const bodyHost = panel.querySelector('.card-body, .panel-body, [class*="content"]') || panel;
      const clone = bodyHost.cloneNode(true);
      clone.querySelectorAll("p").forEach((p) => {
        const hasText = p.textContent.trim().length > 0;
        if (!hasText && !p.querySelector("img, a, br")) p.remove();
      });
      let answerNodes = Array.from(clone.children).filter((n) => n.textContent.trim().length > 0 || n.querySelector("img, a"));
      if (answerNodes.length === 0) {
        answerNodes = Array.from(clone.querySelectorAll("p, ul, ol")).filter((n) => n.textContent.trim().length > 0);
      }
      if (!questionText && answerNodes.length === 0) return;
      const summaryFrag = document.createDocumentFragment();
      summaryFrag.appendChild(document.createComment(" field:summary "));
      summaryFrag.appendChild(document.createTextNode(questionText));
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      answerNodes.forEach((n) => textFrag.appendChild(n));
      cells.push([summaryFrag, textFrag]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/straighttalk-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var BODY_LEVEL_NOISE = [
    ".location-dropdown",
    // <div class="location-dropdown"> (5062)
    ".modal_wrapper.responsivegrid",
    // <div class="modal_wrapper responsivegrid"> (5064)
    ".cart-full",
    // <div class="cart-full"> (6284)
    ".learn-more-modal",
    // <div class="learn-more-modal"> (many)
    ".smart-pay-limit-reached",
    // <div class="smart-pay-limit-reached"> (6372)
    ".pre-order-modal-container",
    // <div class="pre-order-modal-container"> (6525)
    ".my-account-modal",
    // <div class="my-account-modal">
    ".home-internet-limit-reached",
    // <div class="home-internet-limit-reached">
    ".container.home-internet-check-availablity",
    // <div class="container home-internet-check-availablity">
    ".check-avialability-success",
    // <div class="check-avialability-success">
    ".hiddendiv.common",
    // <div class="hiddendiv common">
    ".fb_lightbox-overlay.fb_lightbox-overlay-fixed"
    // FB lightbox overlay
  ];
  var SITE_CHROME = [
    "#page-header-wrapper",
    "#pageHeader",
    "header",
    "#page-footer-wrapper",
    "footer",
    "#ae_enabled_site",
    // AudioEye accessibility blurb (body-level scaffolding)
    "#tDrkDiv"
    // empty overlay scaffolding div
  ];
  var MAIN_SCAFFOLDING = [
    ".cusg-details-base-page",
    "#basePageH1"
  ];
  var IN_MAIN_LEAKED_NOISE = [
    ".terms-conditions-modal",
    // 60 — legal/disclaimer modals ("Offer valid through…")
    ".learn-more-modal",
    // 32 — hidden learn-more dialogs (also body-level above)
    ".learn-more-btn-container",
    // 29 — learn-more dialog trigger/scaffolding
    ".generic-modal",
    // 2  — generic dialog scaffolding
    ".my-account-modal",
    // 1  — leaked "Account Dashboard / Manage Lines" account dialog
    ".icon.my-account.sliding-menu",
    // 23 (in #main) — account-dashboard sliding-menu nav items
    ".container.activation-node-reservation-success",
    // 1  — "verify your identity" / reservation dialog
    ".trying-new-zipcode",
    // 1  — zipcode-retry dialog scaffolding
    ".check-avialability-success",
    // 1  — home-internet availability dialog
    ".check-avialability-serive-not-available",
    // 1  — "service is not currently available" dialog
    ".check-avialability-thanks",
    // 1  — availability thank-you dialog
    ".container.otc-container",
    // 1  — hidden OTC scaffolding container
    ".hiddendiv",
    // 1  — hidden scaffolding div
    ".modal-content",
    // 111 — Bootstrap modal bodies (banner/reservation/zipcode dialogs, "Offer valid through…" legal text, {{mustache}} cart templates); verified no authorable headings inside
    ".sr-only",
    // 135 — screen-reader-only labels ("Navbar Menu", "DataSpeed"); redundant a11y text, not visible content
    ".sliding-menu-widget-container",
    // account-dashboard sliding-menu widget ("Account Dashboard / Manage Lines" nav) injected into #main
    ".modal"
    // remaining Bootstrap modal shells (dynamically-injected disclaimer/cart dialogs) not caught by more specific selectors above
  ];
  var RESPONSIVE_HIDDEN_TWINS = [
    ".d-lg-none",
    ".d-none.d-md-block.d-lg-none"
  ];
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, BODY_LEVEL_NOISE);
      WebImporter.DOMUtils.remove(element, IN_MAIN_LEAKED_NOISE);
      WebImporter.DOMUtils.remove(element, RESPONSIVE_HIDDEN_TWINS);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ...SITE_CHROME,
        ...MAIN_SCAFFOLDING,
        "noscript"
      ]);
    }
  }

  // tools/importer/transformers/straighttalk-dm-images.js
  function detectDynamicMediaUrl(urlStr) {
    let u;
    try {
      u = new URL(urlStr, "https://x/");
    } catch (e) {
      return false;
    }
    if (u.pathname.startsWith("/is/image/")) {
      return "scene7";
    }
    if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname) && u.pathname.startsWith("/adobe/assets/urn:")) {
      return "dm-openapi";
    }
    return false;
  }
  var LINKED_DM_INLINE_WRAPPER_TAGS = /* @__PURE__ */ new Set(["PICTURE"]);
  var LINKED_DM_WRAPPER_SIBLING_TAGS = /* @__PURE__ */ new Set(["SOURCE"]);
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
    if (!parent || parent.tagName !== "A") return null;
    if (parent.children.length !== 1 || parent.children[0] !== node) return null;
    if (parent.textContent.trim() !== "") return null;
    return parent;
  }
  var EMPTY_ALT_SENTINEL = "Image without alt text";
  function altToLinkText(alt) {
    return alt || EMPTY_ALT_SENTINEL;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const doc = element.ownerDocument;
    element.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (!detectDynamicMediaUrl(src)) return;
      const alt = img.getAttribute("alt") || "";
      const linkedAnchor = findLinkedDmCarrier(img);
      if (linkedAnchor) {
        linkedAnchor.setAttribute("title", src);
        linkedAnchor.textContent = altToLinkText(alt);
        return;
      }
      const parent = img.parentElement;
      if (parent && parent.tagName === "A") {
        console.warn("DM image inside mixed-content anchor, skipped:", src);
        return;
      }
      const a = doc.createElement("a");
      a.href = src;
      a.textContent = altToLinkText(alt);
      img.replaceWith(a);
    });
  }

  // tools/importer/transformers/straighttalk-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function resolveSectionEl(element, selector) {
    if (!selector) return element.firstElementChild;
    let sel = selector.trim().replace(/^#main\s*>?\s*/, "");
    if (!sel) return element.firstElementChild;
    try {
      return element.querySelector(sel);
    } catch (e) {
      return null;
    }
  }
  function lowestCommonAncestor(els) {
    if (els.length === 0) return null;
    const ancestorsOf = (node) => {
      const set = /* @__PURE__ */ new Set();
      let n = node;
      while (n) {
        set.add(n);
        n = n.parentElement;
      }
      return set;
    };
    let common = els[0];
    for (let i = 1; i < els.length; i += 1) {
      const anc = ancestorsOf(els[i]);
      let n = common;
      while (n && !anc.has(n)) n = n.parentElement;
      common = n;
      if (!common) return null;
    }
    return common;
  }
  function topLevelAncestorWithin(el, container) {
    let n = el;
    while (n && n.parentElement !== container) n = n.parentElement;
    return n;
  }
  function transform3(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) return;
    const template = payload && payload.template;
    const sections = template && Array.isArray(template.sections) ? template.sections : [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument;
    let matched = sections.map((section) => ({ section, el: resolveSectionEl(element, section.selector) })).filter((r) => r.el);
    matched = matched.filter(
      (r) => !matched.some((o) => o !== r && r.el !== o.el && r.el.contains(o.el))
    );
    if (matched.length < 2) {
      return;
    }
    const container = lowestCommonAncestor(matched.map((r) => r.el));
    if (!container) return;
    const anchors = [];
    const seen = /* @__PURE__ */ new Set();
    matched.forEach(({ section, el }) => {
      const topEl = topLevelAncestorWithin(el, container);
      if (!topEl || seen.has(topEl)) return;
      seen.add(topEl);
      anchors.push({ section, topEl });
    });
    if (anchors.length < 2) return;
    for (let i = anchors.length - 1; i >= 0; i -= 1) {
      const { section, topEl } = anchors[i];
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        if (topEl.nextSibling) {
          container.insertBefore(metaBlock, topEl.nextSibling);
        } else {
          container.appendChild(metaBlock);
        }
      }
      if (i > 0) {
        const hr = doc.createElement("hr");
        container.insertBefore(hr, topEl);
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-marquee": parse,
    "columns-promo": parse2,
    "cards-promo": parse3,
    "hero-promo": parse4,
    "cards-icon": parse5,
    "cards-plans": parse6,
    "cards-feature": parse7,
    "cards-product": parse8,
    "cards-tile": parse9,
    "accordion-faq": parse10
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Straight Talk homepage: hero/marquee promo, promotional banner grid, home internet skinny banner, get-started tiles, phone plans comparison cards, why-choose-us feature grid, bundle discount banner, featured 5G phones grid, more-ways-to-connect device tiles, and FAQ accordion.",
    urls: [
      "https://www.straighttalk.com/"
    ],
    blocks: [
      { name: "hero-marquee", instances: ["#main .dark-theme.primary-carousel.pr-0.pl-0.container-fluid"] },
      { name: "columns-promo", instances: ["#main .cmp-experiencefragment--st-home-bento"] },
      { name: "cards-promo", instances: ["#main .cmp-experiencefragment--st-hp-three-card-bento"] },
      { name: "hero-promo", instances: ['#main .primary-carousel.bg-white:has(a[href*="5g-lte-home-internet"])', '#main .primary-carousel.bg-white:has(a[href*="fiber-home-internet"])'] },
      { name: "cards-icon", instances: ['#main .columncontrol.bg-white.pt-40:has(a[href*="bring-your-own-phone.html"])'] },
      { name: "cards-plans", instances: ["#main .columncontrol.bg-white.pt-40:has(.plan-card.small-plan-card)"] },
      { name: "cards-feature", instances: ['#main .columncontrol.bg-white.pt-40:has(a[href*="plans/walmart-plus"])'] },
      { name: "cards-product", instances: ["#main .phone-genie-content"] },
      { name: "cards-tile", instances: ['#main .columncontrol.bg-white.pt-40:has(a[href*="devices/wifi-hotspots"])'] },
      { name: "accordion-faq", instances: ["#main .accordion-new.cmp-accordion"] }
    ],
    sections: [
      { id: "section-1", name: "Hero / Marquee Promo", selector: "#main .dark-theme.primary-carousel.pr-0.pl-0.container-fluid", style: "dark", blocks: ["hero-marquee", "columns-promo"], defaultContent: [] },
      { id: "section-2", name: "Promotional Banner Grid (3-up)", selector: "#main .cmp-experiencefragment--st-hp-three-card-bento", style: "dark", blocks: ["cards-promo"], defaultContent: [] },
      { id: "section-3", name: "Home Internet Skinny Banner", selector: '#main .primary-carousel.bg-white:has(a[href*="5g-lte-home-internet"])', style: null, blocks: ["hero-promo"], defaultContent: [] },
      { id: "section-4", name: "Let's Get Started Tiles + Award Badges", selector: '#main .columncontrol.bg-white.pt-40:has(a[href*="bring-your-own-phone.html"])', style: "light", blocks: ["cards-icon"], defaultContent: ["#main .cmp-experiencefragment--st-hp-rewards-section"] },
      { id: "section-5", name: "Phone Plans Comparison Cards", selector: "#main .columncontrol.bg-white.pt-40:has(.plan-card.small-plan-card)", style: "light", blocks: ["cards-plans"], defaultContent: [] },
      { id: "section-6", name: "Wi-Fi Calling Note", selector: "#main > div.root.responsivegrid", style: null, blocks: [], defaultContent: [] },
      { id: "section-7", name: "Why Choose Straight Talk? Feature Grid", selector: '#main .columncontrol.bg-white.pt-40:has(a[href*="plans/walmart-plus"])', style: "light", blocks: ["cards-feature"], defaultContent: [] },
      { id: "section-8", name: "Fios Bundle Discount Banner", selector: '#main .primary-carousel.bg-white:has(a[href*="fiber-home-internet"])', style: null, blocks: ["hero-promo"], defaultContent: [] },
      { id: "section-9", name: "5G Phones Featured Grid", selector: "#main .phone-genie-content", style: "light", blocks: ["cards-product"], defaultContent: [] },
      { id: "section-10", name: "More Ways To Stay Connected Device Tiles", selector: '#main .columncontrol.bg-white.pt-40:has(a[href*="devices/wifi-hotspots"])', style: "light", blocks: ["cards-tile"], defaultContent: [] },
      { id: "section-11", name: "FAQ Accordion + Store Locator", selector: "#main .accordion-new.cmp-accordion", style: "light", blocks: ["accordion-faq"], defaultContent: ["#main .columncontrol.store-locator.text-center"] }
    ]
  };
  var transformers = [
    transform,
    transform2,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform3] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
