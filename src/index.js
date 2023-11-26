import html from './template.html';
import css from './styles.css';
import Splitting from './splitting.js';

const splitting = Splitting()

class VariBio extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = `<style type="text/css">${css}</style>${html}`;
    this._$bios = this.shadowRoot.getElementById('bios');
    this._$display = this.shadowRoot.getElementById('display');

    this._transition = () => {
      this._display();
      this._$display.removeEventListener('transitionend', this._transition);
    }

    this._$bios.addEventListener('slotchange', () => {
      this.ready = false;
      const $elements = this._$bios.assignedElements();
      this.max = $elements.length - 1;
      const finalWidths = $elements.sort((a, b) => a.textContent.length - b.textContent.length).map(this._measure, this);
      this._widths = this._configure(finalWidths);
      this._redactions = this._markings(this._widths);
      this._progress();
      this._display();
      this._onReady();
    });
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
    return startingWidths.map(() => {
      const $span = document.createElement('span');
      return this._$display.appendChild($span);
    });
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

  _measure($elem, index) {
    $elem.dataset.index = index;
    const $clone = $elem.cloneNode(true);
    const [{ el, words }] = splitting({ target: $clone, by: 'words' });
    el.setAttribute('slot', '_display');
    this.appendChild(el); // make append element option
    el.style.position = 'absolute';
    const nodes = words.map(($word) => {
      const { width } = $word.getBoundingClientRect();
      return { characters: $word.textContent.length, width }
    });
    el.remove();
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

  _parseValue(value) {
    const index = Math.floor(value);
    return {
      index,
      progress: parseFloat(value) - index
    };
  }

  _display() {
    // fire on transition end
    const { index, progress } = this._parseValue(this.value);
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
    const { index, progress } = this._parseValue(this.value);
    if (!Array.isArray(this._redactions)) return;
    this._reset();
    this._$display.addEventListener('transitionend', this._transition);

    this.style.setProperty('--progress', progress.toFixed(3));

    this._redactions.forEach(($span, i) => {
      const { start = 0, end = 0 } = this._widths[i][index];
      $span.style.setProperty('width', `calc(${start}px - ((${start}px - ${end}px) * var(--progress, 0)))`);
      $span.style.removeProperty('margin-inline-start');
      if (!start) $span.style.setProperty('margin-inline-start', `calc((var(--space, .55ch) * -1) * (1 - var(--progress, 0)))`);
      if (!end) $span.style.setProperty('margin-inline-start', `calc((var(--space, .55ch) * -1))`);
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
    return parseFloat(this.getAttribute('max'), 10) || 0;
  }

  set max(newVal) {
    if (!isNaN(newVal)) {
      this.setAttribute('max', newVal);
    } else {
      this.removeAttribute('max');
    }
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