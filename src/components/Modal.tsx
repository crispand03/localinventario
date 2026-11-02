import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useIsMobile } from '../hooks/useDevice';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
}

export default function Modal({ isOpen, onClose, title, children, size = 'md', showCloseButton = true }: ModalProps) {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    full: 'max-w-4xl',
  };

  if (isMobile) {
    // Mobile: Bottom sheet style
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
        <div 
          className="w-full bg-white rounded-t-3xl max-h-[90vh] flex flex-col animate-slide-up shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              {title && <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>}
              {showCloseButton && (
                <button 
                  onClick={onClose} 
                  className="p-2 -mr-2 text-gray-400 hover:text-gray-600 active:bg-gray-100 rounded-xl tap-target flex items-center justify-center transition-colors"
                >
                  <X size={24} />
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 pb-safe">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Desktop: Centered modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4" onClick={onClose}>
      <div 
        className={`w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col animate-scale-in`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
            {title && <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>}
            {showCloseButton && (
              <button 
                onClick={onClose} 
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 active:bg-gray-100 rounded-xl transition-all hover:scale-110"
              >
                <X size={24} />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
