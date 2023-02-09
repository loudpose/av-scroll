# AV scroll

Smooth scrolling paired with horizontal scroll.

## Overview

> ALPHA version ⚠️ Still In Development: works on mobile, works on desktop. Don't try to rescale from mobile to desktop or vice-versa.

```sh
npm install av-scroll
```

### Basic

#### CSS

Add the base styles to your CSS file.

[`avscroll.css`](avscroll.css)

#### JS

When calling new AvScroll, you have to add an object that contains: elements.wrapper, lerp, links. An example can be found below. All other methods are optional.

```
import AvScroll from 'AvScroll';

new AvScroll({
  elements: {
    wrapper: document.querySelector('.page__container');,
  },
  lerp: {
    default: 0.1,
    modified: 0.04,
  },
  links: {
    default: true,
  },
});
```

## Adding Horizontal Scrolling

First, you need to create your horizontal section, and add content to it. Make sure that the section is wide enough.

Make sure that there's some spacing between two horizontal sections. Adding two horizontal sections in a row might cause bugs, but you can experiment with it.

Use the threshold to trigger adjust the time section gets inFocus. Threshold of 1 is your entire viewport, 0.5 half of the viewport. Like in the intersectionObserver.

### There are two options to add horizontal scroll.

#### 1. On initialization

Simply paste the horizontal object like in the example below:

```
new AvScroll({
  elements: {
    wrapper: document.querySelector('.page__container');,
  },
  horizontal: ['.gallery', '.gallery2'],
  lerp: {
    default: 0.1,
    modified: 0.04,
  },
  links: {
    default: true,
  },
});

You can add strings '.gallery' or paste already selected div (with document.querySelector or whatever)

```

#### 2. Via function

Call the addHorizontal() function on the AvScroll instance. It will add instance. This method there in case you want to make this dynamic. It will recalculate the total height and everything automatically.

```
const avScroll = new AvScroll({...});

avScroll.addHorizontal('.gallery');

```

## Commands

### debug mode

Enables debug window where scroll progress, inFocus, breakpoints, and other features can be tracked. Enabling debug mode, also enables the console log.

```
const avScroll = new AvScroll({
  elements: {
    wrapper: document.querySelector('.page__container');,
  debug: true,
  ...
});

```

### lerp

The amount of linear interpolation. The smaller the value, the smoother it scrolls.

```
const avScroll = new AvScroll({
	elements: {
    wrapper: document.querySelector('.page__container');,
  },
	lerp: {
    default: 0.1,
    modified: 0.04,
  },
	...
});

default - used on scroll
modified - use when clicking links

```

### links

If default: true - adds ALL 'a' tag elements on your entire website.
If you want to control what gets selected, you can specify an array of links instead.

```
const avScroll = new AvScroll({
  elements: {
    wrapper: document.querySelector('.page__container');,
  },
  links: {
    // default: true, // default value
    default: [
      document.querySelectorAll('.vgallery a')[0],
      document.getElementById('link2hor'),
      document.getElementById('link2last'),
    ],
  },
  ...
});

```

### mobile breakpoints

I suggest disabling the scroller on mobile, otherwise, it will cause lag on weak devices. You can do that by specifying the breakpoint. Default breakpoint is set to 768px.

To keep smooth scroll on mobile, set the breakpoint to 0.

> ALPHA 0.0.2-a ⚠️ as of now, rescaling the window in the browser from desktop to mobile can cause some issues. Either keep breakpoint at 0, or hope that your site visitor won't begin rescaling it weirdly.

```
const avScroll = new AvScroll({
  elements: {
    wrapper: document.querySelector('.page__container');,
  },
  mobile: {
    breakpoint: 768,
  },
  ...
});

```

### Examples for all commands

```
new AvScroll({
  elements: {
    wrapper: document.querySelector('.content__wrapper'),
  },
  horizontal: ['.gallery', '.gallery2'],
  mobile: {
    breakpoint: 768,
  },
  threshold: 1,
  debug: false,
  lerp: {
    default: 0.1,
    modified: 0.04,
  },
  links: {
    default: true, // picks all 'a' elements
    // picks an array with elements (querySelector or getElementById!)
		// default: [
    //   document.querySelectorAll('.vgallery a')[0],
    //   document.getElementById('link2hor'),
    //   document.getElementById('link2last'),
    // ],
  },
});
```

## GSAP

### GSAP ScrollerProxy

The scrollProxy is already added to the package and is done automatically, meaning that it works with GSAP Scroll Trigger out of the box. Just make sure to put avScroll before any GSAP tweens.

## Update History

> 2023-01-15 | 0.0.1-a initial release
> 2023-02-09 | 0.0.2-a horizontal scrolling, basic mobile breakpoints, touch support, bug fixes

## Misc

Follow Averyano: [Twitter](http://www.twitter.com/loudpose), [GitHub](https://github.com/loudpose), [Instagram](https://www.instagram.com/loudpose/)

## License

[MIT](LICENSE)

by [Averyano](https://averyano.com/)
