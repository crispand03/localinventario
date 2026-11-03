import { useState } from 'react';
import { QrCode, Download, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Modal from './Modal';
import { getEquipment, saveEquipment } from '../utils/storage';
import { generateSyncCode, parseSyncCode, type SyncData } from '../utils/sync';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete: () => void;
}

export default function SyncModal({ isOpen, onClose, onSyncComplete }: SyncModalProps) {
  const [mode, setMode] = useState<'select' | 'export' | 'import'>('select');
  const [syncCode, setSyncCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const handleExport = () => {
    try {
      const data: SyncData = {
        models: getEquipment(),
        movements: [],
        sales: [],
        lastSync: new Date().toISOString(),
        deviceId: 'device-' + Date.now(),
      };
      
      const code = generateSyncCode(data);
      setSyncCode(code);
      setMode('export');
      setStatus('success');
      setMessage('Código generado correctamente');
    } catch (error) {
      setStatus('error');
      setMessage('Error al generar código: ' + (error as Error).message);
    }
  };

  const handleImport = () => {
    try {
      if (!importCode.trim()) {
        setStatus('error');
        setMessage('Por favor ingresa un código de sincronización');
        return;
      }

      const data = parseSyncCode(importCode.trim());
      
      if (confirm('¿Deseas reemplazar todos los datos actuales con los datos sincronizados?')) {
        saveEquipment(data.models);
        
        setStatus('success');
        setMessage('Datos sincronizados correctamente');
        onSyncComplete();
        
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Código inválido: ' + (error as Error).message);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setMode('select');
    setSyncCode('');
    setImportCode('');
    setStatus('idle');
    setMessage('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Sincronizar Datos" size="md">
      <div className="space-y-4">
        {mode === 'select' && (
          <>
            <p className="text-sm text-gray-600">
              Sincroniza tus datos entre dispositivos usando un código QR o código alfanumérico.
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExport}
                className="flex flex-col items-center gap-2 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <QrCode size={32} className="text-blue-600" />
                <span className="font-semibold text-blue-700">Exportar</span>
                <span className="text-xs text-blue-600">Generar código</span>
              </button>
              
              <button
                onClick={() => setMode('import')}
                className="flex flex-col items-center gap-2 p-4 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 transition-colors"
              >
                <Download size={32} className="text-green-600" />
                <span className="font-semibold text-green-700">Importar</span>
                <span className="text-xs text-green-600">Ingresar código</span>
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <p className="text-xs text-yellow-800">
                <strong>Nota:</strong> Los datos se comprimen y codifican en el código. 
                Para datos grandes, usa la opción de exportar/importar archivo JSON en Ajustes.
              </p>
            </div>
          </>
        )}

        {mode === 'export' && (
          <>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-sm text-green-800 font-medium">{message}</p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-3">
                Escanea este código QR desde otro dispositivo o copia el código:
              </p>
              
              <div className="flex justify-center mb-4">
                <QRCodeSVG 
                  value={syncCode} 
                  size={200} 
                  level="M"
                  className="border-4 border-white shadow-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">Código de sincronización:</label>
                <textarea
                  value={syncCode}
                  readOnly
                  className="w-full h-24 p-2 text-xs font-mono bg-gray-50 border border-gray-300 rounded-lg resize-none"
                />
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copiar código
                    </>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cerrar
            </button>
          </>
        )}

        {mode === 'import' && (
          <>
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Ingresa el código de sincronización:
              </label>
              <textarea
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                placeholder="Pega aquí el código generado desde otro dispositivo..."
                className="w-full h-32 p-3 text-sm font-mono bg-gray-50 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              
              <button
                onClick={handleImport}
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Download size={20} />
                Importar datos
              </button>
            </div>

            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-800">{message}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <p className="text-sm text-green-800">{message}</p>
              </div>
            )}

            <button
              onClick={() => setMode('select')}
              className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Volver
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
