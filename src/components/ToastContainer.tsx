import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { Toast } from '../hooks/useToast';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const icons = {
  success: <CheckCircle2 size={14} className="text-emerald-400" />,
  error: <AlertCircle size={14} className="text-red-400" />,
  info: <Info size={14} className="text-cyan-400" />,
};

const styles = {
  success: 'border-emerald-500/30 bg-emerald-950/40',
  error: 'border-red-500/30 bg-red-950/40',
  info: 'border-cyan-500/30 bg-cyan-950/40',
};

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg ${styles[toast.type]}`}
          >
            {icons[toast.type]}
            <span className="text-xs text-slate-200 flex-1">{toast.message}</span>
            <button onClick={() => onRemove(toast.id)} className="text-slate-500 hover:text-slate-300 cursor-pointer">
              <X size={12} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
