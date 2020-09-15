import elementCreator from '../../../ElementCreator';

const BaseView = require('../BaseView');
const keyhandler = require('../../../KeyHandler');
const accessCentral = require('../../../AccessCentral');

const ids = {
  PICTURE: 'picture',
};

class InputArea extends BaseView {
  constructor({
    corners,
    sendOnEnter,
    minimumAccessLevel,
    focusless = false,
    multiLine = true,
    previewId = 'imagePreview-input',
    imageAccessLevel = accessCentral.AccessLevels.STANDARD,
    allowImages = false,
    classes = [],
    placeholder = '',
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
      multiLine,
      shouldResize: true,
      type: 'text',
    });
    this.multiLine = multiLine;
    this.focusless = focusless;
    this.isFocused = false;
    this.focusCallback = focusCallback;
    this.blurCallback = blurCallback;
    this.inputCallback = inputCallback;
    this.triggerCallback = triggerCallback;
    this.sendOnEnter = sendOnEnter;
    this.sendButton = elementCreator.createButton({
      corners,
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
      image: {
        fileName: 'image.png',
        height: 20,
        width: 20,
      },
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

  getInputValue() {
    return `${this.textArea.value}`;
  }

  getSplitInputValue() {
    return `${this.textArea.value}`.split('\n');
  }

  clearInput() {
    const image = document.getElementById(this.previewId);

    if (image) {
      image.classList.add('hide');
      image.removeAttribute('src');
    }

    this.textArea.value = '';

    if (this.multiLine) {
      this.textArea.style.height = 'auto';
      this.textArea.style.height = `${this.textArea.scrollHeight}px`;
    }
  }

  setKeyListener() {
    keyhandler.addKey(13, () => {
      if (this.focusless || this.isFocused) {
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
