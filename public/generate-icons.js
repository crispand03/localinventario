// Script to generate PWA icons dynamically
(function() {
  function generateIcon(size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Background
    const radius = size * 0.16;
    ctx.fillStyle = '#1e40af';
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, radius);
    ctx.fill();
    
    // Laptop body
    const lw = size * 0.42;
    const lh = size * 0.28;
    const lx = size * 0.15;
    const ly = size * 0.25;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = size * 0.02;
    ctx.beginPath();
    ctx.roundRect(lx, ly, lw, lh, size * 0.02);
    ctx.stroke();
    
    // Screen
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(lx + size*0.03, ly + size*0.03, lw - size*0.06, lh - size*0.06);
    
    // Laptop base
    ctx.fillStyle = 'white';
    ctx.fillRect(lx - size*0.02, ly + lh, lw + size*0.04, size * 0.025);
    
    // Monitor
    const mx = size * 0.55;
    const my = size * 0.3;
    const mw = size * 0.28;
    const mh = size * 0.35;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = size * 0.018;
    ctx.beginPath();
    ctx.roundRect(mx, my, mw, mh, size * 0.015);
    ctx.stroke();
    
    // Monitor stand
    ctx.fillStyle = 'white';
    ctx.fillRect(mx + mw * 0.35, my + mh, mw * 0.3, size * 0.04);
    ctx.fillRect(mx + mw * 0.2, my + mh + size * 0.04, mw * 0.6, size * 0.02);
    
    // Monitor dot
    ctx.beginPath();
    ctx.arc(mx + mw/2, my + mh - size*0.02, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
    
    return canvas.toDataURL('image/png');
  }
  
  // Generate icons when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    const icon192 = generateIcon(192);
    const icon512 = generateIcon(512);
    
    // Update link tags
    const appleTouch = document.querySelector('link[rel="apple-touch-icon"]');
    if (appleTouch) appleTouch.href = icon192;
    
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) favicon.href = icon192;
    
    // Store for manifest
    window.__pwaIcons = { icon192, icon512 };
  });
})();
