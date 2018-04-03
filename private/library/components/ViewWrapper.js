const BaseView = require('./views/BaseView');

const elementCreator = require('../ElementCreator');

class ViewWrapper extends BaseView {
  constructor({
    columns,
    classes = [],
  }) {
    super({
      elementId: `wrap${Date.now()}`,
      classes: classes.concat(['viewWrapper']),
    });

    columns.forEach((components) => {
      const container = elementCreator.createContainer({});

      components.forEach((object) => {
        const { title, component } = object;

        if (title) {
          container.appendChild(elementCreator.createSpan({
            spanType: 'h2',
            text: title,
          }));
        }

        component.addToView({ element: container });
      });

      this.element.appendChild(container);
    });
  }
}

module.exports = ViewWrapper;
