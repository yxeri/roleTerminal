const BaseView = require('../BaseView');
const elementCreator = require('../../../ElementCreator');
const keyhandler = require('../../../KeyHandler');

class InputArea extends BaseView {
  constructor({
    sendOnEnter,
    classes = [],
    placeholder = '',
    shouldResize = true,
    triggerCallback = () => {},
    focusCallback = () => {},
    blurCallback = () => {},
    inputCallback = () => {},
  }) {
    super({
      classes: classes.concat(['inputArea']),
      elementId: `inputArea-${Date.now()}`,
    });

    this.textArea = elementCreator.createInput({
      placeholder,
      type: 'text',
      multiLine: true,
    });
    this.isFocused = false;

    this.textArea.addEventListener('focus', () => {
      this.isFocused = true;
      this.textArea.classList.add('focused');

      focusCallback();
    });
    this.textArea.addEventListener('blur', () => {
      this.isFocused = false;
      this.textArea.classList.remove('focused');

      blurCallback();
    });
    this.textArea.addEventListener('input', () => {
      if (shouldResize) {
        this.resizeInput();
      }

      inputCallback(this.getInputValue());
    });

    this.element.appendChild(this.textArea);
  }

  resizeInput() {
    this.textArea.style.height = 'auto';
    this.textArea.style.height = `${this.textArea.scrollHeight}px`;
  }

  getInputValue() {
    return `${this.textArea.value}`;
  }

  getSplitInputValue() {
    return `${this.textArea.value}`.split('\n');
  }

  clearInput() {
    this.textArea.value = '';

    this.resizeInput();
  }

  setKeyListener() {
    keyhandler.addKey(13, () => {
      if (this.isFocused) {
        this.triggerCallback({ text: this.getSplitInputValue() });
      }
    }, this.sendOnEnter);
  }

}

module.exports = InputArea;
