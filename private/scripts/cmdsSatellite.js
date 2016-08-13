/** @module */

const painter = require('./painter');
const layoutChanger = require('./layoutChanger');

/**
 * @static
 * @type {Object}
 */
const commands = {};

commands.central = {
  func: (phrases = []) => {
    const choice = phrases[0];
    const centralDiv = document.getElementById('central');

    switch (choice) {
      case 'on': {
        layoutChanger.splitView(true, centralDiv);
        painter.drawCanvas();
        painter.createCircle({
          objId: 's1',
          x: 40,
          y: 40,
          radius: 20,
          shouldStroke: true,
        });
        painter.createCircle({
          objId: 's2',
          x: 440,
          y: 40,
          radius: 20,
          shouldStroke: true,
        });
        painter.createCircle({
          objId: 's3',
          x: 40,
          y: 440,
          radius: 20,
          shouldStroke: true,
        });
        painter.createCircle({
          objId: 's4',
          x: 440,
          y: 440,
          radius: 20,
          shouldStroke: true,
        });
        painter.createCircle({
          objId: 'p1',
          x: 190,
          y: 190,
          radius: 20,
          shouldStroke: true,
          shouldFill: true,
        });
        painter.createCircle({
          objId: 'p2',
          x: 290,
          y: 190,
          radius: 20,
          shouldStroke: true,
          shouldFill: true,
        });
        painter.createCircle({
          objId: 'p3',
          x: 190,
          y: 290,
          radius: 20,
          shouldStroke: true,
          shouldFill: true,
        });
        painter.createCircle({
          objId: 'p4',
          x: 290,
          y: 290,
          radius: 20,
          shouldStroke: true,
          shouldFill: true,
        });

        painter.createLine({
          fromObjId: 's1',
          toObjId: 'p1',
        });
        painter.createLine({
          fromObjId: 's1',
          toObjId: 'p2',
        });
        painter.createLine({
          fromObjId: 's1',
          toObjId: 'p3',
        });
        painter.createLine({
          fromObjId: 's1',
          toObjId: 's2',
        });
        painter.createLine({
          fromObjId: 's1',
          toObjId: 's3',
        });

        painter.createLine({
          fromObjId: 's2',
          toObjId: 'p1',
        });
        painter.createLine({
          fromObjId: 's2',
          toObjId: 'p2',
        });
        painter.createLine({
          fromObjId: 's2',
          toObjId: 'p4',
        });
        painter.createLine({
          fromObjId: 's2',
          toObjId: 's4',
        });

        painter.createLine({
          fromObjId: 's3',
          toObjId: 'p1',
        });
        painter.createLine({
          fromObjId: 's3',
          toObjId: 'p3',
        });
        painter.createLine({
          fromObjId: 's3',
          toObjId: 'p4',
        });
        painter.createLine({
          fromObjId: 's3',
          toObjId: 's4',
        });

        painter.createLine({
          fromObjId: 's4',
          toObjId: 'p2',
        });
        painter.createLine({
          fromObjId: 's4',
          toObjId: 'p3',
        });
        painter.createLine({
          fromObjId: 's4',
          toObjId: 'p4',
        });

        break;
      }
      case 'off': {
        layoutChanger.splitView(false, centralDiv);

        break;
      }
      default: {
        break;
      }
    }
  },
  accessLevel: 1,
  visibility: 1,
  category: 'advanced',
  commandName: 'central',
};

module.exports = commands;
