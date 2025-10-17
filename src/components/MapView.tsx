import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  gpxLayers: L.LayerGroup;
  onMapReady: (map: L.Map) => void;
}

const MapView = ({ gpxLayers, onMapReady }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainer.current, {
      center: [40.4168, -3.7038], // Madrid, Spain
      zoom: 6,
      zoomControl: false,
    });

    // Add zoom control to top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Base layers
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    });

    const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenTopoMap contributors',
      maxZoom: 17,
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri',
      maxZoom: 19,
    });

    const ignLayer = L.tileLayer('https://www.ign.es/wmts/mapa-raster?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=MTN&STYLE=default&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/jpeg', {
      attribution: '© IGN España',
      maxZoom: 18,
    });

    // Add default layer
    osmLayer.addTo(map);

    // Layer control
    const baseMaps = {
      'OpenStreetMap': osmLayer,
      'Topográfico': topoLayer,
      'Satélite': satelliteLayer,
      'IGN España': ignLayer,
    };

    L.control.layers(baseMaps, {}, { position: 'topright' }).addTo(map);

    // Add GPX layer group
    gpxLayers.addTo(map);

    mapRef.current = map;
    onMapReady(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div ref={mapContainer} className="w-full h-full rounded-lg shadow-elegant" />
  );
};

export default MapView;
