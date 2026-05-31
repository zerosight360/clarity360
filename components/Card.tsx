import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export default function Card({ children, className, title, subtitle }: CardProps) {
  return (
    <div className={cn('fb-card p-5', className)}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h3>}
          {subtitle && <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

export function StatCard({ label, value, icon, color = 'blue' }: StatCardProps) {
  return (
    <div className="fb-card p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-[18px]" style={{ background: 'var(--border-light)' }}>
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>{label}</p>
          <p className="text-[20px] font-extrabold leading-tight" style={{ color: 'var(--text-primary)' }}>{value}</p>
        </div>
      </div>
    </div>
  );
}
