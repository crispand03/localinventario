import { HelpCircle } from 'lucide-react';
import { useState } from 'react';
import HelpTooltip from './HelpTooltip';

interface FloatingHelpButtonProps {
  tooltips: Array<{
    id: string;
    title: string;
    message: string;
    icon?: string;
  }>;
}

export default function FloatingHelpButton({ tooltips }: FloatingHelpButtonProps) {
  const [showTooltips, setShowTooltips] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowTooltips(true)}
        className="fixed bottom-24 right-4 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform z-30 hover:bg-blue-700"
        title="Ayuda"
      >
        <HelpCircle size={24} />
      </button>

      <HelpTooltip
        tooltips={tooltips}
        showOnFirstVisit={false}
      />

      {showTooltips && (
        <HelpTooltip
          tooltips={tooltips}
          showOnFirstVisit={false}
        />
      )}
    </>
  );
}
