// ─── LoggerConsole ────────────────────────────────────────────────────────────
// Terminal-style log viewer that mirrors entries from the log stream.
// Each entry is colour-coded by level and shows its data source.
import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Trash2, Download, ChevronDown } from 'lucide-react';
import type { LogEntry } from './types';

const LEVEL_LABELS: Record<LogEntry['level'], string> = {
  info:    'INFO',
  warn:    'WARN',
  error:   'ERR ',
  success: ' OK ',
  cache:   'CACHE',
};

const SOURCE_BADGES: Record<LogEntry['source'], { label: string; color: string }> = {
  cache:    { label: '⚡ CACHE',    color: 'var(--log-cache)' },
  database: { label: '🗄 DATABASE', color: 'var(--log-info)' },
  system:   { label: '⚙ SYSTEM',   color: 'var(--text-secondary)' },
  user:     { label: '👤 USER',     color: 'var(--log-success)' },
};

interface Props {
  logs: LogEntry[];
  onClear: () => void;
}

export const LoggerConsole: React.FC<Props> = ({ logs, onClear }) => {
  const bottomRef  = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState<LogEntry['level'] | 'all'>('all');

  // Auto-scroll to newest log
  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filtered = filter === 'all' ? logs : logs.filter(l => l.level === filter);

  const handleExport = () => {
    const text = logs
      .map(l => `[${new Date(l.timestamp).toISOString()}] [${l.level.toUpperCase()}] [${l.source}] ${l.message}`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `progear-log-${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="glass flex flex-col rounded-2xl overflow-hidden"
      style={{ border: '1px solid var(--border)', height: '100%' }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--border)' }}
      >
        {/* Window controls */}
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ background: '#f87171' }} />
          <span className="w-3 h-3 rounded-full" style={{ background: '#fbbf24' }} />
          <span className="w-3 h-3 rounded-full" style={{ background: '#4ade80' }} />
        </div>

        <Terminal size={13} style={{ color: 'var(--accent)' }} />
        <span className="text-xs font-display font-semibold" style={{ color: 'var(--accent)' }}>
          ProGear · System Log
        </span>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5 ml-1">
          <div className="pulse-dot" />
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>LIVE</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Filter */}
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as typeof filter)}
            className="text-[10px] px-2 py-1 rounded-md outline-none cursor-pointer"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                     border: '1px solid var(--border)' }}
          >
            <option value="all">Все уровни</option>
            <option value="info">INFO</option>
            <option value="warn">WARN</option>
            <option value="error">ERROR</option>
            <option value="success">SUCCESS</option>
            <option value="cache">CACHE</option>
          </select>

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(v => !v)}
            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md transition-colors"
            style={{
              background: autoScroll ? 'var(--accent-dim)' : 'var(--bg-secondary)',
              color:      autoScroll ? 'var(--accent)'     : 'var(--text-secondary)',
              border:     '1px solid var(--border)',
            }}
            title="Toggle auto-scroll"
          >
            <ChevronDown size={10} /> Auto
          </button>

          <button onClick={handleExport} title="Export log.txt"
            className="p-1.5 rounded-md transition-opacity hover:opacity-80"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
          >
            <Download size={11} style={{ color: 'var(--text-secondary)' }} />
          </button>

          <button onClick={onClear} title="Clear logs"
            className="p-1.5 rounded-md transition-opacity hover:opacity-80"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
          >
            <Trash2 size={11} style={{ color: 'var(--log-error)' }} />
          </button>
        </div>
      </div>

      {/* Log body */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-0.5"
        style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace", fontSize: '11px' }}
      >
        {filtered.length === 0 && (
          <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            — no log entries —
          </p>
        )}

        {filtered.map((log, i) => {
          const src = SOURCE_BADGES[log.source];
          return (
            <div
              key={log.id}
              className="flex items-start gap-2 py-1 px-2 rounded-md transition-colors duration-100 group"
              style={{ animationDelay: `${i * 20}ms` }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            >
              {/* Timestamp */}
              <span className="flex-shrink-0 opacity-40 mt-px" style={{ color: 'var(--text-secondary)' }}>
                {new Date(log.timestamp).toLocaleTimeString('ru-KZ', { hour12: false })}
              </span>

              {/* Level badge */}
              <span
                className={`flex-shrink-0 font-bold log-${log.level} mt-px`}
                style={{ minWidth: '2.5rem' }}
              >
                [{LEVEL_LABELS[log.level]}]
              </span>

              {/* Source badge */}
              <span
                className="flex-shrink-0 text-[9px] px-1.5 py-0.5 rounded mt-px"
                style={{ background: `${src.color}18`, color: src.color, border: `1px solid ${src.color}44` }}
              >
                {src.label}
              </span>

              {/* Message */}
              <span className="flex-1 break-words" style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {log.message}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Status bar */}
      <div
        className="flex items-center justify-between px-4 py-2 text-[10px] flex-shrink-0"
        style={{ background: 'rgba(0,0,0,0.3)', borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}
      >
        <span>{filtered.length} из {logs.length} записей</span>
        <span>ProGear Log Viewer v1.0</span>
      </div>
    </div>
  );
};
