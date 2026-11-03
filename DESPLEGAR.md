# 📤 Guía de Despliegue

## 🚀 Opción 1: Vercel (Recomendado - Gratis)

### Pasos:
1. **Sube tu código a GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```

2. **Conecta con Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Inicia sesión con GitHub
   - Click en "New Project"
   - Selecciona tu repositorio
   - Click en "Deploy"
   - ¡Listo! Tendrás una URL como `https://tu-proyecto.vercel.app`

3. **Actualizaciones automáticas**
   - Cada push a GitHub desplegará automáticamente
   - No necesitas hacer nada más

## 🌐 Opción 2: Netlify (Gratis)

### Pasos:
1. **Compila el proyecto**
   ```bash
   npm run build
   ```

2. **Sube a Netlify**
   - Ve a [netlify.com](https://netlify.com)
   - Arrastra la carpeta `dist/` al dashboard
   - ¡Listo! Tendrás una URL como `https://tu-proyecto.netlify.app`

3. **O conecta con GitHub**
   - Click en "New site from Git"
   - Selecciona tu repositorio
   - Build command: `npm run build`
   - Publish directory: `dist`

## 📘 Opción 3: GitHub Pages (Gratis)

### Pasos:
1. **Instala gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Agrega script en package.json**
   ```json
   "scripts": {
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Despliega**
   ```bash
   npm run build
   npm run deploy
   ```

4. **Activa GitHub Pages**
   - Ve a Settings → Pages
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Tu URL será: `https://TU_USUARIO.github.io/TU_REPOSITORIO`

## 💻 Opción 4: Servidor Local (Para Sincronización)

### Para compartir entre dispositivos en la misma red:

1. **Compila el proyecto**
   ```bash
   npm run build
   ```

2. **Instala serve**
   ```bash
   npm install -g serve
   ```

3. **Inicia el servidor**
   ```bash
   serve -s dist -l 3000
   ```

4. **Encuentra tu IP local**
   - Windows: `ipconfig` → busca "IPv4 Address"
   - Mac/Linux: `ifconfig` o `ip addr` → busca tu IP
   - Ejemplo: `192.168.1.100`

5. **Accede desde otros dispositivos**
   - Conecta todos los dispositivos a la misma red WiFi
   - En cada dispositivo abre: `http://192.168.1.100:3000`
   - Los cambios se sincronizan automáticamente entre pestañas

### Script automático (opcional)
Crea un archivo `start-server.sh`:
```bash
#!/bin/bash
npm run build
echo "Iniciando servidor en http://$(hostname -I | awk '{print $1}'):3000"
serve -s dist -l 3000
```

## 📱 Opción 5: Hosting con Dominio Propio

### Usando cualquier hosting (Hostinger, GoDaddy, etc.):

1. **Compila el proyecto**
   ```bash
   npm run build
   ```

2. **Sube los archivos**
   - Sube todo el contenido de la carpeta `dist/` a tu hosting
   - Asegúrate de que `index.html` esté en la raíz

3. **Configura tu dominio**
   - Apunta tu dominio a la IP del hosting
   - Espera la propagación DNS (puede tardar 24-48 horas)

## 🔄 Sincronización entre Dispositivos

### Método 1: Código de Sincronización
1. **Dispositivo A**: Ajustes → Sincronizar → Exportar
2. Copia el código generado
3. **Dispositivo B**: Ajustes → Sincronizar → Importar
4. Pega el código y confirma

### Método 2: Archivo JSON
1. **Dispositivo A**: Ajustes → Exportar Datos
2. Transfiere el archivo JSON (email, WhatsApp, USB, etc.)
3. **Dispositivo B**: Ajustes → Importar Datos → Seleccionar archivo

### Método 3: Servidor Local (Tiempo Real)
1. Ejecuta `serve -s dist -l 3000` en un dispositivo
2. Conecta todos los dispositivos a la misma red WiFi
3. Accede desde cada dispositivo a `http://IP_DEL_SERVIDOR:3000`
4. Los cambios se sincronizan automáticamente

## 🔐 HTTPS (Requerido para algunas funciones)

### ¿Por qué necesito HTTPS?
- La cámara solo funciona en HTTPS
- Algunas APIs del navegador requieren HTTPS
- Mejor seguridad para tus datos

### Cómo obtener HTTPS gratis:

#### Vercel/Netlify
- ✅ HTTPS automático incluido

#### GitHub Pages
- ✅ HTTPS automático incluido

#### Servidor Local
- Usa [ngrok](https://ngrok.com) para túnel HTTPS:
  ```bash
  ngrok http 3000
  ```
  Te dará una URL HTTPS como `https://abc123.ngrok.io`

#### Dominio Propio
- Usa [Let's Encrypt](https://letsencrypt.org) para certificado gratis
- La mayoría de hostings lo incluyen gratis

## 📊 Comparativa de Opciones

| Opción | Costo | Facilidad | Sincronización | HTTPS |
|--------|-------|-----------|----------------|-------|
| Vercel | Gratis | ⭐⭐⭐⭐⭐ | Manual | ✅ Auto |
| Netlify | Gratis | ⭐⭐⭐⭐⭐ | Manual | ✅ Auto |
| GitHub Pages | Gratis | ⭐⭐⭐⭐ | Manual | ✅ Auto |
| Servidor Local | Gratis | ⭐⭐⭐ | ✅ Tiempo Real | ❌ Manual |
| Hosting Propio | $$$ | ⭐⭐ | Manual | ✅ Manual |

## 🎯 Recomendación

### Para uso personal/equipos pequeños:
**Vercel** - Más fácil, gratis, HTTPS automático

### Para sincronización en tiempo real:
**Servidor Local** - Todos los dispositivos ven los cambios al instante

### Para uso profesional:
**Hosting con dominio propio** - Tu propia URL, control total

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo

# Producción
npm run build            # Compilar para producción
npm run preview          # Vista previa de producción

# Despliegue
npm run deploy           # Desplegar a GitHub Pages (si está configurado)

# Sincronización
serve -s dist -l 3000    # Iniciar servidor local para sincronización
```

## 📞 Soporte

Si tienes problemas con el despliegue:
1. Revisa la consola del navegador (F12)
2. Verifica que todos los archivos estén subidos
3. Limpia caché del navegador
4. Revisa los logs de tu plataforma de despliegue

---

**¡Tu aplicación está lista para el mundo!** 🌍
