import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GPXUploaderProps {
  onFilesSelected: (files: FileList) => void;
}

const GPXUploader = ({ onFilesSelected }: GPXUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".gpx"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        onClick={handleClick}
        className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
        size="lg"
      >
        <Upload className="mr-2 h-5 w-5" />
        Cargar archivos GPX
      </Button>
      <p className="text-sm text-muted-foreground text-center">
        Selecciona uno o varios archivos .gpx
      </p>
    </div>
  );
};

export default GPXUploader;
