import normalizeWheel from 'normalize-wheel';
import Core from './Core';
import GSAP from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

GSAP.registerPlugin(ScrollTrigger);
export default class AvScroll {
  constructor(config) {
    if (!config.elements.wrapper) return;
    this.pageContainer = config.elements.wrapper;

    this.createScroll(config);

    this.addEventListeners();
    this.update();

    this.createScrollProxy(); // GSAP

    if (typeof config.links.default === 'boolean') {
      this.addLink(document.querySelectorAll('a'));
    } else {
      this.addLink(config.links.default);
    }

    // if (config.debug) this.createDebug();
    // this.createTimeline();
  }

  addLink(selector) {
    this.avScroll.addLink(selector);
  }

  createScroll(config) {
    this.avScroll = new Core(config);

    // this.avScroll.addHorizontal('.gallery');
  }

  createScrollProxy() {
    const avScroll = this.avScroll;
    ScrollTrigger.scrollerProxy(this.pageContainer, {
      scrollTop(value) {
        return avScroll.mediaMobile
          ? window.pageYOffset
          : avScroll.scrollTotal.current;
        return arguments.length
          ? avScroll.scrollTo(value, { duration: 0, disableLerp: true })
          : avScroll.scrollTotal.target;
      },
      // scrollLeft(value) {
      //   console.log(avScroll.scrollX.current);
      //   return avScroll.scrollX.current; // we don't have to define a scrollLeft because we're only scrolling vertically.
      // },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },

      pinType: document.querySelector('[data-scroll-container]').style.transform
        ? 'transform'
        : 'fixed',
    });

    ScrollTrigger.addEventListener('refresh', () => this.avScroll.update());
    ScrollTrigger.defaults({ scroller: '.avscroll' });

    ScrollTrigger.refresh();
  }

  update(frame) {
    this.avScroll.update();

    requestAnimationFrame(this.update.bind(this));
  }

  addEventListeners() {
    // scroll
    window.addEventListener('wheel', (e) => {
      const normalized = normalizeWheel(e);
      this.avScroll.onWheel(normalized);
    });

    // touch
    window.addEventListener('touchstart', (e) => this.avScroll.onTouchDown(e));
    window.addEventListener('touchmove', (e) => this.avScroll.onTouchMove(e));
    window.addEventListener('touchend', (e) => this.avScroll.onTouchUp(e));
    // Resize /w debounce
    function debounce(func) {
      let timer;
      return function (event) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(func, 100, event);
      };
    }

    window.addEventListener(
      'resize',
      debounce(() => {
        this.avScroll.onResize();
      })
    );
  }

  // lscroll.on('scroll', ScrollTrigger.update);
}
