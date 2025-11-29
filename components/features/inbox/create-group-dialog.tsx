import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CRMButton } from '@/components/ui/crm-button';

interface CreateGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, participants: string[]) => void;
  isDark: boolean;
  themeColor: string;
}

export const CreateGroupDialog = ({ isOpen, onClose, onCreate, isDark, themeColor }: CreateGroupDialogProps) => {
    const [groupName, setGroupName] = useState('');
    const [currentNumber, setCurrentNumber] = useState('');
    const [participants, setParticipants] = useState<string[]>([]);

    if (!isOpen) return null;

    const handleAddParticipant = () => {
        if (currentNumber.trim()) {
            setParticipants([...participants, currentNumber.trim()]);
            setCurrentNumber('');
        }
    };

    const handleRemoveParticipant = (index: number) => {
        setParticipants(participants.filter((_, i) => i !== index));
    };

    const handleCreate = () => {
        if (groupName.trim() && participants.length > 0) {
            onCreate(groupName, participants);
            setGroupName('');
            setParticipants([]);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={cn("w-[450px] rounded-xl border shadow-2xl overflow-hidden animate-in zoom-in-95", isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200")}>
                <div className={cn("p-4 border-b flex justify-between items-center", isDark ? "border-zinc-800" : "border-zinc-200")}>
                    <h3 className={cn("font-bold text-sm", isDark ? "text-white" : "text-zinc-900")}>Criar Novo Grupo</h3>
                    <CRMButton variant="ghost" size="icon" onClick={onClose} isDark={isDark}><X className="h-4 w-4" /></CRMButton>
                </div>
                <div className="p-6 space-y-4">
                    
                    {/* Nome do Grupo */}
                    <div>
                        <label className="text-xs font-medium text-zinc-500 mb-1 block">Nome do Grupo</label>
                        <input 
                            type="text" 
                            className={cn("w-full p-2 rounded border text-xs outline-none focus:ring-1", isDark ? "bg-zinc-800 border-zinc-700 focus:ring-zinc-500 text-white" : "bg-white border-zinc-300 focus:ring-zinc-400")}
                            placeholder="Ex: Vendas Setembro"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                    </div>

                    {/* Adicionar Participantes */}
                    <div>
                        <label className="text-xs font-medium text-zinc-500 mb-1 block">Adicionar Participante (Número)</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                className={cn("flex-1 p-2 rounded border text-xs outline-none focus:ring-1", isDark ? "bg-zinc-800 border-zinc-700 focus:ring-zinc-500 text-white" : "bg-white border-zinc-300 focus:ring-zinc-400")}
                                placeholder="Ex: 5511999999999"
                                value={currentNumber}
                                onChange={(e) => setCurrentNumber(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddParticipant()}
                            />
                            <CRMButton themeColor={themeColor} isDark={isDark} onClick={handleAddParticipant}>
                                <Plus className="h-4 w-4" />
                            </CRMButton>
                        </div>
                    </div>

                    {/* Lista de Participantes */}
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        <label className="text-xs font-medium text-zinc-500 block">Participantes ({participants.length})</label>
                        {participants.length === 0 && (
                            <p className="text-xs text-zinc-500 italic">Nenhum participante adicionado.</p>
                        )}
                        {participants.map((p, i) => (
                            <div key={i} className={cn("flex justify-between items-center p-2 rounded border text-xs", isDark ? "bg-zinc-800/50 border-zinc-800 text-zinc-300" : "bg-zinc-50 border-zinc-200 text-zinc-700")}>
                                <span>{p}</span>
                                <button onClick={() => handleRemoveParticipant(i)} className="text-red-500 hover:text-red-600">
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="pt-2">
                        <CRMButton 
                            themeColor={themeColor} 
                            isDark={isDark} 
                            className="w-full" 
                            onClick={handleCreate}
                            disabled={!groupName.trim() || participants.length === 0}
                        >
                            Criar Grupo
                        </CRMButton>
                    </div>
                </div>
            </div>
        </div>
    );
};