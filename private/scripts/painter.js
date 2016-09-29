/*
 Copyright 2015 Aleksandar Jankovic

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/** @module */

/**
 * @private
 * @type {CanvasRenderingContext2D}
 */
const context = null;
// const context = (document.getElementById('canvas')).getContext('2d');
/**
 * @private
 * @type {HTMLElement}
 */
const paintArea = document.getElementById('central');

/**
 * All objects in the scene (including out of view)
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
 * Draw the inside of the object
 * @private
 * @param {Path2D} obj - 2D object
 */
function fillObject(obj) {
  context.fill(obj);
}

/**
 * Draw the outline of the object
 * @private
 * @param {Path2D} obj - 2D object
 */
function strokeObject(obj) {
  context.stroke(obj);
}

/**
 * Fills the inside and/or draws the outline of the object, depending on parameters
 * @private
 * @param {Object} params - Parameters
 * @param {boolean} params.shouldStroke - Should the outline of the object be drawn?
 * @param {boolean} params.shouldFill - Should the inside of the object be drawn?
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
 * Create and draw a rectangle
 * @static
 * @param {Object} params - Parameters
 * @param {Number} x - X coordinate of the upper left corner
 * @param {Number} y - Y coordiantes of the upper left corner
 * @param {Number} width - Width of the object in pixels
 * @param {Number} height - Height of the object in pixels
 * @param {objId} objId - Name identifier of the object
 * @param {boolean} params.shouldStroke - Should the outline of the object be drawn?
 * @param {boolean} params.shouldFill - Should the inside of the object be drawn?
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
 * @param {Object} params - Parameters
 * @param {Number} x - X coordinate of the center of the circle
 * @param {Number} y - Y coordiantes of the center of the circle
 * @param {Number} width - Radius of the circle
 * @param {objId} objId - Name identifier of the object
 * @param {boolean} params.shouldStroke - Should the outline of the object be drawn?
 * @param {boolean} params.shouldFill - Should the inside of the object be drawn?
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
 * Returns center of the object
 * Center is calcualted according to the type of object sent
 * Supports circle, line and rectangular objects
 * @private
 * @param {Object} obj - 2D object
 * @returns {{x: Number, y: Number}} - x and y coordinates of the center of the object
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

// function getEdgePoint(obj, target) {
//   const type = obj.type;

//   switch (type) {
//     case 'circle': {

//     }
//     case 'line': {
//     }
//     default: {
//     }
//   }
// }

/**
 * @private
 * @param {Number} sentX - x
 * @param {Number} sentY - y
 * @returns {{x: Number, y: Number}} - x and y coordinates
 */
function createVector(sentX, sentY) {
  const scale = Math.sqrt((sentX * sentX) + (sentY * sentY));
  const x = sentX / scale;
  const y = sentY / scale;

  return { x, y };
}

/**
 * Returns x and y points for both ends of a line from two object
 * @private
 * @param {Object} fromObjId - Id of the object at the start of the line
 * @param {Object} toObjId - Id of the object at the end of the line
 * @returns {{from: {x: Number, y: Number}, to: {x: Number, y: Number}}} - X and y coordinates where the line connects from both objects
 */
function getLinePoints(fromObjId, toObjId) {
  const fromObj = objects[fromObjId];
  const toObj = objects[toObjId];
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
 * Creates a line between two objects OR two points
 * The line, if between two objects, will be drawn to the edges of the objects
 * @static
 * @param {Object} params - Parameters
 * @param {string} params.fromObjId - Id of the object at the beginning of the line. Leave empty if you are drawing a line between two points
 * @param {string} params.toObjId - Id of the object at the end of the line. Leave empty if you are drawing a line between two points
 * @param {string} params.objId - Id of the line
 * @param {Object} params.from - X and Y coordinates for the beginning of the line
 * @param {Object} params.from.x - X coordinate for the beginning of the line
 * @param {Object} params.from.y - Y coordinate for the beginning of the line
 * @param {Object} params.to - X and Y coordinates for the end of the line
 * @param {Object} params.to.x - X coordinate for the end of the line
 * @param {Object} params.to.y - Y coordinate for the end of the line
 */
function createLine(params) {
  const fromObjId = params.fromObjId;
  const toObjId = params.toObjId;
  const objId = params.objId;
  const obj = new Path2D();
  let from = params.from;
  let to = params.to;

  // clearExisting(lines[objId], 'line');

  if (fromObjId && toObjId) {
    const connection = getLinePoints(fromObjId, toObjId);
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
