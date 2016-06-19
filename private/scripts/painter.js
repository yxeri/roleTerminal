/** @module */

/**
 * @private
 * @type {CanvasRenderingContext2D}
 */
const context = (document.getElementById('canvas')).getContext('2d');
/**
 * @private
 * @type {HTMLElement}
 */
const paintArea = document.getElementById('central');

/**
 * @private
 * @type {Object}
 */
const objects = {};

/**
 * @private
 * @type {Number}
 */
const lineWidth = 2;

/**
 * @private
 */
function clearExisting(obj, type = '') {
  const padding = lineWidth * 2;

  if (obj) {
    switch (type) {
      case 'line': {
        // Lowest x coordinate value
        const x = (obj.from.x < obj.to.x ? obj.from.x : obj.to.x) - lineWidth;
        // Lowest y coordinate value
        const y = (obj.from.y < obj.to.y ? obj.from.y : obj.to.y) - lineWidth;
        // Difference between from and to x coordinates
        const width = Math.abs(obj.from.x - obj.to.x) + padding;
        // Difference between from and to y coordinates
        const height = Math.abs(obj.from.y - obj.to.y) + padding;

        // Rectangle that starts with the lowest x and y of the line and encompasses the highest x and y coordinates
        context.clearRect(x, y, width, height);

        break;
      }
      case 'circle': {
        const radius = obj.radius;

        // Arc x and y coordinates start in the middle of the circle. Calculating x, y, width and height based on that
        context.clearRect((obj.x - radius - lineWidth), (obj.y - radius - lineWidth), ((radius * 2) + padding), ((radius * 2) + padding));

        break;
      }
      default: {
        context.clearRect((obj.x - lineWidth), (obj.y - lineWidth), (obj.width + padding), (obj.height + padding));

        break;
      }
    }
  }
}

/**
 * @private
 */
function fillObject(obj) {
  context.fill(obj);
}

/**
 * @private
 */
function strokeObject(obj) {
  context.stroke(obj);
}

/**
 * @private
 */
function drawObject(params) {
  const obj = params.obj;
  const shouldStroke = params.shouldStroke;
  const shouldFill = params.shouldFill;

  if (shouldStroke) {
    strokeObject(obj);
  }

  if (shouldFill) {
    fillObject(obj);
  }
}

/**
 * @static
 */
function createRect(params) {
  const x = params.x;
  const y = params.y;
  const width = params.width;
  const height = params.height;
  const obj = new Path2D();
  const objId = params.objId;

  // clearExisting(rectangles[objId]);
  obj.rect(x, y, width, height);
  drawObject({
    obj,
    shouldStroke: params.shouldStroke,
    shouldFill: params.shouldFill,
  });

  objects[objId] = {
    type: 'rect',
    x,
    y,
    width,
    height,
    stroke: params.shouldStroke,
  };
}

/**
 * @static
 */
function createCircle(params) {
  const x = params.x;
  const y = params.y;
  const radius = params.radius;
  const objId = params.objId;
  const obj = new Path2D();

  // clearExisting(circles[objId], 'circle');
  obj.arc(x, y, radius, 0, Math.PI * 2);
  drawObject({
    obj,
    shouldStroke: params.shouldStroke,
    shouldFill: params.shouldFill,
  });

  objects[objId] = {
    type: 'circle',
    x,
    y,
    radius,
  };
}

/**
 * @private
 * @param {Object} obj
 * @returns {{x: Number, y: Number}}
 */
function getCenter(obj) {
  const type = obj.type;

  switch (type) {
    case 'circle': {
      return { x: obj.x, y: obj.y };
    }
    case 'line': {
      return { x: (obj.from.x + obj.to.x) / 2, y: (obj.to.y + obj.from.y) / 2 };
    }
    default: {
      return { x: obj.x + (obj.width / 2), y: obj.y + (obj.height / 2) };
    }
  }
}

function getEdgePoint(obj, target) {
  const type = obj.type;

  switch (type) {
    case 'circle': {

    }
    case 'line': {
    }
    default: {
    }
  }
}

/**
 * @private
 * @param {Number} sentX
 * @param {Number} sentY
 * @returns {{x: Number, y: Number}}
 */
function createVector(sentX, sentY) {
  const scale = Math.sqrt((sentX * sentX) + (sentY * sentY));
  const x = sentX / scale;
  const y = sentY / scale;

  return { x, y };
}

/**
 * @private
 * @param {Object} fromObj
 * @param {Object} toObj
 * @returns {{from: {x: Number, y: Number}, to: {x: Number, y: Number}}}
 */
function getLinePoints(fromObj, toObj) {
  const fromCenter = getCenter(fromObj);
  const toCenter = getCenter(toObj);
  const vector = createVector(toCenter.x - fromCenter.x, toCenter.y - fromCenter.y);

  return {
    from: {
      x: fromCenter.x + (fromObj.radius * vector.x),
      y: fromCenter.y + (fromObj.radius * vector.y),
    },
    to: {
      x: toCenter.x - (toObj.radius * vector.x),
      y: toCenter.y - (toObj.radius * vector.y),
    },
  };
}

/**
 * @private
 * @param {{fromObjId: string, toObjId: string}} params
 */
function lineConnection(params) {
  const fromObj = objects[params.fromObjId];
  const toObj = objects[params.toObjId];

  return getLinePoints(fromObj, toObj);
}

/**
 * @static
 * @param {{fromObjId: string, toObjId: string, objId: string, from:{x: Number, y: Number}, to:{x: Number, y: Number}}} params
 */
function createLine(params) {
  const fromObjId = params.fromObjId;
  const toObjId = params.toObjId;
  const objId = params.objId;
  const obj = new Path2D();
  let from = params.from;
  let to = params.to;

  // clearExisting(lines[objId], 'line');

  console.log('params', params);
  if (params.fromObjId && params.toObjId) {
    const connection = lineConnection(params);
    console.log('connection', connection);
    from = connection.from;
    to = connection.to;

    obj.moveTo(from.x, from.y);
    obj.lineTo(to.x, to.y);
  } else {
    obj.moveTo(from.x, from.y);
    obj.lineTo(to.x, to.y);
  }

  strokeObject(obj);

  objects[objId] = {
    type: 'line',
    from,
    to,
    fromObjId,
    toObjId,
  };
}

/**
 * @static
 */
function drawCanvas() {
  context.canvas.width = paintArea.offsetWidth;
  context.canvas.height = paintArea.offsetHeight;
  context.lineWidth = lineWidth;
  context.fillStyle = '#008766';
  context.strokeStyle = '#00FFCC';
}

exports.drawCanvas = drawCanvas;
exports.createCircle = createCircle;
exports.createRect = createRect;
exports.createLine = createLine;
