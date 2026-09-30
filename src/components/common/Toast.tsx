import React, { useEffect } from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto flex items-center gap-3 rounded-xl border border-[#CBD5E1] bg-white p-3.5 shadow-xl text-xs text-[#0F172A] max-w-sm"
          >
            {toast.type === 'info' ? (
              <Info className="h-4 w-4 text-[#0284C7] shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0" />
            )}
            <div className="flex-1 space-y-0.5">
              <p className="font-semibold text-[#0F172A]">{toast.title}</p>
              {toast.message && <p className="text-[#64748B] text-[11px]">{toast.message}</p>}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#94A3B8] hover:text-[#0F172A] p-0.5 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
