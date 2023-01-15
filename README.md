# AV scroll

Smooth scrolling paired with horizontal scroll.

## Overview

> ⚠️ In Development: not optimized for mobile devices yet! Might be hard to import. More updates soon.

```sh
npm install av-scroll
```

## Usage

### Basic

#### CSS

Add the base styles to your CSS file.

[`avscroll.css`](avscroll.css)

## Options

Adding elements.wrapper is necessary, everything else is optional.

```
import AvScroll from 'AvScroll';

this.avScroll = new AvScroll({
	elements: {
		wrapper: document.querySelector('.page__container'),
	},
	styles: {
		scrollbar: 'hidden',
	},
	horizontal: ['.gallery', '.projects', '.horizontal-section'],
	mobile: {
		breakpoint: 1024,
	},
});
```

## Function stack

You need to:

- call avScroll.update() on each frame.
- call avScroll.onResize() on 'resize' event.
- call avScroll.onWheel on 'wheel' event. Right now, the [normalize-wheel](https://www.npmjs.com/package/normalize-wheel) package is required.

```
update() {
	this.avScroll.update();

	requestAnimationFrame(this.update.bind(this));
}

onResize() {
	this.avScroll.onResize();
}

addEventListeners() {
	window.addEventListener('wheel', (e) => {
		const normalized = normalizeWheel(e);
		this.avScroll.onWheel(normalized);
	});

	function debounce(func) {
		let timer;
		return function (event) {
			if (timer) clearTimeout(timer);
			timer = setTimeout(func, 100, event);
		};
	}
	window.addEventListener('resize', debounce(this.onResize.bind(this)));
}
```

## GSAP ScrollerProxy

If you are using GSAP ScrollTrigger, then the ScrollerProxy is mandatory for best performance.

```
import GSAP from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
GSAP.registerPlugin(ScrollTrigger);

createScrollProxy() {
	const avScroll = this.avScroll;
	ScrollTrigger.scrollerProxy('.page__container', {
		scrollTop(value) {
			return arguments.length
				? avScroll.scrollTo(value, { duration: 0, disableLerp: true })
				: avScroll.scrollY.target;
		}, // we don't have to define a scrollLeft because we're only scrolling vertically.
		getBoundingClientRect() {
			return {
				top: 0,
				left: 0,
				width: window.innerWidth,
				height: window.innerHeight,
			};
		},

		pinType: document.querySelector('.page__container').style.transform
			? 'transform'
			: 'fixed',
	});

	ScrollTrigger.addEventListener('refresh', () => this.avScroll.update());
	ScrollTrigger.defaults({ scroller: '.avscroll' });

	ScrollTrigger.refresh();
}
```

## GSAP ScrollTrigger example

Creates new timeline. Moves element 200 by Y axis and sets opacity to 1.

```
this.timeline = GSAP.timeline();

this.timeline.from(this.verticalSection, {
	scrollTrigger: {
		scroller: this.pageContainer, //locomotive-scroll
		trigger: this.verticalSection,
		// markers: true,
		scrub: 1,
	},
	y: 200,
	autoAlpha: 0,
	ease: 'ease.out expo',
});
```

## Misc

Follow Averyano: [Twitter](http://www.twitter.com/loudpose), [GitHub](https://github.com/loudpose), [Instagram](https://www.instagram.com/loudpose/)

## License

[MIT](LICENSE)

by [Averyano](https://averyano.com/)
