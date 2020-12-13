import React, { useEffect, useRef, useState } from 'react';

import './MapView.scss';

const MapView = () => {
  const [map, setMap] = useState();
  const mapRef = useRef();

  const createMap = () => {
    if (typeof window.google === 'undefined' || typeof window.MarkerClusterer === 'undefined' || typeof window.MapLabel === 'undefined') {
      setTimeout(createMap, 1000);

      return;
    }

    const worldMap = new window.google.maps.Map(mapRef.current, {
      disableDefaultUI: true,
      fullscreenControl: false,
      keyboardShortcuts: false,
      mapTypeControl: false,
      noClear: true,
      zoomControl: false,
      panControl: false,
      overviewMapControl: false,
      rotateControl: false,
      scaleControl: false,
      streetViewControl: false,
      center: { lat: -34.397, lng: 150.644 },
      zoom: 8,
      styles: [{
        elementType: 'geometry',
        stylers: [
          { color: '#13002d' },
        ],
      }, {
        elementType: 'labels',
        stylers: [
          { visibility: 'off' },
        ],
      }, {
        featureType: 'poi',
        stylers: [
          { visibility: 'off' },
        ],
      }, {
        featureType: 'administrative',
        stylers: [
          { color: '#370087' },
        ],
      }, {
        featureType: 'landscape.natural.terrain',
        stylers: [
          { color: '#44003a' },
        ],
      }, {
        featureType: 'road',
        stylers: [
          { color: '#6e6c6d' },
          { weight: 0.5 },
        ],
      }, {
        featureType: 'transit',
        stylers: [
          { visibility: 'off' },
        ],
      }, {
        featureType: 'water',
        stylers: [
          { color: '#7d006c' },
        ],
      }],
    });

    setMap(worldMap);
  };

  useEffect(() => {
    createMap();
  }, []);

  return (
    <div
      ref={mapRef}
      className="MapView"
    />
  );
};

export default MapView;
