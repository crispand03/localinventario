import { useState, useEffect } from 'react';
import { ArrowUp, Mouse } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      
      setScrollProgress(progress);
      
      if (scrollTop > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('wheel', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-32 right-4 flex flex-col gap-2 z-30 animate-fade-in">
      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all hover:bg-blue-700 hover:shadow-xl group"
        aria-label="Volver arriba"
        title="Ir arriba (también puedes usar la rueda del mouse)"
      >
        <ArrowUp size={24} className="group-hover:-translate-y-0.5 transition-transform" />
      </button>

      {/* Scroll indicator */}
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-200 relative overflow-hidden" title="Progreso de scroll">
        <div 
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-300 transition-all duration-300"
          style={{ height: `${scrollProgress}%` }}
        />
        <Mouse size={20} className="text-gray-600 relative z-10" />
      </div>

      {/* Scroll to bottom button */}
      <button
        onClick={scrollToBottom}
        className="w-12 h-12 bg-gray-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all hover:bg-gray-700 hover:shadow-xl group"
        aria-label="Ir al final"
        title="Ir al final"
      >
        <ArrowUp size={24} className="rotate-180 group-hover:translate-y-0.5 transition-transform" />
      </button>
    </div>
  );
}
