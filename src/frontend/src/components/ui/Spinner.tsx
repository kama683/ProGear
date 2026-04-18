interface SpinnerProps { size?: 'sm' | 'md' | 'lg'; white?: boolean; className?: string; }

export function Spinner({ size = 'md', white, className = '' }: SpinnerProps) {
  const cls = ['spinner', size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : '', white ? 'spinner-white' : '', className].filter(Boolean).join(' ');
  return <div className={cls} />;
}

export function LoadingCenter({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className="loading-center">
      <Spinner size={size} />
    </div>
  );
}
