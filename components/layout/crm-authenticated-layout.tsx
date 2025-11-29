'use client';
import { CRMSidebar } from './crm-sidebar';
import { CRMHeader } from './crm-header';
import { cn } from '@/lib/utils';
import { useCRMTheme } from '@/providers/crm-theme-provider';

export const CRMAuthenticatedLayout = ({ children, title }: { children: React.ReactNode, title: string }) => {
    const { themeColor, isDark } = useCRMTheme();
    
    return (
        <div className={cn(
          "flex h-screen w-full font-sans transition-colors duration-500 selection:bg-opacity-30 text-sm overflow-hidden",
          `selection:bg-${themeColor}-500`,
          isDark ? "bg-zinc-950 text-zinc-50" : "bg-zinc-50 text-zinc-900"
        )}>
          <div className="relative z-10 flex w-full h-full">
            <CRMSidebar />
            
            <main className="flex-1 flex flex-col min-w-0 h-full relative">
              <CRMHeader title={title} />
    
              <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                 {children}
              </div>
            </main>
          </div>
        </div>
    )
}
