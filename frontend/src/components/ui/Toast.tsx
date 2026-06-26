import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: 'border-success/30 bg-success/10',
  error: 'border-error/30 bg-error/10',
  warning: 'border-warning/30 bg-warning/10',
  info: 'border-primary/30 bg-primary-light',
};

const iconColors = {
  success: 'text-success',
  error: 'text-error',
  warning: 'text-warning',
  info: 'text-primary',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={`
              flex items-start gap-3 p-4 rounded-2xl border shadow-lg
              animate-slide-in-right backdrop-blur-sm
              ${styles[toast.type]}
            `}
          >
            <Icon size={20} className={`flex-shrink-0 mt-0.5 ${iconColors[toast.type]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-text-secondary mt-0.5">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-0.5 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
