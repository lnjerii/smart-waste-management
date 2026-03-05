"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useMap } from "react-leaflet/hooks";
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

function MapResizer() {
  const map = useMap();

  useEffect(() => {
    const update = () => map.invalidateSize();
    const timer = setTimeout(update, 200);
    window.addEventListener("resize", update);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", update);
    };
  }, [map]);

  return null;
}

export default function LiveMap({ bins }: { bins: Bin[] }) {
  const safeBins = bins.filter(
    (bin) =>
      Number.isFinite(bin.location?.lat) &&
      Number.isFinite(bin.location?.lng) &&
      Math.abs(bin.location.lat) <= 90 &&
      Math.abs(bin.location.lng) <= 180
  );

  const center = safeBins.length
    ? [safeBins[0].location.lat, safeBins[0].location.lng]
    : ([-1.286389, 36.817223] as [number, number]);

  return (
    <div className="map-frame">
      <MapContainer center={center as [number, number]} zoom={13} style={{ height: "100%", width: "100%" }}>
        <MapResizer />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {safeBins.map((bin) => (
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
      {safeBins.length === 0 && <div className="map-overlay-note">No live bin coordinates yet.</div>}
    </div>
  );
}
