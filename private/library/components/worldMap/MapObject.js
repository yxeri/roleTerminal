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
const BaseDialog = require('../views/dialogs/BaseDialog');

const mouseHandler = require('../../MouseHandler');
const labelHandler = require('../../labels/LabelHandler');
const elementCreator = require('../../ElementCreator');
const socketManager = require('../../SocketManager');

const ids = {
  RIGHTCLICKBOX: 'rMapBox',
  LEFTCLICKBOX: 'lMapBox',
};

const cssClasses = {
  RIGHTCLICKBOX: 'mapRightClickBox',
  LEFTCLICKBOX: 'mapLeftClickBox',
};

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
    canBeDragged = true,
    alwaysShowLabel = false,
    shouldCluster = false,
    clickFuncs = {},
  }) {
    this.canBeDragged = canBeDragged;
    this.isDraggable = false;
    this.position = position;
    this.mapObject = mapObject;
    this.currentCoordinates = this.getLatestCoordinates();
    this.shouldCluster = shouldCluster;
    this.alwaysShowLabel = alwaysShowLabel;
    this.label = label || new Label({
      coordinates: this.getCenter(),
      text: this.position.positionName,
    });

    if (canBeDragged) {
      this.mapObject.addListener('dragend', () => {
        console.log('dragend');
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
        if (!this.isDraggable) {
          if (clickFuncs.leftFunc) {
            clickFuncs.leftFunc(event);
          } else {
            MapObject.showLeftClickBox({ thisMapObject: this });
          }

          return;
        }

        this.toggleDraggable(false);
      },
      right: (event) => {
        if (clickFuncs.right) {
          clickFuncs.right(event);
        } else {
          MapObject.showRightClickBox({ thisMapObject: this });
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
    socketManager.emitEvent(socketManager.EmitTypes.UPDATEPOSITION, { position: this.position }, ({ data, error }) => {
      if (error) {
        console.log('position error', this.position, error);

        return;
      }

      console.log('position updated', data);
    });
  }

  updatePositionCoordinates() {
    socketManager.emitEvent(socketManager.EmitTypes.UPDATEPOSITIONCOORDINATES, {
      positionId: this.position.objectId,
      coordinates: this.currentCoordinates,
    }, ({ data, error }) => {
      if (error) {
        console.log('position error', this.position, error);

        return;
      }

      console.log('position updated', data);
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

  static showLeftClickBox({ thisMapObject }) {
    console.log('showLeftClickBox', thisMapObject);

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

    elementCreator.replaceFirstChild(MapObject.leftClickBox, descriptionContainer);
    MapObject.leftClickBox.classList.remove('hide');
  }

  static hideLeftClickBox() {
    MapObject.leftClickBox.classList.add('hide');
  }

  static showRightClickBox({ thisMapObject }) {
    const items = [
      {
        elements: [elementCreator.createSpan({
          text: labelHandler.getLabel({ baseObject: 'MapObject', label: 'createPosition' }),
        })],
        clickFuncs: {
          leftFunc: () => {
            const dialog = new BaseDialog({
              lowerButtons: [
                elementCreator.createButton({
                  text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'cancel' }),
                  clickFuncs: {
                    leftFunc: () => { dialog.removeFromView(); },
                  },
                }),
                elementCreator.createButton({
                  text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'create' }),
                  clickFuncs: {
                    leftFunc: () => {
                      socketManager.emitEvent({
                        event: socketManager.EmitTypes.POSITION,
                        params: {},
                        callback: ({ data, error }) => {
                          if (error) {
                            return;
                          }

                          const { position } = data;

                          dialog.removeFromView();
                        },
                      });
                    },
                  },
                }),
              ],
              inputs: [
                elementCreator.createInput({
                  elementId: `${ids.RIGHTCLICKBOX}Input`,
                  inputName: 'position',
                  type: 'text',
                  isRequired: true,
                  placeholder: labelHandler.getLabel({ baseObject: 'MapObject', label: 'createPositionName' }),
                }),
              ],
            });

            dialog.addToView({ element: MapObject.rightClickBox.parentElement });
          },
        },
      },
    ];

    if (this.canBeDragged) {
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
    
    elementCreator.replaceFirstChild(MapObject.rightClickBox, elementCreator.createContainer({ elements: [elementCreator.createList({ items })] }));
    MapObject.rightClickBox.classList.remove('hide');
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
