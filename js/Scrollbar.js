export default class Scrollbar {
  constructor() {
    this.create();
    this.addEventListeners();
  }

  create() {
    const html = `<div class="scrollbar"><div class="scrollbar__element"></div></div>`;
    document.body.insertAdjacentHTML('afterbegin', html);
    this.elements.scrollbar = document.querySelector('.scrollbar__element');
    this.scrollbarPressed = false;
    this.scrollbarHeight = 86; // 86px stands for the scrollbar height & margin
  }

  addEventListeners() {
    this.elements.scrollbar.addEventListener('mousedown', (e) =>
      this.scrollBarDown(e)
    );
    window.addEventListener('mousemove', (e) => this.scrollBarMove(e));
    window.addEventListener('mouseup', this.scrollBarUp.bind(this));
  }
}
