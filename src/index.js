import html from './template.html';
import css from './styles.css';
import Splitting from './splitting.js';

const splitting = Splitting()

class VariBio extends window.HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = `<style type="text/css">${css}</style>${html}`;
    this._$bios = this.shadowRoot.getElementById('bios');
    this._$display = this.shadowRoot.getElementById('display');

    this._$bios.addEventListener('slotchange', () => this._init('slotchange'));
    document.fonts.ready.then(() => this._init('fontsready'));
  }

  _init(type) {
    if (this.debug) console.log(type);
    this.ready = false;
    const $elements = this._$bios.assignedElements();
    this.querySelectorAll('[slot="_display"]').forEach(($el) => $el.remove());
    const finalWidths = $elements.map(this._measure, this);
    finalWidths.sort((a, b) => a.length - b.length).forEach(([{ $elem }], index) => $elem.dataset.index = index);
    this._widths = this._configure(finalWidths);
    this._redactions = this._markings(this._widths);
    this._progress();
    this._display();
    this._onReady();
  }


  _onReady() {
    this.ready = true;
    const detail = {
      max: this.max,
      value: this.value,
    }
    const event = new CustomEvent('ready', { detail });
    this.dispatchEvent(event);
  }

  _markings(startingWidths) {
    this._$display.innerHTML = '';
    const markings = startingWidths.map((arr) => {
      const $span = document.createElement('span');
      this._$display.appendChild($span);
      const uniqueStarts = new Set(arr.map(({ start }) => start));
      const diffStarts = [...uniqueStarts].reduce((acc, start, index) => Math.abs(index % 0 ? acc + start : acc - start), 0);
      return {
        cumulativeDiff: diffStarts,
        uniqueWidths: uniqueStarts.size === arr.length
      }
    });
    const unique = markings.filter(({ uniqueWidths }) => Boolean(uniqueWidths));
    const [optimalMarking] = unique.sort((a, b) => b.cumulativeDiff - a.cumulativeDiff) || unique;
    const optimalIndex = markings.indexOf(optimalMarking);
    this._$display.children[optimalIndex].addEventListener('transitionend', () => this._display());
    return [...this._$display.children];
  }

  _configure(paragraphs) {
    return paragraphs.reduceRight((acc, currentSet, paragraphIndex) => {
      // Gives us Array(largest amount of words) of Array(total paragraphs) of { start, end }
      if (!Array.isArray(acc)) return currentSet.map(({ width }) => paragraphs.map(() => ({ start: width, end: width })));
      const largerSet = paragraphs[paragraphIndex + 1];
      const introducedItems = largerSet
        .slice()
        .sort((a, b) => a.characters - b.characters)
        .slice(0, largerSet.length - currentSet.length);
      const hopper = currentSet.slice();
      acc.forEach((arr, i) => {
        const largerItem = largerSet[i];
        arr[paragraphIndex] = { start: 0, end: 0 };
        if (arr[paragraphIndex + 1]?.start) {
          arr[paragraphIndex].start = largerItem && introducedItems.includes(largerItem)
            ? 0
            : hopper.shift()?.width || 0;
          arr[paragraphIndex].end = arr[paragraphIndex + 1].start;
        }
      });
      return acc;
    }, null);
  }

  _measure($elem) {
    const target = this;
    const $clone = $elem.cloneNode(true);
    const [{ el, words }] = splitting({ target: $clone, by: 'words' });
    el.setAttribute('slot', '_display');
    target.appendChild(el); // make append element option ??
    el.style.position = 'absolute';
    const nodes = words.map(($word) => {
      const { width } = $word.getBoundingClientRect();
      return { characters: $word.textContent.length, width, $elem }
    });
    if (!this.debug) el.remove();
    return nodes;
  }

  static get observedAttributes() {
      return ['value']
  }

  attributeChangedCallback(attr) {
    if (attr === 'value') {
      this._progress();
    }
  }

  _parse(value) {
    const index = Math.floor(value);
    return {
      index,
      progress: parseFloat(value) - index
    };
  }

  _display() {
    const { index, progress } = this._parse(this.value);
    this.querySelectorAll('[data-index]').forEach(($elem) => {
      if (!progress & $elem.dataset.index == index) $elem.style.opacity = 1;
    });
    if (!this.debug) this._$display.style.opacity = Math.ceil(progress);
  }

  _reset() {
    this.querySelectorAll('[data-index]').forEach(($elem) => {
      $elem.style.removeProperty('opacity');
    });
    this._$display.style.opacity = 1;
  }

  _progress() {
    const { index, progress } = this._parse(this.value);
    if (!Array.isArray(this._redactions)) return;
    this._reset();

    this.style.setProperty('--vari-bio-progress', progress.toFixed(3));

    this._redactions.forEach(($span, i) => {
      const { start = 0, end = 0 } = this._widths[i][index];
      $span.style.setProperty('width', `calc(${start}px - ((${start}px - ${end}px) * var(--vari-bio-progress, 0)))`);
      $span.style.removeProperty('margin-inline-start');
      if (!start) $span.style.setProperty('margin-inline-start', `calc((var(--vari-bio-space, .55ch) * -1) * (1 - var(--vari-bio-progress, 0)))`);
      if (!end) $span.style.setProperty('margin-inline-start', `calc((var(--vari-bio-space, .55ch) * -1))`);
    });
  }

  get value() {
    return parseFloat(this.getAttribute('value'), 10) || 0;
  }

  set value(newVal) {
    if (!isNaN(newVal)) {
      this.setAttribute('value', newVal);
    } else {
      this.removeAttribute('value');
    }
  }

  get max() {
    return this._$bios.assignedElements().length - 1;
  }

  get debug() {
    return this.hasAttribute('debug');
  }

  set debug(newVal) {
    if (newVal) {
      this.setAttribute('debug', '');
    } else {
      this.removeAttribute('debug');
    }
  }

}

window.customElements.define('vari-bio', VariBio);