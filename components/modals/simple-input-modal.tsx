import React, { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CRMButton } from '@/components/ui/crm-button';

interface SimpleInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: { label: string; key: string; placeholder?: string; type?: string; options?: string[] }[];
  onSave: (data: any) => void;
  isDark: boolean;
  themeColor: string;
  submitLabel?: string;
}

export const SimpleInputModal = ({ isOpen, onClose, title, fields, onSave, isDark, themeColor, submitLabel = "Salvar" }: SimpleInputModalProps) => {
    const [data, setData] = useState<any>({});

    if (!isOpen) return null;

    const handleChange = (field: string, value: string) => {
        setData({ ...data, [field]: value });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={cn("w-[400px] rounded-xl border shadow-2xl overflow-hidden animate-in zoom-in-95", isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200")}>
                <div className={cn("p-4 border-b flex justify-between items-center", isDark ? "border-zinc-800" : "border-zinc-200")}>
                    <h3 className={cn("font-bold text-sm", isDark ? "text-white" : "text-zinc-900")}>{title}</h3>
                    <CRMButton variant="ghost" size="icon" onClick={onClose} isDark={isDark}><X className="h-4 w-4" /></CRMButton>
                </div>
                <div className="p-6 space-y-4">
                    {fields.map((field: any) => (
                        <div key={field.key}>
                            <label className="text-xs font-medium text-zinc-500 mb-1 block">{field.label}</label>
                            {field.type === 'select' ? (
                                <select 
                                    className={cn("w-full p-2 rounded border text-xs outline-none focus:ring-1", isDark ? "bg-zinc-800 border-zinc-700 focus:ring-zinc-500" : "bg-white border-zinc-300 focus:ring-zinc-400")}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                >
                                    {field.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            ) : (
                                <input 
                                    type={field.type || "text"} 
                                    className={cn("w-full p-2 rounded border text-xs outline-none focus:ring-1", isDark ? "bg-zinc-800 border-zinc-700 focus:ring-zinc-500" : "bg-white border-zinc-300 focus:ring-zinc-400")}
                                    placeholder={field.placeholder}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                />
                            )}
                        </div>
                    ))}
                    <div className="pt-2">
                        <CRMButton themeColor={themeColor} isDark={isDark} className="w-full" onClick={() => { onSave(data); onClose(); }}>{submitLabel}</CRMButton>
                    </div>
                </div>
            </div>
        </div>
    );
};
