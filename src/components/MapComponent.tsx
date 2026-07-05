import React, { useState, useRef } from "react";
import { MapPin, Navigation, Map as MapIcon, Layers, ShieldAlert, Crosshair } from "lucide-react";
import GlassCard from "./GlassCard";

interface MapComponentProps {
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  selectedLocation?: { lat: number; lng: number; address: string };
  interactive?: boolean;
  heatmapMode?: boolean;
  complaintsList?: any[];
}

export default function MapComponent({
  onLocationSelect,
  selectedLocation,
  interactive = false,
  heatmapMode = false,
  complaintsList = [],
}: MapComponentProps) {
  // Chennai bounding region: Lat ~13.08, Lng ~80.27
  const [marker, setMarker] = useState(
    selectedLocation || { lat: 13.0827, lng: 80.2707, address: "Ward 4 Head Office, Chennai" }
  );

  const [activeLayer, setActiveLayer] = useState<"standard" | "satellite" | "heatmap">("standard");

  // Mock Chennai Wards bounding paths or polygons for heatmap rendering
  const wards = [
    { id: "ward-1", name: "Ward 1 - Royapuram", density: 12, color: "rgba(239, 68, 68, 0.4)", complaintsCount: 15 },
    { id: "ward-2", name: "Ward 2 - T. Nagar", density: 8, color: "rgba(245, 158, 11, 0.4)", complaintsCount: 9 },
    { id: "ward-3", name: "Ward 3 - Mylapore", density: 3, color: "rgba(34, 197, 94, 0.3)", complaintsCount: 3 },
    { id: "ward-4", name: "Ward 4 - Anna Nagar", density: 18, color: "rgba(220, 38, 38, 0.55)", complaintsCount: 22 },
  ];

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactive) return;

    // Get click coords on the SVG grid (0 to 600 width, 0 to 400 height)
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Map pixel (x, y) to Chennai latitude/longitude bounding box
    // Lat: 13.04 to 13.12
    // Lng: 80.20 to 80.30
    const calculatedLat = 13.12 - (y / 400) * 0.08;
    const calculatedLng = 80.20 + (x / 600) * 0.10;

    const mockAddresses = [
      "12, Kamarajar Street, Ward 4, Chennai, Tamil Nadu 600001",
      "Anna Salai, Spencer Plaza Gate, Chennai, Tamil Nadu 600002",
      "Usman Road, T. Nagar shopping district, Chennai 600017",
      "MGR Nagar Park Gate, Chennai 600078",
      "34, Royapuram Beach Road, Chennai 600013",
    ];
    const randomAddress = mockAddresses[Math.floor(Math.random() * mockAddresses.length)];

    const newLoc = {
      lat: calculatedLat,
      lng: calculatedLng,
      address: randomAddress,
    };

    setMarker(newLoc);
    if (onLocationSelect) {
      onLocationSelect(calculatedLat, calculatedLng, randomAddress);
    }
  };

  // Convert lat/lng to SVG pixel coords (x: 0 to 600, y: 0 to 400)
  const getSvgCoords = (lat: number, lng: number) => {
    const x = ((lng - 80.20) / 0.10) * 600;
    const y = ((13.12 - lat) / 0.08) * 400;
    return { x: Math.max(0, Math.min(600, x)), y: Math.max(0, Math.min(400, y)) };
  };

  const markerCoords = getSvgCoords(marker.lat, marker.lng);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-850 shadow-inner bg-slate-50 dark:bg-neutral-950">
      {/* Layer Toggles overlay */}
      <div className="absolute top-3 left-3 z-10 flex gap-1.5 p-1 bg-white/95 dark:bg-neutral-900/95 shadow rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 text-xs font-semibold">
        <button
          onClick={() => setActiveLayer("standard")}
          className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
            activeLayer === "standard" ? "bg-amber-500 text-slate-950 shadow" : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span>Standard</span>
        </button>
        <button
          onClick={() => setActiveLayer("satellite")}
          className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
            activeLayer === "satellite" ? "bg-amber-500 text-slate-950 shadow" : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Satellite</span>
        </button>
        {heatmapMode && (
          <button
            onClick={() => setActiveLayer("heatmap")}
            className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
              activeLayer === "heatmap" ? "bg-red-500 text-white shadow" : "text-neutral-500 dark:text-neutral-400"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Heatmap Layer</span>
          </button>
        )}
      </div>

      <div className="absolute bottom-3 right-3 z-10 p-2 bg-white/95 dark:bg-neutral-900/95 shadow-lg rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 text-[10px] font-semibold text-neutral-600 dark:text-neutral-400 font-mono flex items-center gap-2">
        <Navigation className="w-3 h-3 text-amber-500 animate-pulse" />
        <span>GPS: {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}</span>
      </div>

      {/* Map SVG Area */}
      <svg
        id="municipal-svg-map"
        viewBox="0 0 600 400"
        className={`w-full aspect-[3/2] select-none ${interactive ? "cursor-crosshair" : ""}`}
        onClick={handleMapClick}
      >
        {/* Background Land representation */}
        {activeLayer === "satellite" ? (
          <rect width="600" height="400" fill="#0c1020" />
        ) : (
          <rect width="600" height="400" fill="currentColor" className="text-slate-100 dark:text-neutral-900" />
        )}

        {/* Grid lines */}
        <defs>
          <pattern id="map-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" className="text-slate-200/40 dark:text-neutral-800/20" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="600" height="400" fill="url(#map-grid)" />

        {/* Chennai coastline outline representation */}
        <path
          d="M 520,0 Q 510,120 540,250 T 580,400"
          fill="none"
          stroke="#0284c7"
          strokeWidth="3"
          className="opacity-50"
        />
        {/* Bay of Bengal Fill */}
        <path
          d="M 520,0 Q 510,120 540,250 T 580,400 L 600,400 L 600,0 Z"
          fill="#38bdf8"
          className="opacity-15 dark:opacity-5"
        />

        {/* Grid Roads visualization */}
        <g stroke="currentColor" strokeWidth="1.5" className="text-slate-300 dark:text-neutral-850 opacity-40">
          <line x1="100" y1="0" x2="100" y2="400" />
          <line x1="280" y1="0" x2="280" y2="400" />
          <line x1="420" y1="0" x2="420" y2="400" />
          <line x1="0" y1="120" x2="600" y2="120" />
          <line x1="0" y1="280" x2="600" y2="280" />
          {/* Diagonal highways */}
          <line x1="0" y1="50" x2="520" y2="350" strokeWidth="2.5" className="text-slate-400/30 dark:text-neutral-700/30" />
          <line x1="50" y1="400" x2="520" y2="100" strokeWidth="2" className="text-slate-400/30 dark:text-neutral-700/30" />
        </g>

        {/* Ward Polygons (Heatmap Layer rendering) */}
        {(activeLayer === "heatmap" || activeLayer === "standard") && (
          <g className="transition-all duration-300">
            {/* Ward 4 boundary box representation */}
            <rect x="50" y="30" width="180" height="150" rx="10" fill={activeLayer === "heatmap" ? "rgba(220, 38, 38, 0.35)" : "transparent"} stroke="rgba(220, 38, 38, 0.2)" strokeWidth="1" strokeDasharray="3" />
            <text x="60" y="45" className="text-[9px] fill-neutral-400 font-bold uppercase tracking-wider">Ward 4</text>

            {/* Ward 1 boundary box */}
            <rect x="300" y="50" width="160" height="130" rx="10" fill={activeLayer === "heatmap" ? "rgba(245, 158, 11, 0.3)" : "transparent"} stroke="rgba(245, 158, 11, 0.2)" strokeWidth="1" strokeDasharray="3" />
            <text x="310" y="65" className="text-[9px] fill-neutral-400 font-bold uppercase tracking-wider">Ward 1</text>

            {/* Ward 2 boundary box */}
            <rect x="100" y="220" width="220" height="140" rx="10" fill={activeLayer === "heatmap" ? "rgba(220, 38, 38, 0.2)" : "transparent"} stroke="rgba(220, 38, 38, 0.15)" strokeWidth="1" strokeDasharray="3" />
            <text x="110" y="235" className="text-[9px] fill-neutral-400 font-bold uppercase tracking-wider">Ward 2</text>
          </g>
        )}

        {/* Existing Seed complaints markers */}
        {complaintsList.map((comp) => {
          const coords = getSvgCoords(comp.location.lat, comp.location.lng);
          const isEmergency = comp.severity === "emergency";
          const isHigh = comp.severity === "high";
          const color = isEmergency ? "#ef4444" : isHigh ? "#f97316" : "#eab308";
          
          return (
            <g key={comp.id} className="cursor-pointer hover:scale-125 transition-all">
              <circle
                cx={coords.x}
                cy={coords.y}
                r="6"
                fill={color}
                className="animate-ping opacity-75"
              />
              <circle
                cx={coords.x}
                cy={coords.y}
                r="4.5"
                fill={color}
                stroke="#fff"
                strokeWidth="1.5"
              />
            </g>
          );
        })}

        {/* Active interactive selection Marker Pin */}
        <g transform={`translate(${markerCoords.x - 12}, ${markerCoords.y - 24})`} className="pointer-events-none transition-all duration-300">
          <path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
            fill="#e11d48"
            stroke="#fff"
            strokeWidth="1"
          />
          <circle cx="12" cy="9" r="3" fill="#fff" />
        </g>
      </svg>

      {/* Guide text overlay */}
      {interactive && (
        <div className="p-3 bg-neutral-100 dark:bg-neutral-850/60 border-t border-neutral-200 dark:border-neutral-800/80 text-xs flex items-center justify-between text-neutral-600 dark:text-neutral-400">
          <span className="flex items-center gap-1.5 font-medium">
            <Crosshair className="w-4 h-4 text-amber-500 animate-spin" />
            <span>Click/Tap anywhere on the grid map to select the grievance site location</span>
          </span>
        </div>
      )}
    </div>
  );
}
