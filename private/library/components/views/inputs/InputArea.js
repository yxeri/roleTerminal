const BaseView = require('../BaseView');
const elementCreator = require('../../../ElementCreator');

class InputArea extends BaseView {
  constructor({
    placeholder = '',
  }) {
    super({});

    const textArea = elementCreator.createInput({
      placeholder,
      type: 'text',
      multiLine: true,
    });
  }
}

module.exports = InputArea;
