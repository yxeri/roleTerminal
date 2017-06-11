/*
 Copyright 2016 Aleksandar Jankovic

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

const eventCentral = require('../../EventCentral');
const socketManager = require('../../SocketManager');
const storageManager = require('../../StorageManager');

/**
 * Convert from geolocation position
 * @param {Object} position Geolocation position
 * @returns {Object} Converted position
 */
function convertPosition(position) {
  if (position.coordinates) {
    return {
      coordinates: position.coordinates,
      lastUpdated: new Date(),
    };
  }

  return {
    coordinates: {
      longitude: position.coords.longitude,
      latitude: position.coords.latitude,
      speed: position.coords.speed,
      heading: position.coords.heading,
      accuracy: position.coords.accuracy,
    },
    lastUpdated: new Date(),
  };
}

class Tracker {
  constructor() {
    this.latestBestPosition = {};
    this.latestPositions = [];

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.MYPOSITION,
      func: ({ position }) => {
        this.latestPositions.push(position);
      },
    });

    this.startTracker();
    this.startSendTimeout();
  }

  startTracker() {
    const staticPosition = storageManager.getStaticPosition();

    if (staticPosition) {
      const triggerMyPosition = () => {
        eventCentral.triggerEvent({
          event: eventCentral.Events.MYPOSITION,
          params: { position: convertPosition(staticPosition) },
        });
      };

      setTimeout(triggerMyPosition, 3000);
    } else {
      this.watchId = navigator.geolocation.watchPosition((position) => {
        if (position) {
          this.isTracking = true;

          eventCentral.triggerEvent({
            event: eventCentral.Events.MYPOSITION,
            params: { position: convertPosition(position) },
          });
        }
      }, (err) => {
        console.log(err);
      }, { enableHighAccuracy: true });
    }

    setTimeout(() => {
      if (this.watchId) {
        navigator.geolocation.clearWatch(this.watchId);
      }

      setTimeout(() => {
        this.latestPositions = [];
        this.startTracker();
      }, 15000);
    }, 10000);
  }

  startSendTimeout() {
    setTimeout(() => {
      if (this.latestPositions.length > 0 && !storageManager.getBlockedBy()) {
        this.sendBestPosition();
      }

      this.startSendTimeout();
    }, 5000);
  }

  getBestPosition() {
    const positions = Array.from(this.latestPositions);
    let bestPosition = null;

    if (positions.length > 0) {
      while (positions.length > 0) {
        const position = positions.pop();

        if (position.coordinates && (!bestPosition || position.coordinates.accuracy < bestPosition.coordinates.accuracy)) {
          bestPosition = position;
        }
      }
    }

    return bestPosition;
  }

  sendBestPosition() {
    const bestPosition = this.getBestPosition();
    this.latestBestPosition = bestPosition;

    if (!bestPosition || !bestPosition.coordinates || !bestPosition.coordinates.latitude || !bestPosition.coordinates.longitude || !bestPosition.coordinates.accuracy) {
      return;
    } else if (bestPosition.coordinates.accuracy > 150) {
      return;
    }

    bestPosition.deviceId = storageManager.getDeviceId();

    if (storageManager.getToken()) {
      socketManager.emitEvent('updateUserPosition', { position: bestPosition }, ({ error }) => {
        if (error) {
          console.log(error);
        }
      });
    }

    socketManager.emitEvent('updateDevicePosition', { position: bestPosition }, ({ error }) => {
      if (error) {
        console.log(error);
      }
    });
  }
}

module.exports = Tracker;
