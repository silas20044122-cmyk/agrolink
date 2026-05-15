import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { COUNTY_COORDINATES } from '../lib/constants';
import { cn } from '../lib/utils';

// Fix for default marker icons in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface FarmMapProps {
  farms: any[];
  onFarmClick: (farm: any) => void;
  className?: string;
}

export default function FarmMap({ farms, onFarmClick, className }: FarmMapProps) {
  // Kenya center coordinates
  const center: [number, number] = [-1.286389, 36.817223];
  
  return (
    <div className={cn("rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm", className)}>
      <MapContainer 
        center={center} 
        zoom={6} 
        scrollWheelZoom={false} 
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {farms.map((farm) => {
          const coords = COUNTY_COORDINATES[farm.county] || center;
          // Add a small random offset if multiple farms are in the same county to prevent perfect overlap
          const offsetCoords: [number, number] = [
            coords[0] + (Math.random() - 0.5) * 0.1,
            coords[1] + (Math.random() - 0.5) * 0.1
          ];

          return (
            <Marker key={farm.id} position={offsetCoords}>
              <Popup>
                <div className="p-1">
                  <h4 className="font-bold text-primary-dark m-0">{farm.name}</h4>
                  <p className="text-xs text-gray-500 m-0 mb-2">{farm.location}, {farm.county}</p>
                  <button 
                    onClick={() => onFarmClick(farm)}
                    className="text-[10px] font-bold text-primary-fresh uppercase tracking-wider hover:underline"
                  >
                    View Farm Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
