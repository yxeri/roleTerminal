const BaseView = require('../BaseView');
const elementCreator = require('../../../ElementCreator');
const keyhandler = require('../../../KeyHandler');
const accessCentral = require('../../../AccessCentral');

const ids = {
  PICTURE: 'picture',
};

class InputArea extends BaseView {
  constructor({
    sendOnEnter,
    minimumAccessLevel,
    previewId = 'imagePreview-input',
    imageAccessLevel = accessCentral.AccessLevels.STANDARD,
    allowImages = false,
    classes = [],
    placeholder = '',
    shouldResize = true,
    triggerCallback = () => {},
    focusCallback = () => {},
    blurCallback = () => {},
    inputCallback = () => {},
  }) {
    super({
      minimumAccessLevel: minimumAccessLevel || accessCentral.AccessLevels.STANDARD,
      classes: classes.concat(['inputArea']),
      elementId: `inputArea-${Date.now()}`,
    });

    this.previewId = previewId;
    this.textArea = elementCreator.createInput({
      placeholder,
      type: 'text',
      multiLine: true,
    });
    this.isFocused = false;
    this.focusCallback = focusCallback;
    this.blurCallback = blurCallback;
    this.inputCallback = inputCallback;
    this.triggerCallback = triggerCallback;
    this.sendOnEnter = sendOnEnter;
    this.sendButton = elementCreator.createButton({
      text: 'Send',
      classes: ['sendButton'],
      clickFuncs: {
        leftFunc: () => {
          this.triggerCallback({ text: this.getSplitInputValue() });
        },
      },
    });
    this.imageInput = elementCreator.createImageInput({
      previewId,
      elementId: ids.PICTURE,
      inputName: 'picture',
      appendPreview: true,
    });

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

    const buttonContainer = elementCreator.createContainer({ classes: ['buttonContainer'] });

    if (allowImages) {
      buttonContainer.appendChild(this.imageInput);
    }

    accessCentral.addAccessElement({
      element: this.imageInput,
      minimumAccessLevel: imageAccessLevel,
    });

    this.element.appendChild(buttonContainer);
    this.element.appendChild(this.textArea);
    this.element.appendChild(this.sendButton);
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
    const image = document.getElementById(this.previewId);

    image.classList.add('hide');
    image.removeAttribute('src');

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

  showView() {
    super.showView();

    this.setKeyListener();
  }

  hideView() {
    super.hideView();

    keyhandler.removeKey(13);
  }

  setInputValue({ value }) {
    this.textArea.value = value;
  }
}

module.exports = InputArea;
