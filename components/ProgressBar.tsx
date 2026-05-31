import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  className?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export default function ProgressBar({ value, className, color = 'blue', showLabel = true, size = 'md' }: ProgressBarProps) {
  const colors = {
    blue: 'bg-[#0095f6]',
    green: 'bg-[#58c322]',
    purple: 'bg-[#833ab4]',
    orange: 'bg-[#fd1d1d]',
  };

  const sizeClasses = { sm: 'h-[3px]', md: 'h-[6px]' };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1.5">
          <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Progress</span>
          <span className="text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>{value}%</span>
        </div>
      )}
      <div className={cn('w-full rounded-full overflow-hidden', sizeClasses[size])} style={{ background: 'var(--border-light)' }}>
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', colors[color])}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
