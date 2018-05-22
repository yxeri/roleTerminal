const BaseView = require('./views/BaseView');

const elementCreator = require('../ElementCreator');

class ViewWrapper extends BaseView {
  constructor({
    topRow,
    columns,
    classes = [],
  }) {
    super({
      elementId: `wrap${Date.now()}`,
      classes: classes.concat(['viewWrapper']),
    });

    if (topRow) {
      this.element.appendChild(topRow);
    }

    const columnAmount = columns.length;

    columns.forEach(({ components, classes: columnClasses = [] }) => {
      const containerClasses = ['column'].concat(columnClasses);

      if (columnAmount === 2) {
        containerClasses.push('oneOfTwo');
      } else if (columnAmount === 3) {
        containerClasses.push('oneOfThree');
      } else {
        containerClasses.push('one');
      }

      if (topRow) {
        containerClasses.push('withTopRow');
      }

      const container = elementCreator.createContainer({ classes: containerClasses });

      components.forEach((object) => {
        const {
          title,
          component,
        } = object;

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
