import { useState, useEffect } from 'react';
import { X, HelpCircle } from 'lucide-react';

interface Tooltip {
  id: string;
  title: string;
  message: string;
  icon?: string;
}

interface HelpTooltipProps {
  tooltips: Tooltip[];
  showOnFirstVisit?: boolean;
}

export default function HelpTooltip({ tooltips, showOnFirstVisit = true }: HelpTooltipProps) {
  const [currentTooltip, setCurrentTooltip] = useState<Tooltip | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showOnFirstVisit && tooltips.length > 0) {
      const hasSeenHelp = localStorage.getItem('hasSeenHelp');
      if (!hasSeenHelp) {
        setTimeout(() => {
          setCurrentTooltip(tooltips[0]);
          setIsVisible(true);
          localStorage.setItem('hasSeenHelp', 'true');
        }, 1000);
      }
    }
  }, [showOnFirstVisit, tooltips]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setCurrentTooltip(null), 300);
  };

  const handleNext = () => {
    if (!currentTooltip) return;
    const currentIndex = tooltips.findIndex(t => t.id === currentTooltip.id);
    if (currentIndex < tooltips.length - 1) {
      setCurrentTooltip(tooltips[currentIndex + 1]);
    } else {
      handleClose();
    }
  };

  if (!currentTooltip || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-in">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {currentTooltip.icon && (
              <span className="text-4xl">{currentTooltip.icon}</span>
            )}
            <h3 className="text-xl font-bold text-gray-900">{currentTooltip.title}</h3>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 -mr-2 -mt-2 text-gray-400 hover:text-gray-600 active:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6 leading-relaxed">{currentTooltip.message}</p>
        
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold active:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
          {tooltips.findIndex(t => t.id === currentTooltip.id) < tooltips.length - 1 && (
            <button
              onClick={handleNext}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold active:bg-blue-700 transition-colors"
            >
              Siguiente
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook para mostrar ayuda
export function useHelpTooltips() {
  const [showHelp, setShowHelp] = useState(false);

  const triggerHelp = () => {
    setShowHelp(true);
  };

  return { showHelp, triggerHelp, setShowHelp };
}
