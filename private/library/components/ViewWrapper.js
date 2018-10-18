const BaseView = require('./views/BaseView');

const elementCreator = require('../ElementCreator');
const eventCentral = require('../EventCentral');
const viewSwitcher = require('../ViewSwitcher');

class ViewWrapper extends BaseView {
  constructor({
    statusBar,
    title,
    viewType,
    useDefaultCss = true,
    columns = [],
    classes = [],
  }) {
    const cssClasses = classes;

    if (useDefaultCss) {
      cssClasses.push('viewWrapper');
    }

    super({
      elementId: `wrap${Date.now()}`,
      classes: cssClasses,
    });

    this.viewType = viewType;
    this.columnAmount = columns.length;
    this.statusBar = statusBar;
    this.columns = columns;
    this.columnElements = [];
    this.title = title;

    eventCentral.addWatcher({
      event: eventCentral.Events.TRY_VIEW_SWITCH,
      func: ({ type }) => {
        if (type === this.viewType) {
          viewSwitcher.switchView({ view: this });
        }
      },
    });
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
    if (this.statusBar) {
      this.statusBar.addToView({ element: this.element });
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

    if (this.statusBar) {
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

    if (this.statusBar) { index += 1; }

    this.element.replaceChild(this.createColumn({ column }), this.element.childNodes[index]);
  }

  getTitle() {
    return this.title || '-----';
  }
}

module.exports = ViewWrapper;
