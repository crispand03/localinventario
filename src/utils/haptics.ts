// Haptic feedback for iOS devices
export function hapticLight() {
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
}

export function hapticMedium() {
  if (navigator.vibrate) {
    navigator.vibrate(20);
  }
}

export function hapticHeavy() {
  if (navigator.vibrate) {
    navigator.vibrate([30, 10, 30]);
  }
}

export function hapticSuccess() {
  if (navigator.vibrate) {
    navigator.vibrate([10, 50, 20]);
  }
}

export function hapticError() {
  if (navigator.vibrate) {
    navigator.vibrate([50, 30, 50, 30, 50]);
  }
}

// iOS-specific haptic using Audio API (works on Safari)
export function iosHaptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  try {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    
    oscillator.connect(gain);
    gain.connect(context.destination);
    
    const frequency = style === 'light' ? 150 : style === 'medium' ? 100 : 60;
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.01;
    
    oscillator.start();
    oscillator.stop(context.currentTime + 0.01);
  } catch {
    // Fallback to vibrate
    if (navigator.vibrate) {
      navigator.vibrate(style === 'light' ? 10 : style === 'medium' ? 20 : 30);
    }
  }
}
