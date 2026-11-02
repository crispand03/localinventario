import { X } from 'lucide-react';
import Modal from './Modal';

interface IPhoneHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IPhoneHelp({ isOpen, onClose }: IPhoneHelpProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📱 Cómo usar en iPhone"
      size="md"
    >
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Instalar como App</h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex gap-2">
              <span className="font-bold">1.</span>
              <span>Toca el botón <strong>Compartir</strong> (cuadrado con flecha) en Safari</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">2.</span>
              <span>Desplázate y toca <strong>"Agregar a pantalla de inicio"</strong></span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">3.</span>
              <span>Toca <strong>"Agregar"</strong> en la esquina superior derecha</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">4.</span>
              <span>¡Listo! La app aparecerá en tu pantalla de inicio</span>
            </li>
          </ol>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h3 className="font-semibold text-green-900 mb-2">✅ Ventajas de la App</h3>
          <ul className="space-y-1 text-sm text-green-800">
            <li>• Funciona offline (sin internet)</li>
            <li>• Acceso rápido desde pantalla de inicio</li>
            <li>• Usa la cámara para fotos de productos</li>
            <li>• Genera PDFs y comparte por WhatsApp</li>
            <li>• Todos tus datos se guardan localmente</li>
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-semibold text-amber-900 mb-2">💡 Consejos</h3>
          <ul className="space-y-1 text-sm text-amber-800">
            <li>• Usa el botón <strong>+</strong> para agregar modelos rápidamente</li>
            <li>• Toma fotos de los equipos para identificarlos mejor</li>
            <li>• Exporta tus datos regularmente como respaldo</li>
            <li>• Los códigos QR se pueden escanear con la cámara</li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-medium active:bg-blue-700 hover:bg-blue-700 transition-colors tap-target"
        >
          Entendido
        </button>
      </div>
    </Modal>
  );
}
