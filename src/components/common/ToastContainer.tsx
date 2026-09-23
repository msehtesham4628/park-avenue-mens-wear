import React from 'react';
import { useShop } from '../../context/ShopContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useShop();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 shadow-2xl border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'bg-[#12141A]/95 border-[#C5A880]/60 text-[#FAF8F5]'
                : isError
                ? 'bg-[#181113]/95 border-red-500/50 text-red-200'
                : 'bg-[#12141A]/95 border-white/10 text-[#EBE8E3]'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />}
            {isError && <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
            {!isSuccess && !isError && <Info className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs leading-relaxed font-sans">
              {toast.message}
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="text-[#9E9B95] hover:text-white shrink-0 p-0.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
