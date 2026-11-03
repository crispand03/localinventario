# InventarioPro - Gestión de Equipos

Aplicación PWA completa para gestión de inventario de equipos y ventas, con sincronización local entre dispositivos.

## 🚀 Características

### ✅ Funcionalidades Principales
- **Gestión de Inventario**: Agregar, editar y eliminar equipos
- **Sistema de Ventas**: Crear facturas, boletas y recibos
- **Cálculo Automático**: IGV (18%) y totales
- **Captura de Fotos**: Tomar fotos de equipos con la cámara
- **Códigos de Inventario**: Generación automática de códigos únicos
- **Búsqueda**: Búsqueda rápida por marca, modelo o código

### 🔄 Sincronización Local
- **Exportar/Importar datos**: Comparte datos entre dispositivos usando códigos
- **Sincronización en tiempo real**: Los cambios se reflejan instantáneamente entre pestañas
- **Almacenamiento local**: Los datos se guardan en localStorage
- **Backup**: Exporta tus datos a archivo JSON

### 📱 Responsive Design
- **Mobile-first**: Optimizado para teléfonos móviles
- **iPhone compatible**: Soporte para notch y Dynamic Island
- **Android compatible**: Funciona en todos los dispositivos Android
- **Desktop ready**: Interfaz adaptable para pantallas grandes
- **Scroll natural**: Funciona con rueda del mouse, touch y trackpad

### 💰 Moneda
- **Soles Peruanos (PEN)**: Todos los precios en moneda local
- **Formato profesional**: Formato de moneda peruano

## 🛠️ Tecnologías

- **React 18** con TypeScript
- **Vite** - Build tool ultrarrápido
- **Tailwind CSS** - Estilos utilitarios
- **Lucide React** - Iconos modernos
- **LocalStorage** - Persistencia de datos
- **PWA** - Progressive Web App

## 📦 Instalación y Uso

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de producción
npm run preview
```

### Despliegue

#### Opción 1: Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel
```

#### Opción 2: Netlify
```bash
# Compilar
npm run build

# Subir la carpeta dist/ a Netlify
```

#### Opción 3: GitHub Pages
```bash
# Compilar
npm run build

# Subir la carpeta dist/ a tu repositorio
# Configurar GitHub Pages para usar la rama gh-pages
```

#### Opción 4: Servidor Local (Para sincronización entre dispositivos)
```bash
# Compilar
npm run build

# Instalar serve
npm i -g serve

# Iniciar servidor
serve -s dist -l 3000

# Acceder desde otros dispositivos en la misma red
# http://TU_IP_LOCAL:3000
```

## 🔄 Sincronización entre Dispositivos

### Método 1: Código de Sincronización
1. En el dispositivo origen: Ajustes → Sincronizar → Exportar
2. Copiar el código generado
3. En el dispositivo destino: Ajustes → Sincronizar → Importar
4. Pegar el código y confirmar

### Método 2: Archivo JSON
1. Exportar: Ajustes → Exportar Datos
2. Transferir el archivo JSON al otro dispositivo
3. Importar: Ajustes → Importar Datos → Seleccionar archivo

### Método 3: Servidor Local (Tiempo Real)
1. Ejecutar `serve -s dist -l 3000` en un dispositivo
2. Conectar todos los dispositivos a la misma red WiFi
3. Acceder desde cada dispositivo a `http://IP_DEL_SERVIDOR:3000`
4. Los cambios se sincronizan automáticamente entre pestañas

## 📱 Instalar como PWA

### En iPhone/iPad
1. Abrir Safari y navegar a la URL de la app
2. Tocar el botón Compartir (cuadrado con flecha)
3. Desplazar hacia abajo y tocar "Agregar a pantalla de inicio"
4. Confirmar tocando "Agregar"

### En Android
1. Abrir Chrome y navegar a la URL de la app
2. Tocar el menú (tres puntos)
3. Seleccionar "Agregar a pantalla principal"
4. Confirmar tocando "Agregar"

### En Desktop (Chrome/Edge)
1. Navegar a la URL de la app
2. Tocar el ícono de instalación en la barra de direcciones
3. Confirmar la instalación

## 🎯 Uso Básico

### Agregar un Equipo
1. Tocar el botón "+" azul en la navegación inferior
2. Llenar los campos: Marca, Modelo, Tipo, Estado
3. Opcionalmente tomar una foto del equipo
4. Tocar "Guardar"

### Registrar una Venta
1. Ir a la pestaña "Ventas" en la navegación
2. Tocar "+" para nueva venta
3. Seleccionar tipo de comprobante (Factura/Boleta/Recibo)
4. Ingresar datos del cliente
5. Agregar productos del inventario
6. Ingresar precios y cantidades
7. Tocar "Registrar Venta"

### Sincronizar Datos
1. Ir a Ajustes (ícono de engranaje)
2. Seleccionar "Sincronizar"
3. Elegir Exportar o Importar
4. Seguir las instrucciones en pantalla

## 🔧 Estructura del Proyecto

```
src/
├── App.tsx              # Componente principal con todas las vistas
├── main.tsx             # Punto de entrada
├── index.css            # Estilos globales
├── types.ts             # Definiciones de tipos TypeScript
└── utils/
    ├── storage.ts       # Funciones de almacenamiento y sincronización
    └── inventory.ts     # Utilidades para inventario
```

## 📊 Tipos de Datos

### Equipment (Equipo)
- id, inventoryCode, type, brand, model
- serialNumber, status, assignedTo, location
- purchaseDate, warrantyEnd, notes, photo

### Sale (Venta)
- id, documentNumber, documentType
- customer, items, subtotal, igv, total
- paymentMethod, notes, date

## 🌐 Compatibilidad

### Navegadores Soportados
- ✅ Chrome/Edge (Desktop y Mobile)
- ✅ Safari (iOS y macOS)
- ✅ Firefox (Desktop)
- ✅ Samsung Internet (Android)

### Dispositivos Probados
- ✅ iPhone (iOS 13+)
- ✅ Android (Chrome 80+)
- ✅ iPad (iPadOS 13+)
- ✅ Windows (Chrome, Edge)
- ✅ macOS (Safari, Chrome)
- ✅ Linux (Chrome, Firefox)

## 🔒 Privacidad y Seguridad

- **Datos locales**: Toda la información se almacena en tu dispositivo
- **Sin servidor**: No se envían datos a servidores externos
- **Sincronización opcional**: Solo compartes datos cuando tú lo decides
- **Código abierto**: Puedes auditar todo el código

## 🐛 Solución de Problemas

### La pantalla se ve en blanco
- Verificar que el proyecto esté compilado correctamente (`npm run build`)
- Limpiar caché del navegador
- Verificar consola del navegador (F12) para errores

### Los datos no se sincronizan
- Asegurar que ambos dispositivos estén en la misma red (si usas servidor local)
- Verificar que el código de sincronización esté completo
- Intentar exportar/importar usando archivo JSON

### La cámara no funciona
- Verificar permisos de cámara en el navegador
- En iOS, usar Safari (otros navegadores pueden tener limitaciones)
- Asegurar que el sitio use HTTPS (requerido para cámara)

### El scroll no funciona con la rueda del mouse
- Verificar que el CSS esté cargado correctamente
- Limpiar caché del navegador
- Verificar que no haya extensiones bloqueando el scroll

## 📝 Licencia

Este proyecto es de código abierto y libre uso.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para contribuir:
1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📞 Soporte

Para reportar problemas o solicitar características, abrir un issue en el repositorio.

---

**InventarioPro v3.0** - Gestión inteligente de equipos y ventas
