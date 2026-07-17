/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq. Base: accordion.
 * Source: https://www.straighttalk.com/
 * Container block: 2 columns, one row per Q/A item.
 * Model fields per item (accordion-faq-item): summary (text) + text (richtext).
 * Each .collapse panel holds the answer; its trigger ([aria-controls]/[href="#id"]) holds the question.
 */
export default function parse(element, { document }) {
  const panels = Array.from(element.querySelectorAll('.collapse, [class*="collapse"][id], .panel-collapse'));

  const cells = [];
  const seen = new Set();

  panels.forEach((panel) => {
    if (!panel || seen.has(panel)) return;
    seen.add(panel);

    const id = panel.id;

    // Question trigger: linked via aria-controls / href / data-target, else previous header sibling
    let trigger = null;
    if (id) {
      trigger = element.querySelector(`[aria-controls="${id}"]`)
        || element.querySelector(`[href="#${id}"]`)
        || element.querySelector(`[data-target="#${id}"]`);
    }
    if (!trigger) {
      let prev = panel.previousElementSibling;
      while (prev && prev.textContent.trim().length === 0) prev = prev.previousElementSibling;
      trigger = prev;
    }

    const questionText = trigger ? trigger.textContent.replace(/\s+/g, ' ').trim() : '';

    // Answer body: clone the panel content, then keep only top-level answer nodes.
    // Cloning + top-level children avoids double-capturing nested <p> inside wrappers.
    const bodyHost = panel.querySelector('.card-body, .panel-body, [class*="content"]') || panel;
    const clone = bodyHost.cloneNode(true);
    // Drop whitespace-only paragraphs (e.g. &nbsp; spacers)
    clone.querySelectorAll('p').forEach((p) => {
      const hasText = p.textContent.trim().length > 0;
      if (!hasText && !p.querySelector('img, a, br')) p.remove();
    });
    let answerNodes = Array.from(clone.children)
      .filter((n) => n.textContent.trim().length > 0 || n.querySelector('img, a'));
    if (answerNodes.length === 0) {
      answerNodes = Array.from(clone.querySelectorAll('p, ul, ol'))
        .filter((n) => n.textContent.trim().length > 0);
    }

    if (!questionText && answerNodes.length === 0) return;

    // Summary cell (text field) — plain text question
    const summaryFrag = document.createDocumentFragment();
    summaryFrag.appendChild(document.createComment(' field:summary '));
    summaryFrag.appendChild(document.createTextNode(questionText));

    // Text cell (richtext field) — answer content
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    answerNodes.forEach((n) => textFrag.appendChild(n));

    cells.push([summaryFrag, textFrag]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
