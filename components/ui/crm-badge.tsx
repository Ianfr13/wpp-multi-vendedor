import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'neutral';
  themeColor?: string;
  isDark?: boolean;
  className?: string;
}

export const CRMBadge = ({ children, variant = 'default', themeColor = 'indigo', isDark = true, className }: BadgeProps) => {
  const styles = {
    default: `bg-${themeColor}-500/10 text-${themeColor}-500 border-${themeColor}-500/20`,
    success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    neutral: isDark ? "bg-zinc-800 text-zinc-400 border-zinc-700" : "bg-zinc-100 text-zinc-600 border-zinc-200"
  };
  return (
    <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-medium border uppercase tracking-wider", styles[variant], className)}>
      {children}
    </span>
  );
};
