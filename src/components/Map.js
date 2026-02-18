import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
const DefaultIcon = L.icon({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapController = ({ userLocation }) => {
  const map = useMap();
  
  useEffect(() => {
    if (userLocation) {
      map.setView(userLocation, 15);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]); // Only run when userLocation changes

  return null;
};

const MapComponent = ({ height = "500px", userPath = [], territories = [], user = null }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // Default to NYC

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer
        center={mapCenter}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapController userLocation={userLocation} />
        
        {/* User's current location marker */}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>
              Your current location
            </Popup>
          </Marker>
        )}
        
        {/* User's running path */}
        {userPath.length > 1 && (
          <Polyline
            positions={userPath}
            color="blue"
            weight={4}
            opacity={0.8}
          />
        )}
        
        {/* Territory polygons */}
        {territories.map((territory, index) => {
          const isUserTerritory = territory.owner === 'user' || territory.owner === user?.id;
          return (
            <Polygon
              key={territory.id || index}
              positions={territory.coordinates}
              pathOptions={{
                color: isUserTerritory ? 'green' : 'red',
                fillColor: isUserTerritory ? 'green' : 'red',
                fillOpacity: 0.3,
                weight: 2
              }}
            >
              <Popup>
                <div>
                  <strong>{territory.name}</strong><br />
                  Owner: {isUserTerritory ? 'You' : territory.owner}<br />
                  Area: {territory.area ? territory.area.toFixed(3) : '0.000'} km²<br />
                  Captured: {new Date(territory.capturedAt).toLocaleDateString()}
                </div>
              </Popup>
            </Polygon>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
