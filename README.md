# [`<vari-bio/>`](https://ddamato.github.io/vari-bio/)

[![npm version](https://img.shields.io/npm/v/vari-bio.svg)](https://www.npmjs.com/package/vari-bio)

A native web-component which renders several bios and transitions between each.

## Install

The project is distributed as an [`IIFE`](https://developer.mozilla.org/en-US/docs/Glossary/IIFE), so the easiest way is to just create a script tag pointing to the export hosted on [unpkg](https://unpkg.com/).

```html
<script src="unpkg.com/vari-bio" defer></script>
```

However, you can also install the package and add the script through some build process.

```html
<script src="dist/vari-bio.iife.js" defer></script>
```

## Usage

Once the script is loaded, you can add the new component to a page.

```html
<vari-bio value="1">
  <p>Deep v cliche adaptogen butcher, plaid la croix ennui williamsburg prism viral.</p>
  <p>Selfies ethical hell of <a href="#">asymmetrical</a> jawn pok pok copper mug humblebrag health goth normcore microdosing. Austin la croix grailed raclette farm to table man bun authentic coloring book church key.</p>
  <p>Craft beer vibecession hella mumblecore, fixie meggings butcher solarpunk bicycle rights tilde sus. Fingerstache 3 wolf moon authentic, <a href="#">post ironic marxism</a> before they sold out iPhone activated charcoal wolf kickstarter plaid.</p>
  <p>Mustache ramps salvia truffaut wolf cornhole asymmetrical occupy venmo.</p>
</vari-bio>
```

The content within the component should be several elements of content. A few points of note:

- If you are using `<p/>` elements (or any elements that include margin), it is recommended to remove that margin.
- If your content includes hyphens (`-`), it is recommended to replace with a "[Non-breaking hyphen](https://en.wikipedia.org/wiki/Wikipedia:Non-breaking_hyphen)" (`‑`) so the width calculations do not attempt to break into separate lines.
- In order to progressively enhance the component, consider setting the opacity to `0` for elements that should not be shown while the component loads. This could be all of the content or a single paragraph.

```css
vari-bio > :not(:first-child) {
  opacity: 0; /* Only show the first paragraph of content before the component loads */
}
```

After the component loads, it will begin to control the opacity values for the paragraphs.

### Ready

The component will fire a `ready` event when the content has been processed. It will also have `ready = true`.

```js
const $bio = document.querySelector('vari-bio');
$bio.addEventListener('ready', function ({ detail }) {
  const { 
    value, // current value
    max, // maximum value
  } = detail;
  console.log($bio.ready) // true
});
```

The `detail` is given as a convenience for wiring to a `<input type="range"/>`.

```js
const $slider = document.querySelector('input[type="range"]');
function ready({ detail }) {
  // Assign the value and max from component to the slider
  Object.assign($slider, detail);
  // During the slide, pipe the value directly to the component
  $slider.addEventListener('input', () => this.value = $slider.value);
  // At the end of the slide, set the closest whole number to component and slider
  $slider.addEventListener('change', () => {
    this.value = $slider.value = Math.min(Math.round($slider.value), $slider.max);
  });
};

const $bio = document.querySelector('vari-bio');
$bio.addEventListener('ready', ready);
```

At this point, providing a float to `value` will show redactions to the given text. The decimal part of the value is the amount of progress between content indices to show.

For example, having four paragraphs of content will set a `max` (index) of `3`. A `value` of `2.5` will render the redaction transition halfway between the 3rd and 4th paragraph. The order of the paragraphs is by number of words.

The paragraph will only be shown when the floating point number is a whole number; an index. Otherwise, a redaction transitional state is shown.

## Attributes

| Name | Description |
| ---- | ----------- |
| `value` | A float between `0` and the `max` where the whole number part is the index of content to show and the decimal part describes the amount of progress to the next index. |
| `debug` | When this boolean attribute is provided, the redactions will not fully disappear on whole number values. This is used for properly setting the CSS custom properties to position and size correctly. |

The `--vari-bio-progress` style property will automatically be updated based on the value, able to be used in customizing styles.

## Customizing

Font styles are inherited from the components' ancestors. Changing the font attributes is as simple as changing them on the containing element or higher up.

You may update the following properties to adjust the look of the redactions.

| Property | Description |
| -------- | ----------- |
| `--vari-bio-background` | The shorthand `background` of the redaction marks. |
| `--vari-bio-radius` | The shorthand `border-radius` of the redaction marks. |
| `--vari-bio-height` | The `height` of the redaction marks. |
| `--vari-bio-leading` | The vertical space between the redaction marks. |
| `--vari-bio-space` | The horizontal space of the redaction marks. |
| `--vari-bio-duration` | The transition duration between redactions. |

## Inspiration

I've seen a few examples of personal websites (most recently from [Jason Lengstorf](https://jason.energy/)) where their bio is a variable length. I like this idea for when folks might ask me for a little blurb about myself but not know how much they might want. This becomes a self-service component to provide just the right amount of content for a person's needs. I thought it would be interesting to animate between the different size bios. Perhaps this is less challenging with [View Transitions](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)?
