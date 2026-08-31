import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage, ToastState } from '../types';

interface ToastProps {
  toast?: ToastState;
  onClose?: () => void;
  toasts?: ToastMessage[];
  onDismiss?: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast || !toast.isVisible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-md ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100'
              : toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/40 text-rose-100'
              : toast.type === 'warning'
              ? 'bg-amber-950/90 border-amber-500/40 text-amber-100'
              : 'bg-slate-900/90 border-slate-700/60 text-slate-100'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
          {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold leading-tight font-mono">{toast.title}</p>
            {toast.description && (
              <p className="text-[11px] mt-1 opacity-80 leading-relaxed font-mono break-all">
                {toast.description}
              </p>
            )}
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export const ToastContainer: React.FC<ToastProps> = ({ toasts = [], onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md ${
              t.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100'
                : t.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-100'
                : t.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/40 text-amber-100'
                : 'bg-slate-900/90 border-slate-700/60 text-slate-100'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {t.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold leading-tight font-mono">{t.title}</p>
              {t.description && (
                <p className="text-[11px] mt-1 opacity-80 leading-relaxed font-mono break-all">{t.description}</p>
              )}
            </div>

            {onDismiss && (
              <button
                onClick={() => onDismiss(t.id)}
                className="text-slate-400 hover:text-slate-200 transition-colors p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
