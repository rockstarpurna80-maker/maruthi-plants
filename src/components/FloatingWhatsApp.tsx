import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { NURSERY_PHONE, NURSERY_NAME } from '../utils/whatsapp';

export const FloatingWhatsApp: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {/* Tooltip speech bubble */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-stone-900 text-white text-xs px-3.5 py-2 rounded-2xl shadow-xl border border-stone-800 animate-in fade-in slide-in-from-right-4 duration-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Order or enquire on WhatsApp: <strong>+91 9515369395</strong></span>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-stone-400 hover:text-white p-0.5"
            aria-label="Dismiss tooltip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Button */}
      <a
        href={`https://wa.me/${NURSERY_PHONE}?text=${encodeURIComponent('Hello Maruthi Nursery! I am browsing your website and would like to order plants / enquire about visiting Malladi.')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-700/50 hover:scale-110 active:scale-95 transition-all duration-300 group"
        aria-label="Direct WhatsApp chat with Maruthi Nursery"
      >
        <MessageCircle className="w-7 h-7 fill-current" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-ping"></span>
      </a>
    </div>
  );
};
