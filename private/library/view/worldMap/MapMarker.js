/*
 Copyright 2017 Aleksandar Jankovic

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

const soundLibrary = require('../../audio/SoundLibrary');
const socketManager = require('../../SocketManager');
const storageManager = require('../../StorageManager');

class MapMarker {
  constructor({ coordinates: { longitude, latitude }, markerType, icon = {}, description = [], positionName, lastUpdated, map, worldMap, owner, team }) {
    this.marker = new google.maps.Marker({
      position: {
        lat: latitude,
        lng: longitude,
      },
      opacity: icon.opacity || 0.9,
      icon: {
        url: icon.url || '/images/mapicon.png',
        size: icon.size || new google.maps.Size(14, 14),
        origin: icon.origin || new google.maps.Point(0, 0),
        anchor: icon.anchor || new google.maps.Point(7, 7),
      },
    });
    this.markerType = markerType;
    this.description = description;
    this.positionName = positionName;
    this.lastUpdated = lastUpdated || new Date();
    this.map = map;
    this.worldMap = worldMap;
    this.owner = owner || '';
    this.team = team || '';

    google.maps.event.addListener(this.marker, 'click', (event) => {
      soundLibrary.playSound('button2');

      if (worldMap.movingMarker !== null) {
        google.maps.event.clearListeners(this.map, 'mousemove');
        this.setPosition({
          latitude: event.latLng.lat(),
          longitude: event.latLng.lng(),
          lastUpdated: new Date(),
        });
        socketManager.emitEvent('updatePosition', {
          position: {
            coordinates: {
              longitude: event.latLng.lng(),
              latitude: event.latLng.lat(),
            },
            positionName: this.positionName,
          },
        });
        this.movingMarker = null;
      } else if (this.positionName) {
        worldMap.showMarkerInfo({ position: this.getPosition(), positionName: this.positionName, description: this.description });
      }
    });

    let longClick = false;

    google.maps.event.addListener(this.marker, 'rightclick', (event) => {
      if (this.owner === storageManager.getUserName() || this.team === storageManager.getTeam()) {
        worldMap.createMarkerClickMenu(event, this);
      }
    });
    google.maps.event.addListener(this.marker, 'mousedown', (event) => {
      longClick = true;

      setTimeout(() => {
        if (longClick && (this.owner === storageManager.getUserName() || this.team === storageManager.getTeam())) {
          worldMap.createMarkerClickMenu(event, this);
        }
      }, 500);
    });
    google.maps.event.addListener(this.marker, 'mouseup', () => {
      longClick = false;
    });
    google.maps.event.addListener(this.marker, 'dragstart', () => {
      longClick = false;
    });

    if (this.map) {
      this.setMap(map);
    }
  }

  setPosition({ latitude, longitude, lastUpdated }) {
    this.marker.setPosition(new google.maps.LatLng(latitude, longitude));
    this.lastUpdated = lastUpdated || new Date();
  }

  getPosition() {
    return this.marker.getPosition();
  }

  setMap(map) {
    this.marker.setMap(map);
  }
}

module.exports = MapMarker;
