import { useState, useRef, useCallback } from 'react';
import L from 'leaflet';
import MapView from '@/components/MapView';
import GPXUploader from '@/components/GPXUploader';
import TrackList, { GPXTrack } from '@/components/TrackList';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Map as MapIcon } from 'lucide-react';

const Index = () => {
  const [tracks, setTracks] = useState<GPXTrack[]>([]);
  const [map, setMap] = useState<L.Map | null>(null);
  const gpxLayersRef = useRef<L.LayerGroup>(new L.LayerGroup());
  const trackLayersRef = useRef<Map<string, L.Polyline>>(new Map<string, L.Polyline>());

  const getRandomColor = () => {
    const colors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const parseGPX = (xmlString: string): L.LatLng[] => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const trackPoints = xmlDoc.getElementsByTagName('trkpt');
    const coordinates: L.LatLng[] = [];

    for (let i = 0; i < trackPoints.length; i++) {
      const lat = parseFloat(trackPoints[i].getAttribute('lat') || '0');
      const lon = parseFloat(trackPoints[i].getAttribute('lon') || '0');
      coordinates.push(L.latLng(lat, lon));
    }

    return coordinates;
  };

  const fitBoundsToAllTracks = useCallback(() => {
    if (!map || trackLayersRef.current.size === 0) return;

    const bounds = L.latLngBounds([]);
    trackLayersRef.current.forEach((layer) => {
      if (map.hasLayer(layer)) {
        bounds.extend(layer.getBounds());
      }
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map]);

  const handleFilesSelected = async (files: FileList) => {
    const newTracks: GPXTrack[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const text = await file.text();
        const coordinates = parseGPX(text);

        if (coordinates.length === 0) {
          toast.error(`El archivo ${file.name} no contiene puntos válidos`);
          continue;
        }

        const trackId = `${Date.now()}-${i}`;
        const track: GPXTrack = {
          id: trackId,
          name: file.name.replace('.gpx', ''),
          color: getRandomColor(),
          weight: 3,
          visible: true,
        };

        const polyline = L.polyline(coordinates, {
          color: track.color,
          weight: track.weight,
        });

        polyline.addTo(gpxLayersRef.current);
        trackLayersRef.current.set(trackId, polyline);
        newTracks.push(track);

        toast.success(`${file.name} cargado correctamente`);
      } catch (error) {
        toast.error(`Error al cargar ${file.name}`);
        console.error(error);
      }
    }

    if (newTracks.length > 0) {
      setTracks((prev) => [...prev, ...newTracks]);
      setTimeout(() => {
        fitBoundsToAllTracks();
      }, 100);
    }
  };

  const handleTrackUpdate = (id: string, updates: Partial<GPXTrack>) => {
    setTracks((prev) =>
      prev.map((track) => {
        if (track.id === id) {
          const updatedTrack = { ...track, ...updates };
          const layer = trackLayersRef.current.get(id);
          
          if (layer) {
            if (updates.color) {
              layer.setStyle({ color: updates.color });
            }
            if (updates.weight !== undefined) {
              layer.setStyle({ weight: updates.weight });
            }
            if (updates.visible !== undefined) {
              if (updates.visible) {
                layer.addTo(gpxLayersRef.current);
              } else {
                layer.remove();
              }
            }
          }
          
          return updatedTrack;
        }
        return track;
      })
    );

    if (updates.visible !== undefined) {
      setTimeout(fitBoundsToAllTracks, 100);
    }
  };

  const handleTrackDelete = (id: string) => {
    const layer = trackLayersRef.current.get(id);
    if (layer) {
      layer.remove();
      trackLayersRef.current.delete(id);
    }
    setTracks((prev) => prev.filter((track) => track.id !== id));
    toast.success('Track eliminado');
    setTimeout(fitBoundsToAllTracks, 100);
  };

  const handleTrackZoom = (id: string) => {
    if (!map) return;
    
    const layer = trackLayersRef.current.get(id);
    if (layer) {
      map.fitBounds(layer.getBounds(), { padding: [50, 50] });
      toast.success('Zoom ajustado a la ruta');
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-card overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <MapIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">GPX Viewer</h1>
              <p className="text-sm text-muted-foreground">Visualizador de rutas</p>
            </div>
          </div>

          <Card className="p-4 bg-muted/50">
            <GPXUploader onFilesSelected={handleFilesSelected} />
          </Card>

          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Rutas cargadas ({tracks.length})
            </h2>
            <TrackList
              tracks={tracks}
              onTrackUpdate={handleTrackUpdate}
              onTrackDelete={handleTrackDelete}
              onTrackZoom={handleTrackZoom}
            />
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 p-4">
        <MapView gpxLayers={gpxLayersRef.current} onMapReady={setMap} />
      </div>
    </div>
  );
};

export default Index;
