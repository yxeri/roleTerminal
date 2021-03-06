/*
 Copyright 2018 Carmilla Mina Jankovic

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

const ViewWrapper = require('../ViewWrapper');
const PositionList = require('../lists/PositionList');
const WorldMapPage = require('./pages/WorldMapPage');

class WorldMapView extends ViewWrapper {
  constructor({
    mapStyles,
    polygonStyle,
    lineStyle,
    markerStyle,
    circleStyle,
    labelStyle,
    listId,
    clusterStyle,
    triggeredStyles,
    choosableStyles,
    alwaysShowLabels,
    backgroundColor,
    minZoom,
    maxZoom,
    centerCoordinates,
    cornerCoordinates,
    lists = [],
    positionTypes = [],
    classes = [],
    elementId = `wMView-${Date.now()}`,
  }) {
    const worldMapPage = new WorldMapPage({
      mapStyles,
      polygonStyle,
      lineStyle,
      markerStyle,
      circleStyle,
      labelStyle,
      listId,
      clusterStyle,
      triggeredStyles,
      choosableStyles,
      alwaysShowLabels,
      backgroundColor,
      minZoom,
      maxZoom,
      centerCoordinates,
      cornerCoordinates,
      positionTypes,
    });

    const columns = [];

    if (lists.length > 0) {
      const components = [];
      const positionLists = lists.map((list) => new PositionList(list));

      positionLists.forEach((positionList) => {
        const listToPush = positionList;
        listToPush.onToggle = () => {
          positionLists.filter((posList) => posList !== positionList).forEach((posList) => posList.hideList());
        };

        components.push({ component: listToPush });
      });

      columns.push({
        components,
        classes: [
          'columnList',
          'columnPositionList',
        ],
      });
    }

    columns.push({
      components: [{ component: worldMapPage }],
    });

    super({
      elementId,
      columns,
      classes: classes.concat(['worldMapView']),
    });
  }
}

module.exports = WorldMapView;
