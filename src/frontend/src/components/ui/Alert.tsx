import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

type AlertType = 'error' | 'success' | 'warning' | 'info';

interface AlertProps { type?: AlertType; children: ReactNode; className?: string; }

const icons = {
  error: <AlertCircle size={16} />,
  success: <CheckCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  info: <Info size={16} />,
};

export function Alert({ type = 'error', children, className = '' }: AlertProps) {
  return (
    <div className={`alert alert-${type} ${className}`}>
      {icons[type]}
      <span>{children}</span>
    </div>
  );
}
