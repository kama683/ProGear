import type { ReactNode } from 'react';

interface BadgeProps { children: ReactNode; color?: string; className?: string; }

export function Badge({ children, color = 'badge-gray', className = '' }: BadgeProps) {
  return <span className={`badge ${color} ${className}`}>{children}</span>;
}
