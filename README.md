# AV scroll

Smooth scrolling paired with horizontal scroll.

## Overview

> ⚠️ In Development: works on mobile, works on desktop. The transition from desktop to mobile is not working properly (if you rescale your screen past the breakpoint)

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

First, you need to create your horizontal section, and add content in there. Make sure that the section is wide enough. Twice the window.innerWidth should work fine.

Also, make sure that there's some spacing between two horizontal sections. Adding two horizontal sections in a row might cause bugs, but you can experiment with it. Lower the threshold to trigger it later. Threshold of 1 means that it will put the section in Focus a viewport before you actually reach it. If you set threshold to 0.5, it wil put it in Focus at 50% of viewport and so on.

### There are two options to add horizontal scroll.

#### 1. On initialization

Simply paste the horizontal object like this (you can use querySelector, or just strings of your class)

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
```

#### 2. Via function

Call the addHorizontal() functions on the AvScroll instance. It will recalculate the total height and everything automatically.

```
const avScroll = new AvScroll({...});

avScroll.addHorizontal('.gallery);

```

## Commands

### debug mode

Enables debugging and console logs. Could be useful if it's not working properly.

```
const avScroll = new AvScroll({
	elements: {
    wrapper: document.querySelector('.page__container');,
  },
	debug: true,
	...
});

```

### lerp

The amount of linear interpolation. The smaller the value, the smoother it scrolls. The default value is used for scrolling. The modified value is used when clicking on links.

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

```

### links

Which links does the scroll need to process. By default (default: true), adds ALL 'a' tag. You can specify an array of links

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

I suggest disabling the scroller on mobile, otherwise, it will cause lag on weak devices. You can do that by specifying the breakpoint (by default set to 768px)

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

avScroll.addHorizontal('.gallery);

```

### Default values and all commands

```
import AvScroll from './av-scroll/AvScroll';

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

If you add your ScrollTrigger instances before adding avScroll, they won't work. Always put your tweens after avScroll.

The scrollProxy is already added to the package and is done automatically, meaning that it works with GSAP Scroll Trigger out of the box.

### GSAP ScrollTrigger example

Creates new timeline. Moves element 200 by Y axis and sets opacity to 1. Scrub is high to keep it smooth.

```
this.timeline = GSAP.timeline();

this.timeline.from(this.verticalSection, {
	scrollTrigger: {
		scroller: this.pageContainer, //locomotive-scroll
		trigger: this.verticalSection,
		// markers: true,
		scrub: 5,
	},
	y: 200,
	autoAlpha: 0,
	ease: 'ease.out expo',
});
```

## Update History

> 2023-01-15 | 0.0.1-a initial release
> 2023-02-09 | 0.0.2-a horizontal scrolling, basic mobile breakpoints, touch support, bug fixes

## Misc

Follow Averyano: [Twitter](http://www.twitter.com/loudpose), [GitHub](https://github.com/loudpose), [Instagram](https://www.instagram.com/loudpose/)

## License

[MIT](LICENSE)

by [Averyano](https://averyano.com/)
