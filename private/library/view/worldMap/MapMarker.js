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
const Label = require('./Label');

class MapMarker {
  constructor({ icon = {}, description = [], shouldCluster = false, team = '', owner = '', lastUpdated = new Date(), coordinates: { longitude, latitude, accuracy = 0 }, alwaysShowLabel = false, markerType, positionName, map, worldMap }) {
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
    this.accuracy = accuracy;
    this.markerType = markerType;
    this.description = description;
    this.positionName = positionName;
    this.lastUpdated = lastUpdated;
    this.map = map;
    this.worldMap = worldMap;
    this.owner = owner;
    this.team = team;
    this.shouldCluster = shouldCluster;
    this.accuracyCircle = new google.maps.Circle({
      center: this.marker.getPosition(),
      strokeColor: '#00ffcc',
      strokeOpacity: 0.5,
      strokeWeight: 2,
      fillColor: '#00ffcc',
      fillOpacity: 0.15,
      radius: this.accuracy,
    });
    this.label = new Label({
      positionName,
      labelText: positionName,
      coordinates: { longitude, latitude },
    });
    this.alwaysShowLabel = alwaysShowLabel;
    this.mouseOver = false;

    google.maps.event.addListener(this.marker, 'mouseover', () => {
      this.mouseOver = true;

      this.showAccuracy();
      this.showLabel(this.map);
    });

    google.maps.event.addListener(this.marker, 'mouseout', () => {
      this.mouseOver = false;

      this.hideAccuracy();

      if (!this.alwaysShowLabel) {
        this.hideLabel();
      }
    });

    google.maps.event.addListener(this.marker, 'click', (event) => {
      soundLibrary.playSound('button2');

      if (worldMap.movingMarker !== null) {
        google.maps.event.clearListeners(this.map, 'mousemove');
        this.setPosition({
          coordinates: {
            latitude: event.latLng.lat(),
            longitude: event.latLng.lng(),
          },
          map: this.map,
          lastUpdated: new Date(),
        });
        socketManager.emitEvent('updatePosition', {
          position: {
            coordinates: {
              accuracy: 30,
              longitude: event.latLng.lng(),
              latitude: event.latLng.lat(),
            },
            positionName: this.positionName,
            markerType: this.markerType,
          },
        });
        worldMap.movingMarker = null;
      } else {
        this.showDescription();
        this.showAccuracy();
      }
    });

    let longClick = false;

    google.maps.event.addListener(this.marker, 'rightclick', (event) => {
      if (this.owner === storageManager.getUserName()) {
        worldMap.createMarkerClickMenu(event, this);
      }
    });
    google.maps.event.addListener(this.marker, 'mousedown', (event) => {
      longClick = true;

      setTimeout(() => {
        if (longClick && this.markerType === 'custom' && this.owner === storageManager.getUserName()) {
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
      this.setMap(this.map);

      if (this.alwaysShowLabel) {
        this.showLabel(this.map);
      }
    }
  }

  showLabel() {
    this.label.showLabel(this.map);

    if (!this.alwaysShowLabel && !this.mouseOver) {
      setTimeout(() => {
        this.label.hideLabel(null);
      }, 5000);
    }
  }

  hideLabel() {
    this.label.hideLabel(null);
  }

  showDescription() {
    if (this.positionName) {
      this.worldMap.showMarkerInfo({ position: this.getPosition(), positionName: this.positionName, description: this.description });
    }
  }

  showAccuracy() {
    if (this.accuracy > 20) {
      this.accuracyCircle.setMap(this.map);
    }

    if (!this.mouseOver) {
      setTimeout(() => {
        this.hideAccuracy();
      }, 5000);
    }
  }

  hideAccuracy() {
    this.accuracyCircle.setMap(null);
  }

  setPosition({ coordinates, lastUpdated, map }) {
    this.setMap(map);
    this.label.setPosition({ coordinates });
    this.marker.setPosition(new google.maps.LatLng(coordinates.latitude, coordinates.longitude));
    this.lastUpdated = lastUpdated || new Date();
    this.accuracyCircle.center = this.marker.getPosition();

    if (coordinates.accuracy) {
      this.accuracy = coordinates.accuracy;
      this.accuracyCircle.radius = this.accuracy;
    }
  }

  getPosition() {
    return this.marker.getPosition();
  }

  setMap(map) {
    if (map === null) {
      this.accuracyCircle.setMap(null);
      this.hideLabel();
    } else if (this.alwaysShowLabel) {
      this.label.setMap(map);
    }

    this.marker.setMap(map);
    this.map = map;
  }
}

module.exports = MapMarker;
