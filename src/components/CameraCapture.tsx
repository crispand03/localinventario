import { useState, useRef, useCallback } from 'react';
import { Camera, X, RefreshCw, Check } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (photoData: string) => void;
  currentPhoto?: string;
}

export default function CameraCapture({ onCapture, currentPhoto }: CameraCaptureProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const openCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      alert('No se pudo acceder a la cámara. Por favor, toma la foto manualmente o selecciona una imagen.');
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            onCapture(ev.target?.result as string);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  }, [onCapture]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg', 0.7);
        onCapture(photoData);
        closeCamera();
      }
    }
  }, [onCapture]);

  const closeCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  }, [stream]);

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          onCapture(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  if (isCameraOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div className="flex items-center justify-between p-4 bg-black/80">
          <button onClick={closeCamera} className="text-white p-2">
            <X size={24} />
          </button>
          <span className="text-white font-medium">Tomar Foto</span>
          <div className="w-10" />
        </div>
        <div className="flex-1 relative overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <div className="flex items-center justify-center gap-8 p-6 bg-black/80">
          <button
            onClick={handleFileSelect}
            className="text-white p-3 rounded-full bg-gray-700 active:bg-gray-600"
          >
            <RefreshCw size={24} />
          </button>
          <button
            onClick={capturePhoto}
            className="w-16 h-16 rounded-full border-4 border-white bg-white/20 active:bg-white/40 flex items-center justify-center"
          >
            <div className="w-12 h-12 rounded-full bg-white" />
          </button>
          <button
            onClick={closeCamera}
            className="text-white p-3 rounded-full bg-green-600 active:bg-green-700"
          >
            <Check size={24} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {currentPhoto ? (
        <div className="relative rounded-xl overflow-hidden border-2 border-blue-200">
          <img src={currentPhoto} alt="Equipo" className="w-full h-48 object-cover" />
          <button
            onClick={() => onCapture('')}
            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg active:bg-red-600"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
          <Camera size={40} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm mb-3">Toma una foto del equipo</p>
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={openCamera}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-medium active:bg-blue-700 transition-colors"
        >
          <Camera size={20} />
          Cámara
        </button>
        <button
          type="button"
          onClick={handleFileSelect}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 py-3 rounded-xl font-medium active:bg-gray-300 transition-colors"
        >
          <RefreshCw size={20} />
          Galería
        </button>
      </div>
    </div>
  );
}
