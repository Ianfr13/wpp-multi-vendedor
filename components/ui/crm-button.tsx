import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  themeColor?: string;
  isDark?: boolean;
}

export const CRMButton = ({ 
  variant = 'default', 
  size = 'default', 
  className, 
  children, 
  themeColor = 'indigo', 
  isDark = true, 
  ...props 
}: ButtonProps) => {
  const variants = {
    default: `bg-${themeColor}-600 text-white shadow-sm shadow-${themeColor}-500/25 hover:bg-${themeColor}-500 border border-transparent`,
    secondary: isDark 
      ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700" 
      : "bg-white text-zinc-900 hover:bg-zinc-50 border border-zinc-200 shadow-sm",
    ghost: isDark 
      ? "text-zinc-400 hover:bg-zinc-800 hover:text-white" 
      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
    outline: isDark 
      ? "border border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800" 
      : "border border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20",
  };
  
  const sizes = {
    default: "h-8 px-3 py-1 text-xs",
    sm: "h-7 px-2 text-[10px]",
    lg: "h-10 px-6 text-sm",
    icon: "h-8 w-8 p-0 flex items-center justify-center"
  };

  // Safelist for dynamic classes if needed, or assume tailwind config covers it. 
  // Ideally we would map themeColor to specific classes, but sticking to user code logic.
  
  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant as keyof typeof variants],
        sizes[size as keyof typeof sizes],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
