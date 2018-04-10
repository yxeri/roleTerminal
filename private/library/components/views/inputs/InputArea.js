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

    this.textArea.addEventListener('focus', () => {
      this.textArea.classList.add('focused');

      focusCallback();
    });
    this.textArea.addEventListener('blur', () => {
      this.textArea.classList.remove('focused');

      blurCallback();
    });
    this.textArea.addEventListener('input', () => {
      if (shouldResize) {
        this.resizeInput();
      }

      inputCallback(this.getInputValue());
    });

    if (sendOnEnter) {
      keyhandler.addKey(13, triggerCallback);
    }
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
}

module.exports = InputArea;
