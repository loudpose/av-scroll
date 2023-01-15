export default class HorizontalInstance {
  constructor(element, bounds) {
    this.element = element;
    this.bounds = bounds;
    this.width = this.bounds.width;
    this.height = this.bounds.height;
    this.top = this.bounds.top;
    if (this.top < 0) this.top = 0;
    this.length = this.width - window.innerWidth;
    this.element.dataset.scroll = length;

    this.isComplete = false;
    this.isDisabled = false;
    this.disableOnComplete = false;

    this.scrollX = {
      current: 0,
      target: 0,
      last: 0,
      percent: 0,
      limit: this.length,
    };
  }

  Completed(bool) {
    this.isComplete = bool;

    if (this.disableOnComplete) {
      this.isDisabled = true;
    }
  }

  onResize() {
    this.bounds = this.element.getBoundingClientRect();
    // console.log(this.element.offsetTop);
    this.width = this.bounds.width;
    this.height = this.bounds.height;
    this.top = this.bounds.top;
    this.length = this.width - window.innerWidth;
    this.element.dataset.scroll = length;
  }
}
