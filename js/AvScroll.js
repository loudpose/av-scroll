/* Rules Horizontal scroll (applied automatically, no need to actually add this)
#1 Element that we transform is positioned inside div ('.content')
#2 .content div has translateZ(0) and height 100vh
#3 element has 'display: flex' with 'align-items: flex-start'
#4 everything else (images, texts, etc-etc) is inside this element
Structure: .content > .gallery > ...items
*/

/* eslint-disable no-unused-vars */
// import normalizeWheel from 'normalize-wheel';
import Prefix from 'prefix';
import HorizontalInstance from './HorizontalInstance';

export default class AvScroll {
  constructor({ elements, styles, horizontal, mobile }) {
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
        this.mobileBreakpoint = mobile.breakpoint * 1;
      }
    }

    document.body.classList.add('avs');
    this.elements.wrapper.classList.add('avscroll');

    this.inFocus = null;
    this.isDisabled = false;

    this.windowSize = window.innerHeight - this.scrollbarHeight;

    this.lerp = {
      current: 0.1,
      default: 0.1,
      modified: 0.04,
    };
    this.transformPrefix = Prefix('transform');

    // this.debug = {
    //   d1: document.getElementById('d1'),
    //   d2: document.getElementById('d2'),
    //   d3: document.getElementById('d3'),
    // };

    this.timeout;

    if (this.elements.scrollbar !== false) this.createScrollbar();

    this.initScroll();
    this.addEventListeners();
    this.onResize();
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

  initHorizontal() {
    console.log(this.horizontalInit);
    this.horizontalInit.forEach((el) => {
      this.addHorizontal(el);
    });
    console.log(this.horizontal);
  }

  createScrollbar() {
    const html = `<div class="scrollbar"><div class="scrollbar__element"></div></div>`;
    document.body.insertAdjacentHTML('afterbegin', html);
    this.elements.scrollbar = document.querySelector('.scrollbar__element');
    this.scrollbarPressed = false;
    this.scrollbarHeight = 86; // 86px stands for the scrollbar height & margin
  }

  createHorizontalScroll() {
    // 1. Total scroll length = pageContainer.height + forEach(HorizontalSection.width)
    // 2. If HorizontalSection in focus == true
    // TranslateY disabled // TranslateX enabled
    // 2.1 Additionally, add snapping to section for overscroll situation
    // 3. When reached the Horizontal Section end unfocus, enable translateY
    // 3.1 Additionally, add additional 100-300px of scrolling to keep section on screen for sometime
    // scroll. target & current stay for main wrapper
    // each horizontal needs to have their own scroller
    // Scroller Logic
    // content.top - this.scroll.current on main Y === content.inFocus
    // content.width - this.scroll.current on main X === !content.inFocus
    // Snap Logic
    // ?
  }

  recalculateScrollLength() {
    this.scrolTotal.limit = 0;
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
  }

  scrollTo(position) {
    this.toPosition = {
      value: position,
      direction: this.scrollTotal.current < position ? 'down' : 'up',
    };
    this.isDisabled = true;

    this.lerp.current = this.lerp.modified;
    this.scrollTotal.target = position;
  }

  // recalculateBreakpoints() {
  //   // Returns closest HorizontalInstance from this.horizontal using less than
  //   // Probably need another one using greater than
  //   if (this.horizontal.length > 1) {
  //     const getClosest = (data, target) => {
  //       data.reduce((acc, obj) =>
  //         Math.abs(target - obj.top) < Math.abs(target - acc.top) ? obj : acc
  //       );
  //     };
  //   }
  //   // return getClosest(this.horizontal, this.scrollY.current);
  // }

  // Events
  onResize() {
    this.isResizing = true;
    if (this.elements.wrapper) {
      this.extra = 0;

      if (this.horizontal.length > 0) {
        this.breakpoints = [];
        this.horizontal.map((el) => {
          el.onResize();
          this.breakpoints.push({ y: el.top, el: el.element });
          this.extra += el.length;
        });

        this.breakpointsClosest = this.horizontal[0];
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
      }

      console.log('Total Limit', this.scrollTotal.limit);
    }

    this.windowSize = window.innerHeight - this.scrollbarHeight;

    this.modeBreakpoint = {
      width: window.innerWidth / 2,
      height: window.innerHeight / 2,
    };

    this.isResizing = false;
  }

  resetScroll() {
    this.isDisabled = false;
    this.lerp.current = this.lerp.default;
    this.scroll.target = this.scroll.current;
  }

  stopTimeout() {
    this.isScrolling = false;
  }

  onWheel({ pixelY }) {
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

  // Loop
  update() {
    if (this.isResizing) return;

    // if (this.inFocus)
    //   this.debug.d3.textContent = `Focus: ${this.inFocus.element.classList}`;

    // this.debug.d3.textContent = `T: ${this.scrollTotal.target}`; // debug
    // this.debug.d3.textContent = `Focus: ${this.scrollTotal.percent}`;
    // this.debug.d2.textContent = `X: ${this.scrollX.current.toFixed()}`; // debug
    // this.debug.d1.textContent = `Y: ${this.scrollY.current.toFixed()}`;

    if (this.breakpoints && !this.isResizing)
      this.breakpoints.map((bp, i) => {
        if (
          bp.y - window.innerHeight / 2 <= this.scrollY.current &&
          !bp.isDisabled
        ) {
          this.inFocus = this.horizontal[i];
          this.scrollX = this.inFocus.scrollX;
          this.breakpointsClosest = this.horizontal[i];
          return;
        }
      });

    if (
      this.isScrolling &&
      this.scrollMode === 'vertical' &&
      this.breakpointsClosest
    ) {
      this.updateY(this.breakpointsClosest);
    }

    if (
      this.isScrolling &&
      this.scrollMode === 'horizontal' &&
      this.breakpointsClosest
    ) {
      this.updateX(this.breakpointsClosest);
    }

    if (this.isScrolling) this.updateScrollPositions();

    this.updateDOM();
  }

  updateY(el) {
    if (
      this.direction === 'down' &&
      !el.isComplete &&
      !el.isDisabled &&
      el.top - this.modeBreakpoint.height <= this.scrollY.current
    ) {
      this.inFocus = el;

      this.scrollY.target = el.top;
      this.scrollMode = 'horizontal'; //prehorizontal

      this.scrollX = this.inFocus.scrollX;
    }

    if (
      this.direction === 'up' &&
      el.isComplete &&
      !el.isDisabled &&
      Math.abs(el.top - this.scrollY.current) <= this.modeBreakpoint.height
    ) {
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
      Math.abs(this.scrollX.current - this.inFocus.length) <=
        this.modeBreakpoint.width
    ) {
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
      this.scrollX.current <= this.modeBreakpoint.width
    ) {
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
    // this.scrollX.target = this.useClamp(this.scrollX);
    // this.scrollTotal.target = this.useClamp(this.scrollTotal);

    // this.scrollX.current = this.useLerp(this.scrollX);

    // if (this.inFocus) {
    //   this.inFocus.scrollX.current = this.scrollX.current;
    //   console.log(this.inFocus.scrollX.current);
    // }
    const scrX = this.horizontal.reduce(
      (acc, el) => acc + el.scrollX.current,
      0
    );

    this.scrollTotal.current = this.scrollY.current + scrX;
  }

  updateDOM() {
    if (this.elements.wrapper) {
      this.elements.wrapper.style[
        this.transformPrefix
      ] = `translateY(-${this.scrollY.current}px)`;
    }

    // if (this.inFocus) {
    //   this.inFocus.element.style[
    //     this.transformPrefix
    //   ] = `translateX(-${this.scrollX.current}px)`;
    // }
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
    }
  }

  removeEventListeners() {}

  // Scrollbar events
  scrollBarDown(e) {
    e.preventDefault();
    this.isScrolling = true;

    if (this.isDisabled) this.resetScroll();
    this.scrollbarBounds = this.elements.scrollbar.getBoundingClientRect();
    this.scrollbarPressed = true;
    this.grabStart = e.clientY - this.scrollbarBounds.top;
  }

  scrollBarMove(e) {
    if (!this.scrollbarPressed) return;

    this.isScrolling = true;

    const scrY = e.clientY - this.scrollbarBounds.top - this.grabStart;
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
