import { useState, useEffect } from 'react';
import { Mouse, X } from 'lucide-react';

export default function ScrollHint() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasSeenHint, setHasSeenHint] = useState(false);

  useEffect(() => {
    // Check if user has seen the hint before
    const seen = localStorage.getItem('hasSeenScrollHint');
    if (seen) {
      setHasSeenHint(true);
      return;
    }

    // Show hint after 2 seconds if on desktop
    const isDesktop = window.innerWidth >= 769;
    if (isDesktop) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setHasSeenHint(true);
    localStorage.setItem('hasSeenScrollHint', 'true');
  };

  if (!isVisible || hasSeenHint) return null;

  return (
    <div className="fixed bottom-48 left-1/2 -translate-x-1/2 z-40 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm border-2 border-blue-200 relative">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center animate-bounce">
              <Mouse size={32} className="text-blue-600" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              ¡Usa la rueda del mouse!
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Puedes desplazarte por la página usando la rueda del mouse o el trackpad. 
              También puedes hacer clic en los botones de navegación rápida.
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleClose}
            className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all"
          >
            Entendido
          </button>
        </div>

        {/* Animated arrow pointing down */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-blue-200 transform rotate-45" />
      </div>
    </div>
  );
}
