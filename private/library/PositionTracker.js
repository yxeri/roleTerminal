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

const storageManager = require('./StorageManager');
const positionComposer = require('./data/composers/PositionComposer');

/**
 * Convert from geolocation position
 * @param {Object} position Geolocation position
 * @returns {Object} Converted position
 */
function convertPosition(position) {
  if (position.coordinates) {
    return {
      coordinates: position.coordinates,
    };
  }

  const {
    longitude,
    latitude,
    speed,
    heading,
    accuracy,
    altitude,
    altitudeAccuracy,
  } = position.coords;

  return {
    coordinates: {
      longitude,
      latitude,
      speed,
      heading,
      accuracy,
      altitude,
      altitudeAccuracy,
      timeCreated: new Date(position.timestamp),
    },
  };
}

class Tracker {
  constructor() {
    this.latestBestPosition = {};
    this.latestPositions = [];
  }

  startTracker({ standalone = false }) {
    if (standalone) {
      const backgroundGeo = window.BackgroundGeolocation;

      if (!backgroundGeo) {
        setTimeout(() => {
          this.startTracker({ standalone: true });
        }, 1000);
      }

      backgroundGeo.onLocation((position) => {
        if (position) {
          this.latestPositions.push(convertPosition(position));
          this.sendBestPosition();
        }
      });

      backgroundGeo.ready({
        reset: true,
        desiredAccuracy: backgroundGeo.DESIRED_ACCURACY_HIGH,
        distanceFilter: 10,
        autoSync: true,
        stopOnTerminate: false,
        startOnBoot: true,
      }, (state) => {
        if (!state.enabled) {
          backgroundGeo.start();
        }
      });
    } else {
      const staticPosition = storageManager.getStaticPosition();

      if (staticPosition.coordinates) {
        if (this.watchId) {
          navigator.geolocation.clearWatch(this.watchId);
        }

        positionComposer.updatePosition({
          positionId: storageManager.getUserId(),
          position: convertPosition(staticPosition),
          callback: ({ error }) => {
            if (error) {
              console.log('static position update failed', error);
            }
          },
        });
      } else {
        this.watchId = navigator.geolocation.watchPosition((position) => {
          if (position) {
            this.latestPositions.push(convertPosition(position));
          }
        }, (err) => {
          console.log(err);
        }, { enableHighAccuracy: true });
      }

      this.latestPositions = [];

      this.startSendTimeout();
    }
  }

  startSendTimeout() {
    setTimeout(() => {
      this.sendBestPosition();
      this.startSendTimeout();
    }, 5000);
  }

  getBestPosition() {
    let bestPosition = null;

    if (this.latestPositions.length > 0) {
      while (this.latestPositions.length > 0) {
        const position = this.latestPositions.pop();

        if (position.coordinates && (!bestPosition || position.coordinates.accuracy < bestPosition.coordinates.accuracy)) {
          bestPosition = position;
        }
      }
    }

    return bestPosition;
  }

  sendBestPosition() {
    this.latestBestPosition = this.getBestPosition();

    if (!this.latestBestPosition
      || !this.latestBestPosition.coordinates
      || !this.latestBestPosition.coordinates.latitude
      || !this.latestBestPosition.coordinates.longitude
      || !this.latestBestPosition.coordinates.accuracy) {
      return;
    }

    if (this.latestBestPosition.coordinates.accuracy > 100) {
      return;
    }

    const userId = storageManager.getUserId();
    this.latestBestPosition.deviceId = storageManager.getDeviceId();

    if (userId) {
      positionComposer.updatePosition({
        positionId: userId,
        position: this.latestBestPosition,
        callback: ({ error }) => {
          if (error) {
            console.log('Failed to update user position');

            return;
          }

          this.latestPositions = [];
        },
      });
    }
  }
}

const tracker = new Tracker();

module.exports = tracker;
