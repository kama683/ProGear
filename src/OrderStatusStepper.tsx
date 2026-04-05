// ─── OrderStatusStepper ───────────────────────────────────────────────────────
// Displays the 3-stage workflow: Created → In-Use → Returned.
// Validates that status can only advance one step at a time.
import React, { useState } from 'react';
import { CheckCircle2, Clock3, PackageCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import type { Order, OrderStatus } from './types';

const STEPS: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: 'created',  label: 'Создан',     icon: Clock3 },
  { status: 'in-use',   label: 'В аренде',   icon: ArrowRight },
  { status: 'returned', label: 'Возвращён',  icon: PackageCheck },
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  'created':  'var(--status-created)',
  'in-use':   'var(--status-in-use)',
  'returned': 'var(--status-returned)',
};

interface Props {
  order: Order;
  onAdvance: (orderId: string) => void;
}

export const OrderStatusStepper: React.FC<Props> = ({ order, onAdvance }) => {
  const [flash, setFlash] = useState(false);   // validation failure feedback

  const currentIdx = STEPS.findIndex(s => s.status === order.status);
  const isTerminal  = currentIdx === STEPS.length - 1;

  const handleAdvance = () => {
    if (isTerminal) return;
    setFlash(false);
    onAdvance(order.id);
  };

  const handleSkipAttempt = () => {
    // Visual feedback when user tries to skip a stage
    setFlash(true);
    setTimeout(() => setFlash(false), 800);
  };

  return (
    <div
      className="glass rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300"
      style={{
        border: flash
          ? '1px solid var(--log-error)'
          : '1px solid var(--border)',
        boxShadow: flash ? '0 0 16px rgba(248,113,113,0.2)' : 'none',
      }}
    >
      {/* Product info */}
      <div className="flex items-center gap-3">
        {order.productImage && (
          <img
            src={order.productImage}
            alt={order.productName}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            style={{ border: '1px solid var(--border)' }}
          />
        )}
        <div className="min-w-0">
          <p className="font-display font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
            {order.productName}
          </p>
          <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
            {order.renterName} · #{order.id}
          </p>
        </div>
        {/* Live price */}
        <div className="ml-auto text-right flex-shrink-0">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>В сутки</p>
          <p className="font-display font-bold text-sm" style={{ color: 'var(--accent)' }}>
            {order.pricePerDay.toLocaleString('ru-KZ')} ₸
          </p>
        </div>
      </div>

      {/* Stepper track */}
      <div className="relative flex items-center">
        {/* Background track */}
        <div
          className="absolute h-0.5 top-1/2 -translate-y-1/2 left-4 right-4 rounded-full"
          style={{ background: 'var(--border)' }}
        />
        {/* Filled track */}
        <div
          className="absolute h-0.5 top-1/2 -translate-y-1/2 left-4 rounded-full transition-all duration-700 ease-out"
          style={{
            background: STATUS_COLORS[order.status],
            width: currentIdx === 0 ? '0%'
                 : currentIdx === 1 ? 'calc(50% - 1rem)'
                 : 'calc(100% - 2rem)',
            boxShadow: `0 0 8px ${STATUS_COLORS[order.status]}`,
          }}
        />

        {/* Step nodes */}
        <div className="relative z-10 flex w-full justify-between">
          {STEPS.map((step, idx) => {
            const Icon      = step.icon;
            const completed = idx < currentIdx;
            const active    = idx === currentIdx;
            const future    = idx > currentIdx;

            return (
              <div key={step.status} className="flex flex-col items-center gap-1.5">
                {/* Node */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500"
                  style={{
                    background: completed ? STATUS_COLORS[order.status]
                              : active    ? 'var(--accent-dim)'
                              : 'var(--bg-secondary)',
                    border: `2px solid ${
                      completed ? STATUS_COLORS[order.status]
                    : active    ? STATUS_COLORS[order.status]
                    :             'var(--border)'
                    }`,
                    boxShadow: active
                      ? `0 0 12px ${STATUS_COLORS[order.status]}`
                      : 'none',
                  }}
                >
                  {completed
                    ? <CheckCircle2 size={14} style={{ color: '#09090b' }} />
                    : <Icon size={14} style={{ color: active ? STATUS_COLORS[order.status] : 'var(--text-muted)' }} />
                  }
                </div>
                {/* Label */}
                <span
                  className="text-[10px] font-medium text-center"
                  style={{ color: active ? STATUS_COLORS[order.status] : future ? 'var(--text-muted)' : 'var(--text-secondary)' }}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flash warning */}
      {flash && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
          style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--log-error)' }}
        >
          <AlertTriangle size={12} />
          Невозможно пропустить стадию — статусы должны меняться последовательно
        </div>
      )}

      {/* Action footer */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          Обновлён: {new Date(order.updatedAt).toLocaleString('ru-KZ')}
        </span>

        {isTerminal ? (
          <span
            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
            style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--status-returned)', border: '1px solid rgba(99,102,241,0.3)' }}
          >
            <CheckCircle2 size={11} /> Завершён
          </span>
        ) : (
          <div className="flex gap-2">
            {/* Demonstrates validation: clicking "skip to returned" from created triggers error */}
            {order.status === 'created' && (
              <button
                onClick={handleSkipAttempt}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--log-error)',
                         border: '1px solid rgba(248,113,113,0.2)' }}
                title="Демонстрация: нельзя перепрыгнуть стадию"
              >
                Пропустить →
              </button>
            )}
            <button
              onClick={handleAdvance}
              className="btn-accent px-4 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
            >
              Следующий этап
              <ArrowRight size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
