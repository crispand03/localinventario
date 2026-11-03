# 🚀 Guía Rápida de Inicio

## ✅ Aplicación Lista

La aplicación InventarioPro está completamente funcional con:

### Módulos Implementados
- ✅ **Dashboard**: Vista principal con estadísticas
- ✅ **Inventario**: Gestión completa de equipos
- ✅ **Ventas**: Sistema de facturación (Factura/Boleta/Recibo)
- ✅ **Sincronización**: Compartir datos entre dispositivos
- ✅ **Cámara**: Captura de fotos de equipos
- ✅ **Búsqueda**: Búsqueda rápida de equipos
- ✅ **Responsive**: Funciona en móvil, tablet y desktop
- ✅ **PWA**: Instalable como app nativa

## 📱 Cómo Usar

### 1. Desarrollo Local
```bash
npm run dev
```
Abre http://localhost:5173 en tu navegador

### 2. Compilar para Producción
```bash
npm run build
```
Los archivos estarán en la carpeta `dist/`

### 3. Probar Producción Localmente
```bash
npm run preview
```

## 🌐 Subir a Repositorio

### Opción 1: GitHub + Vercel (Más Fácil)
1. Sube el código a GitHub
2. Conecta tu repositorio en Vercel.com
3. Vercel desplegará automáticamente

### Opción 2: GitHub Pages
```bash
npm run build
# Sube la carpeta dist/ a tu repositorio
# Activa GitHub Pages en Settings
```

### Opción 3: Servidor Local (Para Sincronización)
```bash
npm run build
npm i -g serve
serve -s dist -l 3000
```
Accede desde otros dispositivos: `http://TU_IP:3000`

## 🔄 Sincronización entre Dispositivos

### Método 1: Código (Rápido)
1. Dispositivo A: Ajustes → Sincronizar → Exportar
2. Copia el código
3. Dispositivo B: Ajustes → Sincronizar → Importar
4. Pega el código

### Método 2: Archivo JSON (Completo)
1. Dispositivo A: Ajustes → Exportar Datos
2. Transfiere el archivo JSON
3. Dispositivo B: Ajustes → Importar Datos

### Método 3: Servidor Local (Tiempo Real)
1. Ejecuta `serve -s dist` en un dispositivo
2. Conecta todos a la misma red WiFi
3. Accede desde cada dispositivo a la IP del servidor
4. Los cambios se sincronizan automáticamente

## 📲 Instalar como App

### iPhone
1. Abre Safari
2. Navega a la URL de la app
3. Toca Compartir → "Agregar a pantalla de inicio"

### Android
1. Abre Chrome
2. Navega a la URL de la app
3. Toca menú → "Agregar a pantalla principal"

### Desktop
1. Abre Chrome/Edge
2. Navega a la URL de la app
3. Toca el ícono de instalación en la barra de direcciones

## 🎯 Funcionalidades Clave

### Agregar Equipo
- Toca "+" en navegación inferior
- Llena: Marca, Modelo, Tipo, Estado
- Opcional: Foto, Serie, Ubicación
- Guarda

### Registrar Venta
- Ve a "Ventas" en navegación
- Toca "+" para nueva venta
- Selecciona: Factura/Boleta/Recibo
- Agrega datos del cliente
- Selecciona productos del inventario
- Ingresa precios
- Registra venta

### Buscar Equipos
- Ve a "Inventario"
- Usa la barra de búsqueda
- Busca por marca, modelo o código

### Sincronizar
- Ve a Ajustes (⚙️)
- Toca "Sincronizar"
- Elige Exportar o Importar
- Sigue las instrucciones

## 💡 Consejos

- **Backup regular**: Exporta tus datos periódicamente
- **Fotos claras**: Toma fotos con buena iluminación
- **Códigos únicos**: El sistema genera códigos automáticos
- **Sincronización**: Usa el mismo método en todos los dispositivos
- **PWA**: Instala la app para mejor experiencia

## 🔧 Solución de Problemas

### Pantalla en blanco
- Ejecuta `npm run build` para verificar
- Limpia caché del navegador (Ctrl+Shift+R)

### No guarda datos
- Verifica que el navegador permita localStorage
- No uses modo incógnito

### Cámara no funciona
- Verifica permisos de cámara
- Usa HTTPS (requerido para cámara)
- En iOS, usa Safari

### Scroll no funciona
- Verifica que el CSS esté cargado
- Limpia caché del navegador

## 📊 Estructura de Archivos

```
src/
├── App.tsx           # Aplicación completa
├── types.ts          # Tipos TypeScript
├── index.css         # Estilos
└── utils/
    ├── storage.ts    # Almacenamiento y sincronización
    └── inventory.ts  # Utilidades de inventario
```

## 🎨 Personalización

### Cambiar Colores
Edita `src/index.css` y `src/App.tsx`

### Agregar Campos
Edita `src/types.ts` y los formularios en `src/App.tsx`

### Modificar Cálculos
Edita las funciones en `src/utils/inventory.ts`

## 📞 Soporte

Para problemas o sugerencias, revisa el README.md completo.

---

**¡Listo para usar!** 🎉

La aplicación está completamente funcional y lista para desplegar.
