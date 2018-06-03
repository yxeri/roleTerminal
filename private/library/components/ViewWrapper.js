const BaseView = require('./views/BaseView');

const elementCreator = require('../ElementCreator');

class ViewWrapper extends BaseView {
  constructor({
    topView,
    columns,
    title,
    classes = [],
  }) {
    super({
      elementId: `wrap${Date.now()}`,
      classes: classes.concat(['viewWrapper']),
    });

    this.columnAmount = columns.length;
    this.topView = topView;
    this.columns = columns;
    this.columnElements = [];
    this.title = title;
  }

  attachColumns() {
    const fragment = document.createDocumentFragment();

    this.columnElements.forEach(columnElement => columnElement.remove());
    this.columnElements = [];

    this.columns.forEach((column) => {
      const columnElement = this.createColumn({ column });

      this.columnElements.push(columnElement);
      fragment.appendChild(columnElement);
    });

    this.element.appendChild(fragment);
  }

  addToView({ element }) {
    if (this.topView) {
      this.topView.addToView({ element: this.element });
    }

    this.attachColumns();

    super.addToView({ element });
  }

  createColumn({ column }) {
    const { components, classes: columnClasses = [] } = column;

    const containerClasses = ['column'].concat(columnClasses);

    if (this.columnAmount === 2) {
      containerClasses.push('oneOfTwo');
    } else if (this.columnAmount === 3) {
      containerClasses.push('oneOfThree');
    } else {
      containerClasses.push('one');
    }

    if (this.topView) {
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

    return container;
  }

  replaceColumn({ column, replaceIndex }) {
    let index = replaceIndex;

    this.columns[index].components.forEach((object) => {
      const { component } = object;

      component.removeFromView();
    });

    if (this.topView) { index += 1; }

    this.element.replaceChild(this.createColumn({ column }), this.element.childNodes[index]);
  }

  getTitle() {
    return this.title || '-----';
  }
}

module.exports = ViewWrapper;
