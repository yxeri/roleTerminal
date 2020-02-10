const BaseDialog = require('./BaseDialog');
const UserDialog = require('./UserDialog');
const elementCreator = require('../../../ElementCreator');
const userComposer = require('../../../data/composers/UserComposer');
const labelHandler = require('../../../labels/LabelHandler');

const ids = {
  CODE: 'code',
};

class FindUserByIdDialog extends BaseDialog {
  constructor({
    classes = [],
    elementId = `findByIdDialog-${Date.now()}`,
  }) {
    const upperText = [labelHandler.getLabel({ baseObject: 'FindUserByIdDialog', label: 'findUser' })];
    const inputs = [
      elementCreator.createInput({
        type: 'text',
        elementId: ids.CODE,
        maxLength: 10,
        placeholder: labelHandler.getLabel({ baseObject: 'FindUserByIdDialog', label: 'id' }),
      }),
    ];
    const lowerButtons = [
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'cancel' }),
        clickFuncs: {
          leftFunc: () => { this.removeFromView(); },
        },
      }),
      elementCreator.createButton({
        text: 'Find',
        clickFuncs: {
          leftFunc: () => {
            const code = this.getInputValue(ids.CODE);

            if (!code || code === '') {
              return;
            }

            userComposer.getUserByCode({
              code,
              callback: ({ error, data }) => {
                if (error) {
                  switch (error.type) {
                    case 'does not exist': {
                      this.updateLowerText({
                        text: [labelHandler.getLabel({ baseObject: 'FindUserByIdDialog', label: 'notFound' })],
                      });

                      return;
                    }
                    case 'not allowed': {
                      this.updateLowerText({
                        text: [labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'accessDenied' })],
                      });

                      return;
                    }
                    default: {
                      this.updateLowerText({
                        text: [labelHandler.getLabel({ baseObject: 'Error', label: 'General' })],
                      });

                      return;
                    }
                  }
                }

                const { objectId: userId } = data.user;
                const userDialog = new UserDialog({
                  identityId: userId,
                });

                userDialog.addToView({ element: this.getParentElement() });
                this.removeFromView();
              },
            });
          },
        },
      }),
    ];

    super({
      elementId,
      lowerButtons,
      inputs,
      upperText,
      classes: classes.concat(['FindByIdDialog']),
    });
  }
}

module.exports = FindUserByIdDialog;
