const Label = require('./Label');

/**
 * Requires Google maps library
 */
class MapMarker {
  constructor({
    icon,
    position,
    circleStyles = {},
    alwaysShowLabel = false,
    shouldCluster = true,
    opacity = 1,
    url = '/images/mapicon.png',
  }) {
    const {
      positionId,
      coordinatesHistory,
      positionType,
      positionName,
    } = position;
    const coordinates = coordinatesHistory[coordinatesHistory.length - 1];

    this.positionId = positionId;
    this.marker = new google.maps.Marker({
      position: {
        lat: coordinates.latitude,
        lng: coordinates.longitude,
      },
      icon: icon || {
        url,
        size: new google.maps.Size(14, 14),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(7, 7),
      },
      opacity,
    });
    this.accuracy = coordinates.accuracy || 10;
    this.positionType = positionType;
    this.accuracyCircle = new google.maps.Circle({
      center: this.marker.getPosition(),
      strokeColor: circleStyles.strokeColor || '#FFFFFF',
      strokeOpacity: circleStyles.strokeOpacity || 0.5,
      strokeWeight: circleStyles.strokeWeight || 2,
      fillColor: circleStyles.fillColor || '#000000',
      fillOpacity: circleStyles.fillOpacity || 0.15,
      radius: this.accuracy,
    });
    this.label = new Label({
      coordinates,
      text: positionName,
    });
    this.shouldCluster = shouldCluster;
    this.alwaysShowLabel = alwaysShowLabel;
  }

  getPosition() {
    return this.marker.getPosition();
  }

  setMap(map) {
    this.marker.setMap(map);
  }

  attachMouseListeners() {
    let longClick = false;

    google.maps.event.addListener(this.marker, 'mouseover', () => {
    });

    google.maps.event.addListener(this.marker, 'mouseout', () => {
    });

    google.maps.event.addListener(this.marker, 'click', () => {
    });

    google.maps.event.addListener(this.marker, 'rightclick', () => {
    });

    google.maps.event.addListener(this.marker, 'mousedown', () => {
      longClick = true;

      setTimeout(() => {
        if (longClick) {
          // TODO Right click stuff
        }
      }, 500);
    });

    google.maps.event.addListener(this.marker, 'mouseup', () => {
      longClick = false;
    });

    google.maps.event.addListener(this.marker, 'dragstart', () => {
      longClick = false;
    });
  }

  showLabel() {
    this.label.showLabel(this.marker.getMap());
  }

  hideLabel() {
    if (!this.alwaysShowLabel) {
      this.label.hideLabel();
    }
  }

  showDescription() {

  }

  hideDescription() {

  }

  showAccuracy() {
    this.accuracyCircle.showCircle();
  }

  hideAccuracy() {
    this.accuracyCircle.hideCircle();
  }
}

module.exports = MapMarker;
