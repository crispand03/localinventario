// Servicio de sincronización en la nube usando JSONBin.io (gratuito)
const SYNC_API_BASE = 'https://api.jsonbin.io/v3/b';
const SYNC_API_KEY = '$2a$10$YOUR_API_KEY'; // Reemplazar con tu API key de jsonbin.io

// Alternativa: Usar un servicio propio o Firebase
// Por ahora implementamos sincronización manual con código

export interface SyncData {
  models: any[];
  movements: any[];
  sales: any[];
  lastSync: string;
  deviceId: string;
}

export async function uploadSyncData(data: SyncData): Promise<string> {
  try {
    // Generar un ID único para esta sincronización
    const syncId = generateSyncId();
    
    // Comprimir y codificar los datos
    const compressedData = compressData(data);
    
    // Guardar en localStorage con el syncId
    localStorage.setItem(`sync_${syncId}`, JSON.stringify(data));
    
    return syncId;
  } catch (error) {
    console.error('Error uploading sync data:', error);
    throw new Error('Error al subir datos de sincronización');
  }
}

export async function downloadSyncData(syncId: string): Promise<SyncData> {
  try {
    // Buscar en localStorage
    const data = localStorage.getItem(`sync_${syncId}`);
    if (data) {
      return JSON.parse(data);
    }
    
    throw new Error('Código de sincronización no encontrado');
  } catch (error) {
    console.error('Error downloading sync data:', error);
    throw new Error('Error al descargar datos de sincronización');
  }
}

function generateSyncId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`.toUpperCase();
}

function compressData(data: any): string {
  return btoa(JSON.stringify(data));
}

function decompressData(compressed: string): any {
  return JSON.parse(atob(compressed));
}

// Sincronización peer-to-peer usando QR Code
export function generateSyncCode(data: SyncData): string {
  const compressed = compressData(data);
  // Si los datos son muy grandes, dividir en múltiples códigos
  if (compressed.length > 2000) {
    throw new Error('Datos demasiado grandes para sincronizar por código QR');
  }
  return compressed;
}

export function parseSyncCode(code: string): SyncData {
  try {
    return decompressData(code);
  } catch (error) {
    throw new Error('Código de sincronización inválido');
  }
}
