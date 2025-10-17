import { Eye, EyeOff, Trash2, ZoomIn } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export interface GPXTrack {
  id: string;
  name: string;
  color: string;
  weight: number;
  visible: boolean;
}

interface TrackListProps {
  tracks: GPXTrack[];
  onTrackUpdate: (id: string, updates: Partial<GPXTrack>) => void;
  onTrackDelete: (id: string) => void;
  onTrackZoom: (id: string) => void;
}

const TrackList = ({ tracks, onTrackUpdate, onTrackDelete, onTrackZoom }: TrackListProps) => {
  if (tracks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No hay tracks cargados</p>
        <p className="text-sm mt-2">Carga archivos GPX para comenzar</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tracks.map((track) => (
        <Card key={track.id} className="p-4 shadow-card">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground truncate flex-1">
                {track.name}
              </h3>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onTrackZoom(track.id)}
                  className="h-8 w-8"
                  title="Hacer zoom a esta ruta"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onTrackUpdate(track.id, { visible: !track.visible })}
                  className="h-8 w-8"
                  title={track.visible ? "Ocultar ruta" : "Mostrar ruta"}
                >
                  {track.visible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onTrackDelete(track.id)}
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                  title="Eliminar ruta"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <Label htmlFor={`color-${track.id}`} className="text-sm">
                  Color
                </Label>
                <Input
                  id={`color-${track.id}`}
                  type="color"
                  value={track.color}
                  onChange={(e) => onTrackUpdate(track.id, { color: e.target.value })}
                  className="h-10 cursor-pointer"
                />
              </div>

              <div>
                <Label htmlFor={`weight-${track.id}`} className="text-sm">
                  Grosor: {track.weight}px
                </Label>
                <Slider
                  id={`weight-${track.id}`}
                  value={[track.weight]}
                  onValueChange={([value]) => onTrackUpdate(track.id, { weight: value })}
                  min={1}
                  max={10}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TrackList;
