import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

// global counter so each toast gets a unique id
let toastCounter = 0;

// static icons — no point recreating these every render
const toastIcons: Record<ToastType, ReactNode> = {
  success: <CheckCircle size={16} color="var(--color-success)" />,
  error: <XCircle size={16} color="var(--color-danger)" />,
  warning: <AlertTriangle size={16} color="var(--color-warning)" />,
  info: <Info size={16} color="var(--color-primary)" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function dismiss(id: number) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  const toast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = ++toastCounter;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => dismiss(id), 4500);
  }, []);

  // shortcut helpers so you don't have to pass the type every time
  const success = (title: string, msg?: string) => toast('success', title, msg);
  const error = (title: string, msg?: string) => toast('error', title, msg);
  const warning = (title: string, msg?: string) => toast('warning', title, msg);
  const info = (title: string, msg?: string) => toast('info', title, msg);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon">{toastIcons[t.type]}</span>
            <div className="toast-body">
              <div className="toast-title">{t.title}</div>
              {t.message && <div className="toast-message">{t.message}</div>}
            </div>
            <button className="toast-dismiss" onClick={() => dismiss(t.id)}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
