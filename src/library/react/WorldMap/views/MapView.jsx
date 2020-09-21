import React, { createRef, useEffect } from 'react';

const MapView = () => {
  const mapRef = createRef();

  function createMap() {
    console.log(window.google, window.MarkerClusterer, window.MapLabel);

    if (typeof window.google === 'undefined' || typeof window.MarkerClusterer === 'undefined' || typeof window.MapLabel === 'undefined') {
      setTimeout(createMap, 1000);

      return;
    }

    const worldMap = new window.google.maps.Map(mapRef.current);
  }

  useEffect(() => {
    createMap();
  }, []);

  return (
    <div
      ref={mapRef}
      className="mapView"
    />
  );
};

export default MapView;
