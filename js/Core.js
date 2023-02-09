/* Rules Horizontal scroll:
#1 Element that we transform is positioned inside div ('.content')
#2 .content div has translateZ(0) and height 100vh
#3 element has 'display: flex' with 'align-items: flex-start'
#4 everything else (images, texts, etc-etc) is inside this element
Structure: .content > .gallery > ...items
*/

/* eslint-disable no-unused-vars */
import Prefix from 'prefix';
import HorizontalInstance from './HorizontalInstance';
import { each } from 'lodash';

export default class Core {
  constructor({
    elements,
    styles,
    horizontal,
    mobile,
    threshold,
    debug,
    lerp,
  }) {
    this.elements = {
      ...elements,
    };

    if (styles) {
      if (styles.scrollbar === 'hidden') {
        this.elements.scrollbar = false;
      }
    }

    if (horizontal) {
      this.horizontal = [];
      this.horizontalInit = horizontal;
    }

    if (mobile) {
      if (mobile.breakpoint) {
        this.mobileBreakpoint = mobile.breakpoint * 1 || 768;
      }
    }

    this.debug = debug || false;

    if (debug) this.createDebugWindow();

    document.body.classList.add('avs');
    this.elements.wrapper.classList.add('avscroll');

    this.breakpointThreshold = threshold || 1;
    this.inFocus = null;
    this.isDisabled = false;
    this.isScrolling = false;

    this.windowSize = window.innerHeight - this.scrollbarHeight;

    this.lerp = {
      default: lerp.default || 0.1,
      modified: lerp.modified || 0.04,
    };
    this.lerp.current = this.lerp.default;
    if (debug) console.log(`Lerp: `, this.lerp);

    this.transformPrefix = Prefix('transform');

    this.timeout;

    if (this.elements.scrollbar !== false) this.createScrollbar();

    this.initScroll();
    this.addEventListeners();
    this.onResize();
  }

  createDebugWindow() {
    const li = document.createElement('li');
    li.classList.add('avdebug');
    document.body.appendChild(li);

    this.d1 = document.createElement('ul');
    this.d1.textContent = 'X: Y:';
    li.appendChild(this.d1);

    this.d2 = document.createElement('ul');
    this.d2.textContent = 'X (all):';
    li.appendChild(this.d2);

    this.d3 = document.createElement('ul');
    this.d3.textContent = 'Total: | (%)';
    li.appendChild(this.d3);

    this.d4 = document.createElement('ul');
    this.d4.textContent = 'inFocus:';
    li.appendChild(this.d4);

    this.d5 = document.createElement('ul');
    this.d5.textContent = 'bpTarget:';
    li.appendChild(this.d5);

    this.d6 = document.createElement('ul');
    this.d6.textContent = `breakpoint: ${this.mobileBreakpoint}px`;
    li.appendChild(this.d6);

    this.d7 = document.createElement('ul');
    this.d7.textContent = `isScrolling: ${this.isScrolling}`;
    li.appendChild(this.d7);

    this.d8 = document.createElement('ul');
    this.d8.textContent = `isDisabled: ${this.isDisabled}`;
    li.appendChild(this.d8);

    this.d9 = document.createElement('ul');
    this.d9.textContent = `scrollMode: ${this.scrollMode}`;
    li.appendChild(this.d9);

    this.d10 = document.createElement('ul');
    this.d10.textContent = `scrollDir: ${this.direction}`;
    li.appendChild(this.d10);
  }

  initScroll() {
    this.scrollTotal = {
      current: 0,
      target: 0,
      last: 0,
      limit: 0,
      diff: 0,
      extra: 0,
    };

    this.scrollY = {
      current: 0,
      target: 0,
      last: 0,
      limit: 0,
      percent: 0,
    };

    this.scrollX = {
      current: 0,
      target: 0,
      last: 0,
      limit: 0,
      percent: 0,
    };

    this.scrollVirtual = {
      current: 0,
      target: 0,
      limit: 50,
    };

    this.isDown = false;
    this.touch = {
      x: {
        start: 0,
        end: 0,
      },
      y: {
        start: 0,
        end: 0,
      },
    };

    this.fps = {
      interval: 1000 / 24,
      then: Date.now(),
      now: Date.now(),
      elapsed: 0,
      frame: -1,
    };

    this.scrollTotal.percent = 0;

    this.modeBreakpoint = {
      width: window.innerWidth / 2,
      height: window.innerHeight / 2,
    };

    this.direction = 'down';

    this.scrollMode = 'vertical';
    if (this.elements.scrollbar)
      this.scrollbarBounds = this.elements.scrollbar.getBoundingClientRect();
    if (this.horizontalInit) this.initHorizontal();
  }

  /*
   **  ------
   **  HORIZONTAL
   **  ------
   */

  initHorizontal() {
    if (this.debug) console.log('initHorizontal()', this.horizontalInit);
    if (this.debug) console.log('* * * ');

    this.horizontalInit.map((el, i) => {
      if (this.debug) console.log('addHorizontal()', el);
      this.addHorizontal(el);
    });

    // Picks current inFocus element
    const minTop = this.horizontal.reduce((a, b) => Math.min(a.top, b.top)); // closest to the top
    const index = this.horizontal.findIndex((el) => el.top === minTop); // get the index
    this.inFocus = this.horizontal[index]; // assign
  }

  addHorizontal(e) {
    if (!e) return;
    if (!this.horizontal) this.horizontal = [];

    let element;
    if (element instanceof window.HTMLElement) {
      element = e;
    } else {
      element = document.querySelector(e);
    }

    if (this.horizontal.length > 0) {
      const locate = this.horizontal.find(
        (instance) => instance.element === element
      );

      if (this.debug && locate) {
        console.error(
          `addHorizontal() << the instance with class="${locate.element.classList}" already exists. Skipping.`
        );
        return;
      }
    }

    function insertAfter(referenceNode, newNode) {
      referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

    element.classList.add('av-c');
    element.parentElement.style[this.transformPrefix] = 'translateZ(0)';

    const parentContainer = document.createElement('div');
    parentContainer.classList.add('avcontent');

    insertAfter(element, parentContainer);
    parentContainer.append(element);

    const bounds = element.getBoundingClientRect();
    this.horizontal.push(new HorizontalInstance(element, bounds));
    this.onResize();
    if (this.debug) console.log('All Horizontals:', this.horizontal);
    if (this.debug) console.log('- - - - -');
  }

  /*
   **  ------
   **  LINKS & MOBILE
   **  ------
   */

  scrollTo(target) {
    // X, Y
    const x = target.dataset.avX * 1;
    const y = target.dataset.avY * 1;

    // Find direction
    this.direction = y < this.scrollY.current ? 'up' : 'down';
    if (this.debug)
      console.log(`Scrolling ${this.direction} to x(${x}) y(${y})`);

    // Smooth out
    this.isDisabled = true;
    this.isScrolling = true;
    this.lerp.current = this.lerp.modified;

    // Check all horizontal instances
    if (this.horizontal) {
      // Find inFocus and bpTarget
      const targetId = target.dataset.avId;
      const targetSelector = this.horizontal.find((el) => el.id === targetId);
      this.inFocus = this.breakpointsClosest = targetSelector;

      // Map Horizontals complete
      this.horizontal.map((el, i) => {
        if (target.dataset.avY > targetSelector.top) {
          el.scrollX.target = el.scrollX.current = el.scrollX.limit;
          el.isComplete = true;
          if (this.debug) console.log(`Horizontal id(${el.id}) Complete`);
        }
      });

      // Scroll Y
      this.scrollY.target += y;

      this.scrollTotal.target = target;

      // Scroll X when the target is on X
      if (!this.inFocus.isComplete && Math.abs(this.inFocus.top - y <= 100)) {
        this.scrollMode = 'horizontal';
        this.scrollX.target += x;
        this.inFocus.scrollX.target = x;
      }
    } else if (!this.horizontal || this.horizontal.length === 0) {
      this.scrollY.target += y;
      this.scrollTotal.target = y;
    }
  }

  addLink(selector) {
    let elements = selector instanceof Array ? [...selector] : selector;
    if (this.debug) console.log('Adding Links for: ', elements);
    each(elements, (link, i) => {
      if (!link) return;
      const href = link.href;
      const linkNaming = href.split('#')[1];
      if (!href || !linkNaming) return;

      // Target Element Config
      const target = document.getElementById(`${linkNaming}`);
      const bounds = target.getBoundingClientRect();

      const position = {
        y: bounds.top,
        x: window.innerWidth - bounds.left < 0 ? bounds.left : 0,
      };

      target.dataset.avY = position.y;
      target.dataset.avX = position.x;

      if (this.horizontal) {
        if (this.horizontal.length <= 1) {
          target.dataset.avT = this.horizontal[0].id;
        } else {
          const getClosest = (array, targetY) => {
            return array.reduce((acc, obj) => {
              return Math.abs(acc.top - targetY) < Math.abs(targetY - obj.top)
                ? acc
                : obj;
            });
          };

          const closest = getClosest(this.horizontal, position.y);
          if (this.debug) {
            console.log(`Link[${i}] to:`, closest);
            console.log('- - - - -');
          }
          target.dataset.avId = closest.id; // assign
        }
      }

      // Event listener
      link.addEventListener('click', (e) => {
        e.preventDefault();

        // Lock screen when navigating to the hero section

        if (this.mediaMobile) {
          const posY = target.getBoundingClientRect().y + window.pageYOffset;
          // this.scroll = {
          //   current: 0,
          //   target: 0,
          //   last: 0,
          //   limit: 1000,
          // };

          window.scrollTo({
            top: posY,
            behavior: 'smooth',
          });
        } else {
          this.scrollTo(target);
        }
      });
    });
  }
  checkMedia() {
    if (
      window.matchMedia(`(max-width: ${this.mobileBreakpoint}px)`).matches &&
      !this.mediaMobile
    ) {
      this.mediaMobile = true;

      document.querySelector('.avscroll').style.position = 'relative';
      document.querySelector('.avscroll').style.overflow = 'visible';
      document.querySelector('.avs').style.overflow = 'visible';

      // // mobile
      // window.scrollTo(0, this.scrollTotal.current);
      // this.scrollY.current = this.scrollY.target = 0;
      // this.scrollTotal.current = this.scrollTotal.target = 0;

      // this.isScrolling = false;
      // this.mediaMobile = true;
      // this.elements.wrapper.style[this.transformPrefix] = `translateY(0px)`;
    }

    if (
      !window.matchMedia(`(max-width: ${this.mobileBreakpoint}px)`).matches &&
      this.mediaMobile
    ) {
      this.mediaMobile = false;

      document.querySelector('.avscroll').style.position = 'fixed';
      document.querySelector('.avscroll').style.overflow = 'hidden';
      document.querySelector('.avs').style.overflow = 'hidden';
      // desktop

      // this.scrollTotal.current = this.scrollTotal.target = window.pageYOffset;
      // this.scrollY.current = this.scrollY.target == window.pageYOffset;
      // this.elements.wrapper.style[
      //   this.transformPrefix
      // ] = `translateY(-${this.scrollTotal.current}px)`;

      // window.scrollTo(0, 0);
    }

    if (this.debug) console.log(`Mobile: ${this.mediaMobile}`);
  }
  /*
   **  ------
   **  RESIZE
   **  ------
   */

  onResize() {
    this.isResizing = true;
    this.checkMedia();

    if (this.mediaMobile) {
      this.isResizing = false;
      return;
    }

    if (this.elements.wrapper) {
      this.extra = 0;

      if (this.horizontal && this.horizontal.length > 0) {
        this.horizontal.map((el) => {
          el.onResize();

          this.extra += el.length;
        });

        this.breakpointsClosest = this.inFocus || this.horizontal[0];
      }

      this.scrollY.limit =
        this.elements.wrapper.clientHeight - window.innerHeight;

      // for X scroll
      if (this.breakpointsClosest) {
        this.horizontal.map((el) => (el.top = el.top + this.scrollY.current));
        // this.breakpointsClosest.top =
        //   this.breakpointsClosest.top + this.scrollY.current;

        if (this.scrollMode === 'horizontal') {
          this.scrollY.current = this.scrollY.target =
            this.breakpointsClosest.top;
          this.scrollX.limit = this.breakpointsClosest.length;
          this.scrollX.current = this.scrollX.target =
            (this.scrollX.limit * this.scrollX.percent) / 100;
        }

        if (this.scrollMode === 'vertical') {
          this.scrollY.current = this.scrollY.target =
            (this.scrollY.limit * this.scrollY.percent) / 100;

          this.scrollX.limit = this.breakpointsClosest.length;

          this.scrollX.current = this.scrollX.target =
            (this.scrollX.limit * this.scrollX.percent) / 100;
        }

        this.scrollTotal.limit = this.extra + this.scrollY.limit;
        // We calculate it twice to display everything properly when you resize right on the horizontal section
        // this.breakpointsClosest.top =
        //   this.breakpointsClosest.top + this.scrollY.current;
      } else {
        this.scrollTotal.limit = this.scrollY.limit;
      }

      if (this.debug) {
        console.log('inFocus', this.inFocus);
        console.log('Total Limit', this.scrollTotal.limit);
      }
    }

    this.windowSize = window.innerHeight - this.scrollbarHeight;

    this.modeBreakpoint = {
      width: window.innerWidth / 2,
      height: window.innerHeight / 2,
    };

    if (this.mediaMobile) {
      const bounds = this.elements.wrapper.getBoundingClientRect();

      window.scrollTo(0, (bounds.height / 100) * this.scrollTotal.percent);
      this.elements.wrapper.style[this.transformPrefix] = `translateY(${0}px)`;

      if (this.horizontal) {
        this.horizontal.map((el) => {
          el.element.style[this.transformPrefix] = `translateX(${0}px)`;
        });
      }
      if (this.debug)
        console.log(
          `Scrolling to %(${this.scrollTotal.percent}) (${
            (bounds.height / 100) * this.scrollTotal.percent
          })px`
        );
    }

    this.isResizing = false;
  }

  resetScroll() {
    this.isDisabled = false;
    this.lerp.current = this.lerp.default;
    // this.scroll.target = this.scroll.current;
  }

  stopTimeout() {
    if (!this.isDisabled) this.isScrolling = false;
  }

  onWheel({ pixelY }) {
    if (this.mediaMobile) return;

    if (this.lerp.current !== this.lerp.default)
      this.lerp.current = this.lerp.default;

    this.isScrolling = true;
    this.direction = pixelY < 0 ? 'up' : 'down';

    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(this.stopTimeout.bind(this), 2000);

    if (this.isDisabled) this.resetScroll();

    if (this.scrollMode === 'vertical') {
      this.scrollY.target += pixelY;
      this.scrollTotal.target += pixelY;
    }

    if (this.scrollMode === 'horizontal') {
      this.scrollX.target += pixelY;
      this.scrollTotal.target += pixelY;
    }
  }

  onTouchDown(event) {
    this.isDown = true;
    // this.touch.x.start = event.touches
    //   ? event.touches[0].clientX
    //   : event.clientX;
    // this.touch.y.start = event.touches
    //   ? event.touches[0].clientY
    //   : event.clientY;
  }
  onTouchMove(event) {
    // this.fps.now = Date.now();
    // this.fps.elapsed = this.fps.now - this.fps.then;
    // if (this.fps.elapsed > this.fps.interval) {
    //   this.fps.then = this.fps.now - (this.fps.elapsed % this.fps.interval);
    //   const x = event.touches ? event.touches[0].clientX : event.clientX;
    //   const y = event.touches ? event.touches[0].clientY : event.clientY;
    //   this.touch.x.end = x;
    //   this.touch.y.end = y;
    //   const xDistance = this.touch.x.start - this.touch.x.end;
    //   const yDistance = this.touch.y.start - this.touch.y.end;
    //   this.direction = yDistance < 0 ? 'up' : 'down';
    //   this.isScrolling = true;
    //   if (this.scrollMode === 'vertical') {
    //     this.scrollY.target += yDistance / 25;
    //     this.scrollTotal.target += yDistance / 25;
    //   }
    //   if (this.scrollMode === 'horizontal') {
    //     this.scrollX.target += xDistance + yDistance / 25;
    //     this.scrollTotal.target += xDistance + yDistance / 25;
    //   }
    // }
  }
  onTouchUp(e) {
    this.isDown = false;
    // console.log(e);
  }
  /*
   **  ------
   **  LOOP
   **  ------
   */

  update() {
    if (this.isResizing) return;
    if (this.mediaMobile) {
      this.elements.wrapper.style[this.transformPrefix] = `translateY(${0}px)`;
      return;
    }

    // this.fps.now = Date.now();
    // this.fps.elapsed = this.fps.now - this.fps.then;

    // if (this.fps.elapsed > this.fps.interval) {
    //   this.fps.then = this.fps.now - (this.fps.elapsed % this.fps.interval);}
    // Some logging
    if (this.debug) {
      this.d7.textContent = `isScrolling: ${this.isScrolling}`;
      this.d8.textContent = `isDisabled: ${this.isDisabled}`;
      this.d9.textContent = `scrollMode: ${this.scrollMode}`;
      this.d10.textContent = `scrollDir: ${this.direction}`;
      if (this.inFocus)
        this.d4.textContent = `inFocus: ${this.inFocus.element.classList}`;
      this.d3.textContent = `Total: ${this.scrollTotal.current.toFixed()} | (${this.scrollTotal.percent.toFixed()}%)`;

      if (this.horizontal && this.horizontal.length > 0) {
        const arr = this.horizontal.map((el) => el.scrollX.current.toFixed());
        this.d2.textContent = `X (all): ${arr.join(', ')}`;
      }
      this.d1.textContent = `X: ${this.scrollX.current.toFixed()} Y: ${this.scrollY.current.toFixed()}`;
    }

    // Picks inFocus & breakpointsClosest
    if (this.horizontal && !this.isResizing)
      this.horizontal.map((bp, i) => {
        if (
          bp.top - window.innerHeight * this.breakpointThreshold <=
            this.scrollY.current &&
          !bp.isDisabled
        ) {
          this.inFocus = this.horizontal[i];
          this.scrollX = this.inFocus.scrollX;
          this.breakpointsClosest = this.horizontal[i];
          if (this.debug)
            this.d5.textContent = `bpTarget: ${this.breakpointsClosest.element.classList}`;

          return;
        }
      });

    // ScrollY
    if (
      this.isScrolling &&
      this.scrollMode === 'vertical' &&
      this.breakpointsClosest
    ) {
      this.updateY(this.breakpointsClosest);
    }

    // ScrollX
    if (
      this.isScrolling &&
      this.scrollMode === 'horizontal' &&
      this.breakpointsClosest
    ) {
      this.updateX(this.breakpointsClosest);
    }

    // Math
    if (this.isScrolling) this.updateScrollPositions();

    // DOM
    this.updateDOM();
  }

  updateY(el) {
    if (
      this.direction === 'down' &&
      !this.isDisabled &&
      !el.isComplete &&
      !el.isDisabled &&
      el.top - this.modeBreakpoint.height <= this.scrollY.current
    ) {
      if (this.debug) console.log(`* Horizontal Scrolling ${this.direction} *`);
      this.inFocus = el;

      this.scrollY.target = el.top;
      this.scrollMode = 'horizontal'; //prehorizontal

      this.scrollX = this.inFocus.scrollX;
    }

    if (
      this.direction === 'up' &&
      !this.isDisabled &&
      el.isComplete &&
      !el.isDisabled &&
      Math.abs(el.top - this.scrollY.current) <= this.modeBreakpoint.height
    ) {
      if (this.debug) console.log(`* Horizontal Scrolling ${this.direction} *`);
      this.inFocus = el;

      this.scrollY.target = el.top;
      this.scrollMode = 'horizontal'; //prehorizontal

      this.scrollX = {
        current: this.inFocus.length,
        target: this.inFocus.length,
        limit: this.inFocus.length,
      };

      if (Math.abs(el.top - this.scrollY.current) <= this.modeBreakpoint) {
        this.scrollMode = 'horizontal';
      }
    }

    this.scrollY.percent = (this.scrollY.current / this.scrollY.limit) * 100;
  }

  updateX() {
    if (
      this.direction === 'down' &&
      !this.isDisabled &&
      Math.abs(this.scrollX.current - this.inFocus.length) <=
        this.modeBreakpoint.width
    ) {
      if (this.debug) console.log(`* Vertical Scrolling ${this.direction} *`);
      this.scrollX.target = this.inFocus.length;
      this.scrollMode = 'vertical';

      this.inFocus.scrollX = this.scrollX;
      this.inFocus.Completed(true);

      // Picks current inFocus element index
      const index = this.horizontal.findIndex(
        (a) => a.element === this.inFocus.element
      );

      // Picks next inFocus element
      if (this.horizontal[index + 1]) {
        this.breakpointsClosest = this.horizontal[index + 1];
      }
    }

    if (
      this.direction === 'up' &&
      !this.isDisabled &&
      this.scrollX.current <= this.modeBreakpoint.width
    ) {
      if (this.debug) console.log(`* Vertical Scrolling ${this.direction} *`);
      this.inFocus.Completed(false);

      this.scrollX.target = 0;
      this.inFocus.scrollX.target = 0;
      this.scrollMode = 'vertical'; // prevertical
    }

    this.scrollX.percent = (this.scrollX.current / this.scrollX.limit) * 100;
  }

  updateScrollPositions() {
    this.scrollY.target = this.useClamp(this.scrollY);
    this.scrollY.current = this.useLerp(this.scrollY);

    if (this.horizontal) {
      this.horizontal.map((el) => {
        el.scrollX.target = this.useClamp(el.scrollX);
        el.scrollX.current = this.useLerp(el.scrollX);
      });
    }

    this.scrollTotal.target = this.useClamp(this.scrollTotal);

    let scrX = 0;
    if (this.horizontal) {
      scrX = this.horizontal.reduce((acc, el) => acc + el.scrollX.current, 0);
    }

    this.scrollTotal.current = this.scrollY.current + scrX;
  }

  updateDOM() {
    if (this.elements.wrapper) {
      this.elements.wrapper.style[
        this.transformPrefix
      ] = `translateY(-${this.scrollY.current}px)`;
    }

    if (this.horizontal) {
      this.horizontal.map((el) => {
        el.element.style[
          this.transformPrefix
        ] = `translateX(-${el.scrollX.current}px)`;
      });
    }

    if (this.elements.scrollbar && !this.isResizing) {
      this.scrollTotal.percent =
        (this.scrollTotal.current / this.scrollTotal.limit) * 100;

      this.elements.scrollbar.style[this.transformPrefix] = `translateY(${
        (this.windowSize / 100) * this.scrollTotal.percent
      }px)`;
    }
  }

  // Listeners
  addEventListeners() {
    if (this.elements.scrollbar) {
      this.elements.scrollbar.addEventListener('mousedown', (e) =>
        this.scrollBarDown(e)
      );
      window.addEventListener('mousemove', (e) => this.scrollBarMove(e));
      window.addEventListener('mouseup', this.scrollBarUp.bind(this));

      this.elements.scrollbar.addEventListener('touchstart', (e) =>
        this.scrollBarDown(e)
      );
      window.addEventListener('touchmove', (e) => this.scrollBarMove(e));
      window.addEventListener('touchend', this.scrollBarUp.bind(this));
    }
  }

  removeEventListeners() {}

  /*
   **  ------
   **  SCROLLBAR
   **  ------
   */

  createScrollbar() {
    const html = `<div class="scrollbar"><div class="scrollbar__element"></div></div>`;
    document.body.insertAdjacentHTML('afterbegin', html);
    this.elements.scrollbar = document.querySelector('.scrollbar__element');
    this.scrollbarPressed = false;
    this.scrollbarHeight = 86; // 86px stands for the scrollbar height & margin
  }

  // Scrollbar events
  scrollBarDown(e) {
    if (e.type === 'mousedown' || (e.type === 'touchstart' && e.cancelable))
      e.preventDefault();
    this.isScrolling = true;

    if (this.isDisabled) this.resetScroll();
    this.scrollbarBounds = this.elements.scrollbar.getBoundingClientRect();

    let clientY = 0;
    if (e.type === 'touchstart') {
      clientY = e.touches[0].clientY;
      console.log(clientY);
    } else {
      clientY = e.clientY;
    }
    this.grabStart = clientY - this.scrollbarBounds.top;
    this.scrollbarPressed = true;
  }

  scrollBarMove(e) {
    if (!this.scrollbarPressed) return;
    let clientY = 0;
    if (e.type === 'touchmove') {
      clientY = e.touches[0].clientY;
    } else {
      clientY = e.clientY;
    }
    this.isScrolling = true;

    const scrY = clientY - this.scrollbarBounds.top - this.grabStart;
    this.direction = scrY < 0 ? 'up' : 'down';

    if (this.scrollMode === 'vertical') {
      this.scrollY.target = this.scrollY.current + scrY * 2.5;
      this.scrollTotal.target = this.scrollTotal.current + scrY * 2.5;
    }

    if (this.scrollMode === 'horizontal') {
      this.scrollX.target = this.scrollX.current + scrY * 2.5;
      this.scrollTotal.target = this.scrollTotal.current + scrY * 2.5;
    }
  }

  scrollBarUp() {
    this.scrollbarPressed = false;
    this.scrollbarBounds = this.elements.scrollbar.getBoundingClientRect();

    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(this.stopTimeout.bind(this), 2000);
  }

  // Utils
  interpolate(a, b, n) {
    return (1 - n) * a + n * b;
  }

  clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
  }

  useClamp = (argument) => this.clamp(argument.target, 0, argument.limit);
  useLerp = (argument) => this.interpolate(argument.current, argument.target, this.lerp.current); // prettier-ignore

  // Destroy
  destroy() {
    this.removeEventListeners();
  }
}
