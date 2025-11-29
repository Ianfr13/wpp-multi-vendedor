'use client';
import { Bell, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCRMTheme } from '@/providers/crm-theme-provider';

export const CRMHeader = ({ title }: { title: string }) => {
    const { themeColor, isDark } = useCRMTheme();
    return (
        <header className={cn(
            "h-12 px-6 flex items-center justify-between border-b backdrop-blur-sm transition-colors shrink-0",
            isDark ? "border-zinc-800/50" : "border-zinc-200 bg-white/50"
        )}>
             <div className="flex items-center gap-2 text-xs font-medium">
               <span className="text-zinc-500">Workspace</span>
               <ChevronRight className="h-3 w-3 text-zinc-500" />
               <span className={cn("capitalize", isDark ? "text-white" : "text-zinc-900")}>{title}</span>
             </div>
             <div className="flex items-center gap-3">
                <div className="relative cursor-pointer">
                  <Bell className="h-4 w-4 text-zinc-500 hover:text-foreground transition-colors" />
                  <span className={`absolute top-0 right-0 h-1.5 w-1.5 bg-${themeColor}-500 rounded-full`}></span>
                </div>
             </div>
        </header>
    )
}
