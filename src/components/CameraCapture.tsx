import { useState, useRef, useCallback } from 'react';
import { Camera, X, RefreshCw, Check, Upload } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (photoData: string) => void;
  currentPhoto?: string;
}

// Función para procesar y redimensionar imágenes
const processImage = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.85): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcular nuevas dimensiones manteniendo aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export default function CameraCapture({ onCapture, currentPhoto }: CameraCaptureProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const openCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', 
          width: { ideal: 1920 }, 
          height: { ideal: 1080 } 
        }
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error('Error accessing camera:', err);
      // Fallback: abrir selector de archivos directamente
      handleFileSelect();
    }
  }, []);

  const closeCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
    setIsProcessing(false);
  }, [stream]);

  const capturePhoto = useCallback(async () => {
    if (videoRef.current && canvasRef.current) {
      setIsProcessing(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Capturar frame del video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        
        // Procesar y redimensionar la imagen
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
            const processedImage = await processImage(file, 1200, 1200, 0.85);
            onCapture(processedImage);
            setIsProcessing(false);
            closeCamera();
          }
        }, 'image/jpeg', 0.85);
      }
    }
  }, [onCapture, closeCamera]);

  const handleFileSelect = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsProcessing(true);
        try {
          const processedImage = await processImage(file, 1200, 1200, 0.85);
          onCapture(processedImage);
        } catch (err) {
          console.error('Error processing image:', err);
        }
        setIsProcessing(false);
      }
    };
    input.click();
  };

  if (isCameraOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div className="flex items-center justify-between p-4 bg-black/80 pt-safe">
          <button onClick={closeCamera} className="text-white p-2 tap-target flex items-center justify-center active:bg-white/10 rounded-lg transition-colors">
            <X size={24} />
          </button>
          <span className="text-white font-semibold text-lg">Tomar Foto</span>
          <div className="w-10" />
        </div>
        <div className="flex-1 relative overflow-hidden bg-gray-900">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          {isProcessing && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-lg font-medium">Procesando imagen...</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-8 p-6 bg-black/80 pb-safe">
          <button
            onClick={handleFileSelect}
            disabled={isProcessing}
            className="text-white p-3 rounded-full bg-gray-700 active:bg-gray-600 tap-target flex items-center justify-center transition-all disabled:opacity-50"
          >
            <Upload size={24} />
          </button>
          <button
            onClick={capturePhoto}
            disabled={isProcessing}
            className="w-18 h-18 rounded-full border-4 border-white bg-white/20 active:bg-white/40 flex items-center justify-center transition-all tap-target disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="w-14 h-14 rounded-full border-4 border-white border-t-transparent animate-spin" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-white" />
            )}
          </button>
          <button
            onClick={closeCamera}
            disabled={isProcessing}
            className="text-white p-3 rounded-full bg-red-600 active:bg-red-700 tap-target flex items-center justify-center transition-all disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {currentPhoto ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-blue-200 shadow-md">
          <img src={currentPhoto} alt="Equipo" className="w-full h-56 object-cover" />
          <button
            onClick={() => onCapture('')}
            className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full shadow-lg active:bg-red-600 active:scale-95 transition-all"
          >
            <X size={18} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <p className="text-white text-sm font-medium">✓ Foto cargada correctamente</p>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
          <Camera size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium mb-1">Toma una foto del equipo</p>
          <p className="text-gray-400 text-sm">o selecciona una imagen de tu galería</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={openCamera}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl font-semibold active:scale-95 transition-all shadow-md hover:shadow-lg"
        >
          <Camera size={20} />
          Cámara
        </button>
        <button
          type="button"
          onClick={handleFileSelect}
          className="flex items-center justify-center gap-2 bg-white text-gray-700 py-3.5 rounded-xl font-semibold border-2 border-gray-200 active:scale-95 transition-all hover:border-gray-300 hover:bg-gray-50"
        >
          <Upload size={20} />
          Galería
        </button>
      </div>
    </div>
  );
}
