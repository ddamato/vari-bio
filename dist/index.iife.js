(function () {
  'use strict';

  var html = "<slot id=\"bios\"><!-- used for user input --></slot>\n<div id=\"display\"></div>\n<slot name=\"_display\"></slot>\n";

  var css_248z = ":host {\n  box-sizing: border-box;\n  display: grid;\n  grid-template-columns: 1fr;\n  overflow: hidden;\n}\n\n#display {\n  box-sizing: border-box;\n  display: flex;\n  flex-wrap: wrap;\n  grid-area: 1 / 1 / -1 / -1;\n  align-content: start;\n  align-items: center;\n  column-gap: var(--space, .55ch);\n  row-gap: var(--leading, .14ex);\n  transition: var(--duration, 0) ease;\n}\n\n#display span {\n  box-sizing: border-box;\n  background: var(--background);\n  height: var(--height, 3ex);\n  border-radius: var(--radius);\n  transition: var(--duration, 0) ease;\n}\n\n:host([debug]) #display {\n  filter: opacity(20%);\n}\n\n::slotted(*) {\n  grid-area: 1 / 1 / -1 / -1;\n  opacity: 0;\n}\n";

  function Splitting () {
    var u = document,
      l = u.createTextNode.bind(u);
    function d(n, t, e) {
      n.style.setProperty(t, e);
    }
    function f(n, t) {
      return n.appendChild(t);
    }
    function p(n, t, e, r) {
      var i = u.createElement("span");
      return (
        t && (i.className = t),
        e && (!r && i.setAttribute("data-" + t, e), (i.textContent = e)),
        (n && f(n, i)) || i
      );
    }
    function h(n, t) {
      return n.getAttribute("data-" + t);
    }
    function m(n, t) {
      return n && 0 != n.length
        ? n.nodeName
          ? [n]
          : [].slice.call(n[0].nodeName ? n : (t || u).querySelectorAll(n))
        : [];
    }
    function o(n) {
      for (var t = []; n--; ) t[n] = [];
      return t;
    }
    function g(n, t) {
      n && n.some(t);
    }
    function c(t) {
      return function (n) {
        return t[n];
      };
    }
    var a = {};
    function n(n, t, e, r) {
      return { by: n, depends: t, key: e, split: r };
    }
    function e(n) {
      return (function t(e, n, r) {
        var i = r.indexOf(e);
        if (-1 == i)
          r.unshift(e),
            g(a[e].depends, function (n) {
              t(n, e, r);
            });
        else {
          var u = r.indexOf(n);
          r.splice(i, 1), r.splice(u, 0, e);
        }
        return r;
      })(n, 0, []).map(c(a));
    }
    function t(n) {
      a[n.by] = n;
    }
    function v(n, r, i, u, o) {
      n.normalize();
      var c = [],
        a = document.createDocumentFragment();
      u && c.push(n.previousSibling);
      var s = [];
      return (
        m(n.childNodes).some(function (n) {
          if (!n.tagName || n.hasChildNodes()) {
            if (n.childNodes && n.childNodes.length)
              return s.push(n), void c.push.apply(c, v(n, r, i, u, o));
            var t = n.wholeText || "",
              e = t.trim();
            e.length &&
              (" " === t[0] && s.push(l(" ")),
              g(e.split(i), function (n, t) {
                t && o && s.push(p(a, "whitespace", " ", o));
                var e = p(a, r, n);
                c.push(e), s.push(e);
              }),
              " " === t[t.length - 1] && s.push(l(" ")));
          } else s.push(n);
        }),
        g(s, function (n) {
          f(a, n);
        }),
        (n.innerHTML = ""),
        f(n, a),
        c
      );
    }
    var s = 0;
    var i = "words",
      r = n(i, s, "word", function (n) {
        return v(n, "word", /\s+/, 0, 1);
      }),
      y = "chars",
      w = n(y, [i], "char", function (n, e, t) {
        var r = [];
        return (
          g(t[i], function (n, t) {
            r.push.apply(r, v(n, "char", "", e.whitespace && t));
          }),
          r
        );
      });
    function b(t) {
      var f = (t = t || {}).key;
      return m(t.target || "[data-splitting]").map(function (a) {
        var s = a["🍌"];
        if (!t.force && s) return s;
        s = a["🍌"] = { el: a };
        var n = e(t.by || h(a, "splitting") || y),
          l = (function (n, t) {
            for (var e in t) n[e] = t[e];
            return n;
          })({}, t);
        return (
          g(n, function (n) {
            if (n.split) {
              var t = n.by,
                e = (f ? "-" + f : "") + n.key,
                r = n.split(a, l, s);
              e &&
                ((i = a),
                (c = (o = "--" + e) + "-index"),
                g((u = r), function (n, t) {
                  Array.isArray(n)
                    ? g(n, function (n) {
                        d(n, c, t);
                      })
                    : d(n, c, t);
                }),
                d(i, o + "-total", u.length)),
                (s[t] = r),
                a.classList.add(t);
            }
            var i, u, o, c;
          }),
          a.classList.add("splitting"),
          s
        );
      });
    }
    function N(n, t, e) {
      var r = m(t.matching || n.children, n),
        i = {};
      return (
        g(r, function (n) {
          var t = Math.round(n[e]);
          (i[t] || (i[t] = [])).push(n);
        }),
        Object.keys(i).map(Number).sort(x).map(c(i))
      );
    }
    function x(n, t) {
      return n - t;
    }
    (b.html = function (n) {
      var t = ((n = n || {}).target = p());
      return (t.innerHTML = n.content), b(n), t.outerHTML;
    }),
      (b.add = t);
    var T = n("lines", [i], "line", function (n, t, e) {
        return N(n, { matching: e[i] }, "offsetTop");
      }),
      L = n("items", s, "item", function (n, t) {
        return m(t.matching || n.children, n);
      }),
      k = n("rows", s, "row", function (n, t) {
        return N(n, t, "offsetTop");
      }),
      A = n("cols", s, "col", function (n, t) {
        return N(n, t, "offsetLeft");
      }),
      C = n("grid", ["rows", "cols"]),
      M = "layout",
      S = n(M, s, s, function (n, t) {
        var e = (t.rows = +(t.rows || h(n, "rows") || 1)),
          r = (t.columns = +(t.columns || h(n, "columns") || 1));
        if (
          ((t.image = t.image || h(n, "image") || n.currentSrc || n.src), t.image)
        ) {
          var i = m("img", n)[0];
          t.image = i && (i.currentSrc || i.src);
        }
        t.image && d(n, "background-image", "url(" + t.image + ")");
        for (var u = e * r, o = [], c = p(s, "cell-grid"); u--; ) {
          var a = p(c, "cell");
          p(a, "cell-inner"), o.push(a);
        }
        return f(n, c), o;
      }),
      H = n("cellRows", [M], "row", function (n, t, e) {
        var r = t.rows,
          i = o(r);
        return (
          g(e[M], function (n, t, e) {
            i[Math.floor(t / (e.length / r))].push(n);
          }),
          i
        );
      }),
      O = n("cellColumns", [M], "col", function (n, t, e) {
        var r = t.columns,
          i = o(r);
        return (
          g(e[M], function (n, t) {
            i[t % r].push(n);
          }),
          i
        );
      }),
      j = n("cells", ["cellRows", "cellColumns"], "cell", function (n, t, e) {
        return e[M];
      });
    return t(r), t(w), t(T), t(L), t(k), t(A), t(C), t(S), t(H), t(O), t(j), b;
  }

  const splitting = Splitting();

  class VariBio extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' }).innerHTML = `<style type="text/css">${css_248z}</style>${html}`;
      this._$bios = this.shadowRoot.getElementById('bios');
      this._$display = this.shadowRoot.getElementById('display');

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
      };
      const event = new CustomEvent('ready', { detail });
      this.dispatchEvent(event);
    }

    _markings(startingWidths) {
      const markings = startingWidths.map((arr) => {
        const $span = document.createElement('span');
        $span.dataset.trigger = arr.filter(({ start }) => Boolean(start)).length === arr.length;
        return this._$display.appendChild($span);
      });
      this._$display.querySelector('[data-trigger="true"]').addEventListener('transitionend', () => this._display());
      return markings;
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
      this.appendChild(el); // make append element option ??
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

})();
