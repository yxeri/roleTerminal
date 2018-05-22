const BaseView = require('../BaseView');

const elementCreator = require('../../../ElementCreator');

class BaseMenu extends BaseView {
  constructor({
    items: [],
    classes = [],
  }) {
    super({
      classes: classes.concat(['menu']),
      elementId: `menu-${Date.now()}`,
    });

    this.parentElement = parentElement;

    const menuList = elementCreator.createList({});

    items.forEach((item) => {
      const { clickFuncs } = item;

      menuList.appendChild(elementCreator.createListItem({
        clickFuncs,
        elementId,
      }));
    });
  }
}

module.exports = BaseMenu;
