import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  initials: string;
  color?: string;
  themeColor?: string;
  size?: 'sm' | 'md' | 'xl';
  src?: string;
  className?: string;
}

export const CRMAvatar = ({ initials, color, themeColor = 'indigo', size = 'md', src, className }: AvatarProps) => {
    const sizeClasses = {
        sm: "h-6 w-6 text-[9px]",
        md: "h-8 w-8 text-[10px]",
        xl: "h-16 w-16 text-xl"
    };
    
    return (
        <div className={cn(
            "rounded-full flex items-center justify-center font-bold text-white shadow-inner shrink-0 overflow-hidden relative", 
            sizeClasses[size], 
            !src && (color || `bg-${themeColor}-600`),
            className
        )}>
            {src ? <img src={src} alt="Avatar" className="w-full h-full object-cover" /> : initials}
        </div>
    );
};
