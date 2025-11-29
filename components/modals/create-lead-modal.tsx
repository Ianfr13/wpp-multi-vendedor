import React, { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CRMButton } from '@/components/ui/crm-button';

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  isDark: boolean;
  themeColor: string;
  stages: { id: string; title: string }[];
}

export const CreateLeadModal = ({ isOpen, onClose, onSave, isDark, themeColor, stages }: CreateLeadModalProps) => {
    const [formData, setFormData] = useState({ name: '', value: '', phone: '', stage: stages[0]?.id || 'lead' });
    
    if (!isOpen) return null;

    const handleSubmit = () => {
        onSave(formData);
        onClose();
        setFormData({ name: '', value: '', phone: '', stage: stages[0]?.id || 'lead' });
    };

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={cn("w-[400px] rounded-xl border shadow-2xl overflow-hidden animate-in zoom-in-95", isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200")}>
                <div className={cn("p-4 border-b flex justify-between items-center", isDark ? "border-zinc-800" : "border-zinc-200")}>
                    <h3 className={cn("font-bold text-sm", isDark ? "text-white" : "text-zinc-900")}>Novo Contato no Pipeline</h3>
                    <CRMButton variant="ghost" size="icon" onClick={onClose} isDark={isDark}><X className="h-4 w-4" /></CRMButton>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-medium text-zinc-500 mb-1 block">Nome do Contato</label>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className={cn("w-full p-2 rounded border text-xs outline-none focus:ring-1", isDark ? "bg-zinc-800 border-zinc-700 focus:ring-zinc-500" : "bg-white border-zinc-300 focus:ring-zinc-400")}
                            placeholder="Ex: Empresa X"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-zinc-500 mb-1 block">Valor Estimado</label>
                            <input 
                                type="text" 
                                value={formData.value}
                                onChange={e => setFormData({...formData, value: e.target.value})}
                                className={cn("w-full p-2 rounded border text-xs outline-none focus:ring-1", isDark ? "bg-zinc-800 border-zinc-700 focus:ring-zinc-500" : "bg-white border-zinc-300 focus:ring-zinc-400")}
                                placeholder="R$ 0,00"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-zinc-500 mb-1 block">Telefone</label>
                            <input 
                                type="text" 
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                className={cn("w-full p-2 rounded border text-xs outline-none focus:ring-1", isDark ? "bg-zinc-800 border-zinc-700 focus:ring-zinc-500" : "bg-white border-zinc-300 focus:ring-zinc-400")}
                                placeholder="(00) 00000-0000"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-zinc-500 mb-1 block">Etapa Inicial</label>
                        <select 
                            value={formData.stage}
                            onChange={e => setFormData({...formData, stage: e.target.value})}
                            className={cn("w-full p-2 rounded border text-xs outline-none focus:ring-1", isDark ? "bg-zinc-800 border-zinc-700 focus:ring-zinc-500" : "bg-white border-zinc-300 focus:ring-zinc-400")}
                        >
                            {stages.map((s: any) => (
                                <option key={s.id} value={s.id}>{s.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="pt-2">
                        <CRMButton themeColor={themeColor} isDark={isDark} className="w-full" onClick={handleSubmit}>Criar Contato</CRMButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
