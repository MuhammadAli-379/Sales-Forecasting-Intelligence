import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { motion } from 'motion/react';

interface KPICardProps {
  label: string;
  value: string;
  subtitle?: string;
  change?: {
    value: number;
    suffix?: string;
    isPositiveGood?: boolean;
    periodText?: string;
  };
  icon?: React.ComponentType<{ className?: string }>;
  badgeText?: string;
  accentColor?: 'blue' | 'cyan' | 'emerald' | 'purple' | 'amber';
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  subtitle,
  change,
  icon: Icon,
  badgeText,
  accentColor = 'blue',
}) => {
  const isPositive = change ? change.value > 0 : false;
  const isZero = change ? change.value === 0 : false;
  const isGood = change?.isPositiveGood !== undefined
    ? (isPositive ? change.isPositiveGood : !change.isPositiveGood)
    : isPositive;

  const iconColors = {
    blue: 'text-[#2563EB] bg-[#EFF6FF] border-[#BFDBFE]',
    cyan: 'text-[#0284C7] bg-[#F0F9FF] border-[#BAE6FD]',
    emerald: 'text-[#16A34A] bg-[#F0FDF4] border-[#BBF7D0]',
    purple: 'text-[#7C3AED] bg-[#F5F3FF] border-[#DDD6FE]',
    amber: 'text-[#D97706] bg-[#FFFBEB] border-[#FDE68A]',
  }[accentColor];

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="relative overflow-hidden rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition-all hover:border-[#CBD5E1] hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-[#0F172A] font-mono tabular-nums">
              {value}
            </h3>
          </div>
        </div>

        {Icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${iconColors}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-[#F1F5F9]">
        {change !== undefined ? (
          <div className="flex items-center gap-1 font-mono tabular-nums">
            <span
              className={`inline-flex items-center gap-0.5 font-semibold ${
                isZero
                  ? 'text-[#64748B]'
                  : isGood
                  ? 'text-[#16A34A]'
                  : 'text-[#DC2626]'
              }`}
            >
              {isZero ? (
                <Minus className="h-3 w-3" />
              ) : isPositive ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {isPositive ? '+' : ''}
              {change.value.toFixed(1)}
              {change.suffix || '%'}
            </span>
            {change.periodText && (
              <span className="text-[#64748B] text-[11px] font-sans">
                {change.periodText}
              </span>
            )}
          </div>
        ) : subtitle ? (
          <span className="text-[#64748B] text-[11px] truncate max-w-[200px]">{subtitle}</span>
        ) : (
          <span className="text-[#64748B] text-[11px]">Dynamic series metric</span>
        )}

        {badgeText && (
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
            {badgeText}
          </span>
        )}
      </div>
    </motion.div>
  );
};
