/*
 Copyright 2018 Aleksandar Jankovic
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

const Label = require('./MapLabel');

const mouseHandler = require('../../MouseHandler');
const labelHandler = require('../../labels/LabelHandler');
const elementCreator = require('../../ElementCreator');
const positionComposer = require('../../data/PositionComposer');
const accessCentral = require('../../AccessCentral');

const ids = {
  RIGHTCLICKBOX: 'rMapBox',
  LEFTCLICKBOX: 'lMapBox',
};
const cssClasses = {
  RIGHTCLICKBOX: 'mapRightClickBox',
  LEFTCLICKBOX: 'mapLeftClickBox',
};

let positionCanBeDragged;

/**
 * Create functions for hovering and mouse out on MapObjects
 * @param {Object} params - Parameters.
 * @param {HTMLElement} params.element - DOM element.
 * @param {Function} params.hoverFunc - Function to call on hover.
 * @param {Function} [params.outFunc] - Function to call on mouse out.
 * @param {Boolean} [params.shouldOutOnDrag] - Should the mouse out function be called when a user starts dragging?
 */
function addGMapsHoverListeners({
  element,
  outFunc,
  shouldOutOnDrag,
  hoverFunc = () => {},
}) {
  const outTimeout = 100;
  let timer;
  let isHovering = false;

  google.maps.event.addListener(element, 'mouseover', (event) => {
    isHovering = true;

    hoverFunc(event);
  });

  if (outFunc) {
    google.maps.event.addListener(element, 'mouseout', (event) => {
      isHovering = false;

      if (!timer) {
        timer = setTimeout(() => {
          timer = undefined;

          if (!isHovering) {
            outFunc(event);
          }
        }, outTimeout);
      }
    });

    if (shouldOutOnDrag) {
      google.maps.event.addListener(element, 'drag', outFunc);
    }
  }
}

/**
 * Requires Google maps library
 */
class MapObject {
  constructor({
    mapObject,
    label,
    position,
    labelStyle,
    descriptionOnClick = true,
    canBeDragged = true,
    alwaysShowLabel = false,
    shouldCluster = false,
    clickFuncs = {},
  }) {
    this.isDraggable = false;
    this.position = position;
    this.mapObject = mapObject;
    this.currentCoordinates = this.getLatestCoordinates();
    this.shouldCluster = shouldCluster;
    this.alwaysShowLabel = alwaysShowLabel;
    this.label = label || new Label({
      labelStyle,
      coordinates: this.getCenter(),
      text: this.position.positionName,
    });

    positionCanBeDragged = canBeDragged;

    if (positionCanBeDragged) {
      this.mapObject.addListener('dragend', () => {
        this.setCurrentCoordinates({
          coordinates: {
            longitude: this.mapObject.position.lng(),
            latitude: this.mapObject.position.lat(),
          },
        });
        this.updatePositionCoordinates();
      });
    }

    mouseHandler.addGMapsClickListener({
      element: this.mapObject,
      leftFunc: (event) => {
        MapObject.hideRightClickBox();

        if (!this.isDraggable) {
          if (clickFuncs.leftFunc) {
            clickFuncs.leftFunc(event);
          } else if (descriptionOnClick) {
            MapObject.buildLeftClickBox({ thisMapObject: this });
          }

          return;
        }

        this.toggleDraggable(false);
      },
      right: (event) => {
        MapObject.hideLeftClickBox();

        if (clickFuncs.right) {
          clickFuncs.right(event);
        } else {
          MapObject.showPositionRightClickBox({
            event,
            thisMapObject: this,
          });
        }
      },
    });

    if (!this.alwaysShowLabel) {
      addGMapsHoverListeners({
        element: this.mapObject,
        shouldOutOnDrag: true,
        hoverFunc: () => {
          this.showLabel();
        },
        outFunc: () => {
          this.hideLabel();
        },
      });
    }
  }

  updatePosition() {
    positionComposer.updatePosition({
      position: this.position,
      callback: ({ data, error }) => {
        if (error) {
          console.log('position error', this.position, error);

          return;
        }

        console.log('position updated', data);
      },
    });
  }

  updatePositionCoordinates() {
    positionComposer.updatePositionCoordinates({
      positionId: this.position.objectId,
      coordinates: this.currentCoordinates,
      callback: ({ data, error }) => {
        if (error) {
          console.log('position error', this.position, error);

          return;
        }

        console.log('position updated', data);
      },
    });
  }

  toggleDraggable(isDraggable = false) {
    this.isDraggable = isDraggable;

    this.mapObject.setOptions({ draggable: isDraggable });
  }

  getCenter() {
    const bounds = new google.maps.LatLngBounds();

    bounds.extend(new google.maps.LatLng(this.currentCoordinates.latitude, this.currentCoordinates.longitude));

    if (this.currentCoordinates.extraCoordinates) {
      this.currentCoordinates.extraCoordinates.forEach((coords) => {
        bounds.extend(new google.maps.LatLng(coords.latitude, coords.longitude));
      });
    }

    const center = bounds.getCenter();

    return { longitude: center.lng(), latitude: center.lat() };
  }

  getCoordinatesHistory() {
    return this.position.coordinatesHistory;
  }

  setMap(map) {
    this.worldMap = map;
    this.mapObject.setMap(map);

    if (this.alwaysShowLabel) {
      this.showLabel();
    }
  }

  showLabel() {
    this.label.showLabel(this.mapObject.getMap());
  }

  hideLabel() {
    if (!this.alwaysShowLabel) {
      this.label.hideLabel();
    }
  }

  showObject() {
    this.mapObject.setMap(this.worldMap);

    if (this.alwaysShowLabel) {
      this.showLabel();
    }
  }

  hideObject() {
    this.mapObject.setMap(null);
  }

  getDescription() {
    return this.position.description;
  }

  getPositionId() {
    return this.position.positionId;
  }

  setCurrentCoordinates({ coordinates }) {
    this.currentCoordinates = coordinates;
    this.label.setCurrentCoordinates({ coordinates: this.getCenter() });
  }

  getCurrentCoordinates() {
    return this.currentCoordinates;
  }

  getLatestCoordinates() {
    return this.position.coordinatesHistory[this.position.coordinatesHistory.length - 1];
  }

  getPositionType() {
    return this.position.positionType;
  }

  static buildLeftClickBox({ thisMapObject }) {
    const {
      positionName,
      description = [labelHandler.getLabel({ baseObject: 'WorldMapView', label: 'noDescription' })],
    } = thisMapObject.position;

    const descriptionContainer = elementCreator.createContainer({
      elements: [elementCreator.createArticle({
        headerElement: elementCreator.createParagraph({
          elements: [elementCreator.createSpan({ text: positionName || labelHandler.getLabel({ baseObject: 'WorldMapView', label: 'noName' }) })],
        }),
        elements: [
          elementCreator.createSection({
            elements: description.map((line) => {
              return elementCreator.createParagraph({
                elements: [elementCreator.createSpan({ text: line })],
              });
            }),
          }),
        ],
      })],
    });

    MapObject.showLeftClickBox({ container: descriptionContainer });
  }

  static showPositionRightClickBox({
    event,
    thisMapObject,
  }) {
    const items = [];

    if (positionCanBeDragged) {
      items.push({
        elements: [elementCreator.createSpan({
          text: labelHandler.getLabel({ baseObject: 'MapObject', label: 'movePosition' }),
        })],
        clickFuncs: {
          leftFunc: () => {
            thisMapObject.toggleDraggable(!thisMapObject.isDraggable);
          },
        },
      });
    }

    MapObject.showRightClickBox({
      x: event.pixel.x,
      y: event.pixel.y,
      container: elementCreator.createContainer({ elements: [elementCreator.createList({ items })] }),
    });
  }

  static showLeftClickBox({ container }) {
    elementCreator.replaceFirstChild(MapObject.leftClickBox, container);
    MapObject.leftClickBox.classList.remove('hide');
  }

  static showRightClickBox({
    x,
    y,
    container,
  }) {
    if (!accessCentral.hasEnoughAccess({ requiredLevel: 1 })) {
      return;
    }

    elementCreator.replaceFirstChild(MapObject.rightClickBox, container);
    MapObject.rightClickBox.classList.remove('hide');

    if (x && y) {
      MapObject.rightClickBox.setAttribute('style', `left: ${x}px; top: ${y}px;`);

      const bound = MapObject.rightClickBox.getBoundingClientRect();
      const bottomOverflow = bound.bottom - window.innerHeight;
      const rightOverflow = bound.right - window.innerWidth;

      if (bound.bottom > window.innerHeight || bound.right > window.innerWidth) {
        const newX = bottomOverflow < 0 ? x - rightOverflow : x;
        const newY = rightOverflow < 0 ? y - bottomOverflow : y;

        MapObject.rightClickBox.setAttribute('style', `left: ${newX}px; top: ${newY}px;`);
      }

      return;
    }

    MapObject.rightClickBox.removeAttribute('style');
  }

  static hideLeftClickBox() {
    MapObject.leftClickBox.classList.add('hide');
  }

  static hideRightClickBox() {
    MapObject.rightClickBox.classList.add('hide');
  }
}

MapObject.leftClickBox = elementCreator.createContainer({
  elementId: ids.LEFTCLICKBOX,
  classes: ['hide', cssClasses.LEFTCLICKBOX],
  elements: [elementCreator.createContainer({})],
});

MapObject.rightClickBox = elementCreator.createContainer({
  elementId: ids.RIGHTCLICKBOX,
  classes: ['hide', cssClasses.RIGHTCLICKBOX],
  elements: [elementCreator.createContainer({})],
});

module.exports = MapObject;
