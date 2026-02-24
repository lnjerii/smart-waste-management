"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

type Bin = {
  binId: string;
  fillLevel: number;
  temperatureC: number;
  location: { lat: number; lng: number };
};

const icon = (color: string) =>
  L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 0 1px #222;"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });

function markerColor(fillLevel: number) {
  if (fillLevel >= 90) return "#d90429";
  if (fillLevel >= 80) return "#f48c06";
  return "#2a9d8f";
}

export default function LiveMap({ bins }: { bins: Bin[] }) {
  const center = bins.length ? [bins[0].location.lat, bins[0].location.lng] : [-1.286389, 36.817223];

  return (
    <div className="map-frame">
      <MapContainer center={center as [number, number]} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {bins.map((bin) => (
          <Marker
            key={bin.binId}
            position={[bin.location.lat, bin.location.lng]}
            icon={icon(markerColor(bin.fillLevel))}
          >
            <Popup>
              <strong>{bin.binId}</strong><br />
              Fill: {bin.fillLevel}%<br />
              Temp: {bin.temperatureC} C
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
