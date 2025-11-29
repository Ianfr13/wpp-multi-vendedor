'use client';
import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  MessageCircle, 
  Mail, 
  Instagram, 
  Facebook, 
  MessageSquare, 
  Search, 
  Phone, 
  MoreVertical, 
  CheckCircle2, 
  Send, 
  FileText, 
  Edit2, 
  Globe,
  RefreshCw,
  Check,
  CheckCheck,
  Trash2,
  UserMinus,
  UserPlus,
  Shield,
  ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CRMButton } from '@/components/ui/crm-button';
import { CRMAvatar } from '@/components/ui/crm-avatar';
import { CRMBadge } from '@/components/ui/crm-badge';
import { useCRMTheme } from '@/providers/crm-theme-provider';
import { CRMAuthenticatedLayout } from '@/components/layout/crm-authenticated-layout';
import { CreateGroupDialog } from '@/components/features/inbox/create-group-dialog';
import { SimpleInputModal } from '@/components/modals/simple-input-modal';

import { wppconnectClient } from '@/lib/api/wppconnect-client';

export default function InboxPage() {
  const { themeColor, isDark } = useCRMTheme();
  const [activeChat, setActiveChat] = useState<string | number | null>(null);
  const [visibleChannels, setVisibleChannels] = useState(['whatsapp', 'email', 'instagram', 'facebook']);
  const [orientations, setOrientations] = useState("Cliente interessado no plano Enterprise. \n\nPreferência por contato via WhatsApp à tarde.");
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  
  // Group Management State
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [groupDescription, setGroupDescription] = useState('');
  const [groupName, setGroupName] = useState('');
  const [isGroupAdmin, setIsGroupAdmin] = useState(false); // To implement check later
  const [groupLoading, setGroupLoading] = useState(false);

  // Popups State
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);

  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isUsingMock, setIsUsingMock] = useState(false);

  // Fetch Chats (Real Uazapi Integration)
  const fetchChats = async () => {
    setRefreshing(true);
    try {
        const response = await wppconnectClient.chats.listChats();
        // Extract chats array from various possible structures
        let chats: any[] = [];
        if (response?.data?.chats && Array.isArray(response.data.chats)) {
            chats = response.data.chats;
        } else if (response?.data && Array.isArray(response.data)) {
            chats = response.data;
        } else if (Array.isArray(response)) {
            chats = response;
        }
        
        // Auto-sync if list is empty
        if (chats.length === 0) {
            try {
                await wppconnectClient.chats.syncChats();
                // Fetch again after sync
                const syncedResponse = await wppconnectClient.chats.listChats();
                
                let syncedChats: any[] = [];
                if (syncedResponse?.data?.chats && Array.isArray(syncedResponse.data.chats)) {
                    syncedChats = syncedResponse.data.chats;
                } else if (syncedResponse?.data && Array.isArray(syncedResponse.data)) {
                    syncedChats = syncedResponse.data;
                } else if (Array.isArray(syncedResponse)) {
                    syncedChats = syncedResponse;
                }
                
                if (syncedChats.length > 0) {
                    updateConversations(syncedChats);
                    setIsUsingMock(false);
                    return;
                }
            } catch (syncError) {
                console.error('Auto-sync failed', syncError);
            }
        }

        if (chats.length > 0) {
            updateConversations(chats);
            setIsUsingMock(false);
        } else {
             // If strictly empty and no sync worked
             // Don't throw, just show empty
        }
    } catch (error: any) {
        console.error('Failed to fetch Uazapi chats', error);
        
        // If error is "instance not connected" or similar, don't use mock, just show empty or error
        const errorMsg = error?.message?.toLowerCase() || '';
        if (errorMsg.includes('instance') && (errorMsg.includes('not found') || errorMsg.includes('not connected'))) {
            setConversations([]); 
            return;
        }

        setIsUsingMock(false);
        // Fallback removed - show empty state instead of mock
        setConversations([]);
    } finally {
        setRefreshing(false);
    }
  };

  const updateConversations = (chats: any[]) => {
        const mappedChats = chats.map((chat: any) => {
            const timestamp = chat.wa_lastMsgTimestamp || chat.last_message?.timestamp;
            
            // Safely extract last message content
            let lastContent = chat.wa_lastMessageTextVote;
            if (!lastContent && chat.last_message?.content) {
                const c = chat.last_message.content;
                if (typeof c === 'string') {
                    lastContent = c;
                } else if (c && typeof c === 'object') {
                    // Handle potential object content in last_message
                    lastContent = c.text || c.caption || (c.message?.conversation) || (c.extendedTextMessage?.text) || 'Conteúdo de mídia';
                }
            } else if (!lastContent && chat.last_message?.message) {
                 // Handle nested message object in last_message root
                 const m = chat.last_message.message;
                 if (m) {
                    lastContent = m.conversation || m.extendedTextMessage?.text || m.imageMessage?.caption || 'Conteúdo de mídia';
                 }
            }

            const safeName = String(chat.name || chat.wa_name || chat.wa_contactName || chat.number || chat.id.split('@')[0] || 'Desconhecido');
            
            // Extract status and sender for last message
            const lastMsgStatus = chat.last_message?.status || chat.wa_lastMessageStatus || 'SENT';
            const lastMsgSender = (chat.last_message?.key?.fromMe || chat.wa_lastMessageFromMe) ? 'me' : 'other';

            return {
                id: chat.wa_chatid || chat.id,
                name: safeName,
                lastMsg: typeof lastContent === 'string' ? lastContent : '...',
                lastMsgStatus,
                lastMsgSender,
                time: timestamp ? new Date(Number(timestamp)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '',
                timestamp: Number(timestamp || 0),
                unread: chat.wa_unreadCount || chat.unread_count || 0,
                online: true, // Mock for now
                channel: 'whatsapp', // Uazapi defaults to WhatsApp
                image: chat.imagePreview || chat.image || null
            };
        });
        
        // Sort by timestamp descending (newest first)
        mappedChats.sort((a: any, b: any) => b.timestamp - a.timestamp);
        
        setConversations(mappedChats);
  };

  useEffect(() => {
    fetchChats();
    // Poll for new chats every 15 seconds
    const interval = setInterval(fetchChats, 15000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Messages when Chat Selected
  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
        setLoading(true);
        try {
             // Check if it's a mock ID (number) or real ID (string)
             if (typeof activeChat === 'string') {
                 const response = await wppconnectClient.chats.getMessages(activeChat);
                 
                 // Robust data extraction for messages
                 let msgsData: any[] = [];
                 if (response?.data?.messages && Array.isArray(response.data.messages)) {
                     msgsData = response.data.messages;
                 } else if (response?.messages && Array.isArray(response.messages)) {
                     msgsData = response.messages;
                 } else if (response?.data && Array.isArray(response.data)) {
                     msgsData = response.data;
                 } else if (Array.isArray(response)) {
                     msgsData = response;
                 }

                 console.log("Messages fetched (RAW):", msgsData); // Debug
                 if (msgsData.length > 0 && msgsData[0]) console.log("First message structure:", JSON.stringify(msgsData[0]));

                 if (msgsData.length > 0) {
                     const sortedMsgs = msgsData.map((m: any) => {
                         let content = m.text;
                         
                         // Fallback strategies for different message structures
                         if (!content) {
                             if (m.content && typeof m.content === 'object') {
                                 content = m.content.text || m.content.caption || (typeof m.content.message === 'string' ? m.content.message : '');
                             } 
                             
                             if (!content && typeof m.content === 'string') {
                                 content = m.content;
                             } else if (!content && m.body) {
                                 content = m.body;
                             } else if (!content && m.message) {
                                 if (m.message.conversation) content = m.message.conversation;
                                 else if (m.message.extendedTextMessage?.text) content = m.message.extendedTextMessage.text;
                                 else if (m.message.imageMessage?.caption) content = m.message.imageMessage.caption;
                                 else if (m.message.documentMessage?.caption) content = m.message.documentMessage.caption;
                                 else if (m.message.videoMessage?.caption) content = m.message.videoMessage.caption;
                             }
                         }

                         // Handle media types labels if still empty
                         if (!content) {
                             const type = m.messageType || m.type;
                             // Defensive check if type is an object (it shouldn't be, but API...)
                             if (typeof type === 'string') {
                                if (type === 'ImageMessage' || type === 'image') content = '📷 Imagem';
                                else if (type === 'AudioMessage' || type === 'audio') content = '🎤 Áudio';
                                else if (type === 'VideoMessage' || type === 'video') content = '🎥 Vídeo';
                                else if (type === 'DocumentMessage' || type === 'document') content = '📄 Documento';
                                else if (type === 'StickerMessage' || type === 'sticker') content = '👾 Figurinha';
                                else if (type === 'ContactMessage') content = '👤 Contato';
                                else if (type === 'LocationMessage') content = '📍 Localização';
                                else content = 'Mensagem';
                             } else {
                                 content = 'Mensagem';
                             }
                         }

                         // Final safety check: ensure content is a string and not an object structure
                         let finalContent = String(content || '');
                         if (content && typeof content === 'object') {
                             // If somehow an object slipped through, try to find text in common places or stringify carefully
                             // But prevent passing [object Object] if possible, prefer a label
                             finalContent = (content as any).text || (content as any).caption || 'Conteúdo de mídia';
                         }

                         return {
                             id: m.id || m.key?.id,
                             sender: (m.fromMe || m.key?.fromMe) ? 'me' : 'other',
                             senderId: m.participant || m.key?.participant || m.key?.remoteJid || '',
                             senderName: m.pushName || m.notifyName || m.verifiedName || null,
                             text: String(finalContent), // Double safe
                             status: m.status || 'SENT',
                             timestamp: Number(m.messageTimestamp || m.timestamp || 0),
                             time: (m.messageTimestamp || m.timestamp) ? new Date(Number(m.messageTimestamp || m.timestamp) * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''
                         };
                     }).sort((a: any, b: any) => a.timestamp - b.timestamp);

                     setMessages(sortedMsgs);
                 } else {
                    setMessages([]); // Clear messages if empty
                 }
             } else {
                 // Fallback removed - show empty
                 setMessages([]);
             }
        } catch (error) {
            console.error('Failed to fetch messages', error);
        } finally {
            setLoading(false);
        }
    };

    fetchMessages();
  }, [activeChat]);

  // Fetch Group Details when activeChat is a group
  const fetchGroupDetails = async () => {
      if (!activeChat || typeof activeChat !== 'string' || !activeChat.endsWith('@g.us')) return;
      
      setGroupLoading(true);
      try {
          // Fetch group info (participants, admins, etc)
          const response = await wppconnectClient.groups.getGroup(activeChat);
          console.log('Group Details:', response);
          
          if (response) {
              if (response.desc || response.description) setGroupDescription(response.desc || response.description);
              if (response.subject || response.name) setGroupName(response.subject || response.name);

              // Handle participants - try from getGroup response first, otherwise fetch explicitly
              let members = [];
              if (response.participants && Array.isArray(response.participants) && response.participants.length > 0) {
                  members = response.participants;
              } else {
                  try {
                      const membersResponse = await wppconnectClient.groups.listGroupMembers(activeChat);
                      console.log('Group Members Explicit Fetch:', membersResponse);
                      
                      if (Array.isArray(membersResponse)) {
                          members = membersResponse;
                      } else if (membersResponse?.participants && Array.isArray(membersResponse.participants)) {
                          members = membersResponse.participants;
                      } else if (membersResponse?.data && Array.isArray(membersResponse.data)) {
                          members = membersResponse.data;
                      }
                  } catch (err) {
                      console.error('Error fetching group members explicitly:', err);
                  }
              }
              
              if (members.length > 0) {
                  // Normalize members to ensure consistent structure
                  const normalizedMembers = members.map((m: any) => {
                      if (typeof m === 'string') {
                          return { id: m, admin: false, name: null };
                      }
                      // Handle various field names for participants
                      // The API seems to return 'DisplayName' which might be empty for non-contacts or non-business
                      // If DisplayName is empty, we should treat it as null so the UI falls back to ID
                      const name = m.name || m.notify || m.verifiedName || m.pushName || m.DisplayName || null;
                      
                      return {
                          id: m.id || m.jid || m.number || m.JID || m.PhoneNumber || 'unknown',
                          admin: m.admin === 'admin' || m.admin === 'superadmin' || m.admin === true || m.isAdmin === true || m.isSuperAdmin === true || m.IsAdmin === true || m.IsSuperAdmin === true,
                          name: (name && name.trim() !== '') ? name : null,
                          image: m.imgUrl || m.image || m.profilePictureUrl || null
                      };
                  });
                  setGroupMembers(normalizedMembers);
              }
          } 
      } catch (error) {
          console.error('Failed to fetch group details', error);
      } finally {
          setGroupLoading(false);
      }
  };

  useEffect(() => {
      if (!activeChat || typeof activeChat !== 'string' || !activeChat.endsWith('@g.us')) {
          setGroupMembers([]);
          return;
      }
      fetchGroupDetails();
  }, [activeChat]);

  // Group Actions
  const handlePromoteParticipant = async (participantId: string) => {
      if (!activeChat || typeof activeChat !== 'string') return;
      try {
          await wppconnectClient.groups.promoteGroupMember(activeChat, participantId);
          alert('Participante promovido!');
          // Refresh members?
      } catch (error) {
          console.error('Failed to promote', error);
          alert('Erro ao promover');
      }
  };

  const handleDemoteParticipant = async (participantId: string) => {
      if (!activeChat || typeof activeChat !== 'string') return;
      try {
          await wppconnectClient.groups.demoteGroupMember(activeChat, participantId);
          alert('Participante rebaixado!');
      } catch (error) {
          console.error('Failed to demote', error);
          alert('Erro ao rebaixar');
      }
  };

  const handleRemoveParticipant = async (participantId: string) => {
      if (!activeChat || typeof activeChat !== 'string') return;
      if (!confirm('Tem certeza que deseja remover este participante?')) return;
      try {
          await wppconnectClient.groups.removeGroupMember(activeChat, participantId);
          alert('Participante removido!');
          setGroupMembers(prev => prev.filter(m => m.id !== participantId));
      } catch (error) {
          console.error('Failed to remove', error);
          alert('Erro ao remover');
      }
  };

  const handleUpdateGroupDescription = async () => {
      if (!activeChat || typeof activeChat !== 'string') return;
      try {
          await wppconnectClient.groups.updateGroup(activeChat, { description: groupDescription });
          alert('Descrição atualizada!');
      } catch (error) {
          console.error('Failed to update description', error);
          alert('Erro ao atualizar descrição');
      }
  };

  const handleUpdateGroupName = async () => {
      if (!activeChat || typeof activeChat !== 'string') return;
      try {
          await wppconnectClient.groups.updateGroup(activeChat, { name: groupName });
          alert('Nome atualizado!');
          // Optimistic update list
          setConversations(prev => prev.map(c => c.id === activeChat ? { ...c, name: groupName } : c));
      } catch (error) {
          console.error('Failed to update name', error);
          alert('Erro ao atualizar nome');
      }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
      if (messages.length > 0) {
          const lastMsgElement = document.getElementById("last-message");
          if (lastMsgElement) {
              lastMsgElement.scrollIntoView({ behavior: "smooth" });
          }
      }
  }, [messages]);

  // Send Message
  const handleSendMessage = async (text: string) => {
      if (!activeChat || typeof activeChat !== 'string') return;
      
      try {
          // UazAPI sendText expects number only for individual, or Group ID for groups.
          // Usually passing the full ID (remoteJid) works best.
          const number = activeChat; 
          
          await wppconnectClient.messages.sendText(number, text);
          
          // Optimistic update
          setMessages(prev => [...prev, {
              id: Date.now().toString(),
              sender: 'me',
              text: text,
              time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          }]);
          
      } catch (error) {
          console.error('Failed to send message', error);
          alert('Erro ao enviar mensagem');
      }
  };

  const toggleChannelVisibility = (channel: string) => {
      setVisibleChannels(prev => 
          prev.includes(channel) 
              ? prev.filter(c => c !== channel) 
              : [...prev, channel]
      );
  };

  const handleCreateGroup = async (name: string, participants: string[]) => {
    setLoading(true);
    try {
        const result = await wppconnectClient.groups.createGroup(name, participants);
        console.log('Group created:', result);
        
        // Force sync to fetch the new group
        await wppconnectClient.chats.syncChats();
        
        // Refresh chat list
        await fetchChats();
        
        // Optimistic add if fetch didn't catch it yet (and we have a GID)
        // result usually looks like { success: true, gid: "12345@g.us" } or just the gid string depending on implementation
        // Safely try to extract gid
        const newGid = (result as any)?.gid || (result as any)?.id || (typeof result === 'string' ? result : null);
        
        if (newGid && !conversations.find(c => c.id === newGid)) {
             const newGroupChat = {
                id: newGid,
                name: name,
                lastMsg: 'Grupo criado',
                lastMsgStatus: 'SENT',
                lastMsgSender: 'me',
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                timestamp: Date.now(),
                unread: 0,
                online: false,
                channel: 'whatsapp',
                image: null
            };
            setConversations(prev => [newGroupChat, ...prev]);
            setActiveChat(newGid);
        }

        alert('Grupo criado com sucesso!');
    } catch (error) {
        console.error('Failed to create group', error);
        alert('Erro ao criar grupo');
    } finally {
        setLoading(false);
    }
  };

  const handleStartNewChat = (data: any) => {
    const contact = data.contact;
    if (!contact) return;

    // Check if conversation exists
    const existing = conversations.find(c => 
        c.id.includes(contact) || c.name.toLowerCase() === contact.toLowerCase()
    );

    if (existing) {
        setActiveChat(existing.id);
    } else {
        // Create optimistic conversation
        const newChatId = contact.includes('@') ? contact : `${contact}@s.whatsapp.net`;
        const newChat = {
            id: newChatId,
            name: contact,
            lastMsg: 'Nova conversa',
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            unread: 0,
            online: false,
            channel: 'whatsapp',
            image: null
        };
        setConversations([newChat, ...conversations]);
        setActiveChat(newChatId);
    }
    setShowNewChat(false);
  };

  const filteredConversations = conversations
    .filter(c => visibleChannels.includes(c.channel))
    .filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const getChannelIcon = (channel: string) => {
      switch(channel) {
          case 'whatsapp': return <MessageCircle className="h-3 w-3 text-emerald-500" />;
          case 'email': return <Mail className="h-3 w-3 text-red-500" />;
          case 'instagram': return <Instagram className="h-3 w-3 text-pink-500" />;
          case 'facebook': return <Facebook className="h-3 w-3 text-blue-600" />;
          default: return <MessageSquare className="h-3 w-3" />;
      }
  };

  const getStatusIcon = (status: any, customClass?: string) => {
      const s = String(status).toUpperCase();
      const baseClass = customClass || "h-3 w-3 text-zinc-400";
      
      // Blue check for Read/Seen
      if (['READ', 'SEEN', 'PLAYED', '3', '4'].includes(s)) {
          return <CheckCheck className={cn(baseClass, !customClass && "text-blue-500")} />;
      }
      // Double check gray for Delivered/Received
      if (['DELIVERED', 'RECEIVED', '2'].includes(s)) {
          return <CheckCheck className={baseClass} />;
      }
      // Single check for Sent
      return <Check className={baseClass} />;
  };

  return (
    <CRMAuthenticatedLayout title="Inbox">
    <div className={cn(
      "h-full flex rounded-xl overflow-hidden border shadow-sm",
      isDark ? "border-zinc-800 bg-zinc-900/30" : "border-zinc-200 bg-white"
    )}>
      {/* Coluna 1: Lista de Conversas */}
      <div className={cn("w-72 border-r flex flex-col", isDark ? "border-zinc-800 bg-zinc-900/50" : "border-zinc-200 bg-zinc-50/50")}>
        <div className={cn("p-3 border-b space-y-3", isDark ? "border-zinc-800" : "border-zinc-200")}>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <h2 className={cn("font-bold text-sm", isDark ? "text-white" : "text-zinc-900")}>Inbox</h2>
                    {isUsingMock ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Modo Demo
                        </span>
                    ) : (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            Online
                        </span>
                    )}
                </div>
                <div className="flex gap-1">
                    <CRMButton 
                        variant="ghost" 
                        size="icon" 
                        isDark={isDark} 
                        title="Atualizar Conversas" 
                        className={cn("h-7 w-7", refreshing && "animate-spin")} 
                        onClick={fetchChats}
                    >
                        <RefreshCw className="h-4 w-4" />
                    </CRMButton>
                    <CRMButton variant="ghost" size="icon" isDark={isDark} title="Novo Grupo" className="h-7 w-7" onClick={() => setShowNewGroup(true)}>
                        <Users className="h-4 w-4" />
                    </CRMButton>
                    <CRMButton variant="ghost" size="icon" isDark={isDark} title="Nova Conversa" className="h-7 w-7" onClick={() => setShowNewChat(true)}>
                        <Plus className="h-4 w-4" />
                    </CRMButton>
                </div>
            </div>
            
            <div className="flex justify-between px-1">
                {['whatsapp', 'email', 'instagram', 'facebook'].map(ch => (
                    <button 
                        key={ch}
                        onClick={() => toggleChannelVisibility(ch)}
                        className={cn(
                            "p-1.5 rounded transition-all", 
                            visibleChannels.includes(ch) 
                                ? (isDark ? "bg-zinc-800 text-zinc-200" : "bg-zinc-200 text-zinc-800")
                                : "opacity-30 hover:opacity-70 grayscale"
                        )}
                        title={`Mostrar/Ocultar ${ch}`}
                    >
                        {getChannelIcon(ch)}
                    </button>
                ))}
            </div>

            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <input 
                type="text" 
                placeholder="Buscar..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                    "w-full border-none rounded-lg pl-8 pr-3 py-1.5 text-xs focus:ring-1 transition-all",
                    isDark 
                    ? `bg-zinc-800/50 text-zinc-200 focus:ring-${themeColor}-500` 
                    : `bg-white text-zinc-900 shadow-sm focus:ring-${themeColor}-500`
                )}
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map(chat => (
            <div 
              key={chat.id} 
              onClick={() => setActiveChat(chat.id)}
              className={cn(
                "p-3 flex gap-3 cursor-pointer transition-colors border-l-[3px] relative group",
                activeChat === chat.id 
                  ? `bg-${themeColor}-500/5 border-${themeColor}-500` 
                  : isDark ? "border-transparent hover:bg-zinc-800/50" : "border-transparent hover:bg-zinc-100"
              )}
            >
              <div className="relative">
                <CRMAvatar 
                    initials={chat.name.slice(0, 2).toUpperCase()} 
                    size="md" 
                    color={isDark ? "bg-zinc-700" : "bg-zinc-200 text-zinc-700"} 
                    src={chat.image}
                />
                {chat.online && <div className={cn("absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2", isDark ? "ring-zinc-900" : "ring-white")} />}
                <div className="absolute -top-1 -left-1 bg-zinc-900 rounded-full p-0.5 border border-zinc-800">
                    {getChannelIcon(chat.channel)}
                </div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className={cn("text-xs font-semibold truncate", 
                    activeChat === chat.id 
                      ? isDark ? "text-white" : "text-zinc-900"
                      : isDark ? "text-zinc-300" : "text-zinc-700"
                  )}>
                    {chat.name}
                  </span>
                  <span className="text-[9px] text-zinc-500">{chat.time}</span>
                </div>
                <div className="flex items-center gap-1 overflow-hidden">
                    {chat.lastMsgSender === 'me' && getStatusIcon(chat.lastMsgStatus, "h-3 w-3 min-w-[12px]")}
                    <p className="text-[10px] text-zinc-500 truncate">{chat.lastMsg}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coluna 2: Chat Area */}
      <div className={cn("flex-1 flex flex-col min-w-0", isDark ? "bg-zinc-950/30" : "bg-zinc-50/50")}>
        {activeChat ? (
          <>
            <div className={cn("h-14 px-4 border-b flex justify-between items-center backdrop-blur-md", isDark ? "border-zinc-800 bg-zinc-900/50" : "border-zinc-200 bg-white/80")}>
              <div className="flex items-center gap-3">
                <CRMAvatar 
                    initials={conversations.find(c => c.id === activeChat)?.name.slice(0,2).toUpperCase() || "?"} 
                    size="sm" 
                    color={isDark ? "bg-zinc-700" : "bg-zinc-200 text-zinc-700"} 
                    src={conversations.find(c => c.id === activeChat)?.image}
                />
                <div>
                    <span className={cn("font-bold text-sm block", isDark ? "text-white" : "text-zinc-900")}>
                        {conversations.find(c => c.id === activeChat)?.name || "Desconhecido"}
                    </span>
                    <span className="text-[10px] text-emerald-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online</span>
                </div>
              </div>
              <div className="flex gap-1">
                <CRMButton variant="ghost" size="icon" isDark={isDark} className="h-8 w-8"><Phone className="h-4 w-4" /></CRMButton>
                <CRMButton variant="ghost" size="icon" isDark={isDark} className="h-8 w-8"><MoreVertical className="h-4 w-4" /></CRMButton>
              </div>
            </div>

            <div className="flex-1 p-4 space-y-4 overflow-y-auto text-xs">
              <div className="flex justify-center">
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full border opacity-70", isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-200")}>Hoje</span>
              </div>
              
              {messages.length === 0 && (
                  <div className="text-center text-zinc-500 mt-10">
                      Nenhuma mensagem nesta conversa.
                  </div>
              )}

              {messages.map((msg, index) => (
                  <div key={msg.id || index} className={cn("flex gap-2", msg.sender === 'me' ? "flex-row-reverse" : "")} id={index === messages.length - 1 ? "last-message" : undefined}>
                     {msg.sender !== 'me' && (
                         <CRMAvatar 
                            initials={conversations.find(c => c.id === activeChat)?.name.slice(0,2).toUpperCase() || "?"} 
                            size="sm" 
                            color={isDark ? "bg-zinc-700" : "bg-zinc-200 text-zinc-600"} 
                            src={conversations.find(c => c.id === activeChat)?.image}
                         />
                     )}
                     <div className={cn(
                         "px-3 py-2 rounded-xl max-w-sm shadow-sm", 
                         msg.sender === 'me' 
                            ? `bg-${themeColor}-600 text-white rounded-tr-none`
                            : (isDark ? "bg-zinc-800 text-zinc-200 rounded-tl-none" : "bg-white text-zinc-800 border border-zinc-100 rounded-tl-none")
                     )}>
                        {msg.sender !== 'me' && String(activeChat).endsWith('@g.us') && (
                            <p className={cn("text-[10px] font-bold mb-0.5 opacity-80", isDark ? "text-zinc-400" : "text-zinc-500")}>
                                {(msg.senderName && msg.senderName.trim() !== '') ? msg.senderName : (msg.senderId ? msg.senderId.split('@')[0] : "Membro")}
                            </p>
                        )}
                        <p>{msg.text}</p>
                        <div className={cn("flex items-center gap-1 mt-1", msg.sender === 'me' ? "justify-end" : "")}>
                          <span className={cn("text-[9px]", msg.sender === 'me' ? `text-${themeColor}-100 opacity-80` : "text-zinc-500")}>{msg.time}</span>
                          {msg.sender === 'me' && getStatusIcon(msg.status, cn("h-3 w-3", `text-${themeColor}-100 opacity-80`))}
                        </div>
                     </div>
                  </div>
              ))}
            </div>

            <div className={cn("p-3 border-t", isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200")}>
               <div className="relative flex items-center gap-2">
                 <CRMButton variant="ghost" size="icon" isDark={isDark} className="h-8 w-8 text-zinc-400 hover:text-foreground"><Plus className="h-4 w-4" /></CRMButton>
                 <input 
                   type="text" 
                   placeholder="Mensagem..." 
                   onKeyDown={(e) => {
                       if (e.key === 'Enter') {
                           const target = e.target as HTMLInputElement;
                           handleSendMessage(target.value);
                           target.value = '';
                       }
                   }}
                   className={cn(
                     "flex-1 border rounded-lg px-3 py-2 text-xs transition-all focus:outline-none focus:ring-1",
                     isDark 
                        ? `bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-${themeColor}-500 focus:ring-${themeColor}-500`
                        : `bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-500 focus:border-${themeColor}-500 focus:ring-${themeColor}-500`
                   )}
                 />
                 <CRMButton 
                    className="h-8 w-8 rounded-lg p-0" 
                    themeColor={themeColor} 
                    isDark={isDark}
                    onClick={() => {
                        const input = document.querySelector('input[placeholder="Mensagem..."]') as HTMLInputElement;
                        if (input && input.value) {
                            handleSendMessage(input.value);
                            input.value = '';
                        }
                    }}
                >
                    <Send className="h-3.5 w-3.5 ml-0.5" />
                </CRMButton>
               </div>
            </div>
          </>
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                <MessageSquare className="h-12 w-12 mb-3 opacity-20" />
                <p className="text-sm font-medium">Selecione uma conversa</p>
                <p className="text-xs opacity-50">Escolha um contato à esquerda para iniciar o atendimento.</p>
            </div>
        )}
      </div>

      {/* Coluna 3: Info do Lead e Orientações (RESTAURADA) */}
      <div className={cn("w-72 border-l flex flex-col hidden xl:flex", isDark ? "border-zinc-800 bg-zinc-900/50" : "border-zinc-200 bg-white")}>
          <div className={cn("h-14 px-4 border-b flex items-center font-bold text-xs", isDark ? "border-zinc-800 text-zinc-400" : "border-zinc-200 text-zinc-600")}>
              {activeChat && String(activeChat).endsWith('@g.us') ? 'Detalhes do Grupo' : 'Detalhes do Lead'}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {activeChat ? (
                  <>
                    {/* Header Profile */}
                    <div className="text-center">
                        <CRMAvatar 
                            initials={conversations.find(c => c.id === activeChat)?.name.slice(0,2).toUpperCase() || "?"} 
                            size="xl" 
                            themeColor={themeColor} 
                            className="mx-auto mb-2" 
                            src={conversations.find(c => c.id === activeChat)?.image}
                        />
                        <div className="flex justify-center items-center gap-2 mb-2">
                            <input 
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                className={cn(
                                    "font-bold text-sm text-center bg-transparent border-b border-transparent focus:border-zinc-500 outline-none transition-all w-full",
                                    isDark ? "text-white" : "text-zinc-900"
                                )}
                            />
                            <button 
                                onClick={handleUpdateGroupName}
                                title="Salvar Nome"
                                className="bg-emerald-500 hover:bg-emerald-600 text-white p-1 rounded-full transition-colors flex-shrink-0"
                            >
                                <Check className="h-3 w-3" />
                            </button>
                        </div>
                        <p className="text-zinc-500 text-xs mb-2">
                            {String(activeChat).endsWith('@g.us') ? 'Grupo WhatsApp' : 'Lead'}
                        </p>

                        {String(activeChat).endsWith('@g.us') && (
                            <button 
                                onClick={async () => {
                                    const url = prompt("Cole a URL da nova imagem do grupo:");
                                    if (url) {
                                        try {
                                            await wppconnectClient.groups.updateGroupPicture(String(activeChat), url);
                                            alert("Foto atualizada com sucesso!");
                                        } catch (e) {
                                            console.error(e);
                                            alert("Erro ao atualizar foto.");
                                        }
                                    }
                                }}
                                className="text-[10px] text-zinc-400 hover:text-zinc-500 underline cursor-pointer"
                            >
                                Alterar Foto
                            </button>
                        )}
                        {!String(activeChat).endsWith('@g.us') && (
                            <div className="flex justify-center gap-2 mt-3">
                                <CRMBadge themeColor={themeColor} isDark={isDark}>Novo</CRMBadge>
                            </div>
                        )}
                        
                        {/* Group Description & Photo Edit Placeholder */}
                        {String(activeChat).endsWith('@g.us') && (
                             <div className="mt-3 px-4">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Descrição</label>
                                    <button onClick={handleUpdateGroupDescription} className="text-emerald-500 hover:text-emerald-600 text-[10px]">Salvar</button>
                                </div>
                                <textarea 
                                    value={groupDescription}
                                    onChange={(e) => setGroupDescription(e.target.value)}
                                    className={cn(
                                        "w-full h-20 p-2 rounded text-xs resize-none border focus:outline-none focus:ring-1",
                                        isDark ? "bg-zinc-800/50 border-zinc-700 text-zinc-300" : "bg-zinc-50 border-zinc-200 text-zinc-700"
                                    )}
                                    placeholder="Adicionar descrição..."
                                />
                             </div>
                        )}
                    </div>

                    {/* Contact Info (Individual) */}
                    {!String(activeChat).endsWith('@g.us') && (
                        <div className={cn("p-3 rounded-lg border space-y-2", isDark ? "bg-zinc-800/30 border-zinc-800" : "bg-zinc-50 border-zinc-200")}>
                            <div className="flex items-center gap-2 text-xs">
                                <Phone className="h-3.5 w-3.5 text-zinc-500" />
                                <span className={isDark ? "text-zinc-300" : "text-zinc-700"}>
                                    {conversations.find(c => c.id === activeChat)?.id.split('@')[0] || "-"}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Group Participants List */}
                    {String(activeChat).endsWith('@g.us') && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider flex items-center gap-1">
                                    <Users className="h-3 w-3" /> Participantes ({groupMembers.length})
                                </h4>
                                <button 
                                    onClick={fetchGroupDetails}
                                    className="text-zinc-400 hover:text-zinc-600"
                                    title="Recarregar Membros"
                                >
                                    <RefreshCw className={cn("h-3 w-3", groupLoading && "animate-spin")} />
                                </button>
                            </div>
                            {groupLoading ? (
                                <p className="text-xs text-zinc-500 text-center py-2">Carregando...</p>
                            ) : groupMembers.length === 0 ? (
                                <div className="text-center py-4 space-y-2">
                                    <p className="text-xs text-zinc-500">Nenhum participante encontrado.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {groupMembers.map((member: any) => (
                                        <div key={member.id} className={cn("p-2 rounded flex items-center justify-between group", isDark ? "bg-zinc-800/30 hover:bg-zinc-800" : "bg-zinc-50 hover:bg-zinc-100")}>
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <CRMAvatar 
                                                    initials={member.name ? member.name.slice(0,2).toUpperCase() : member.id.slice(0,2)} 
                                                    size="sm" 
                                                    className="h-6 w-6"
                                                    src={member.image}
                                                />
                                                <div className="flex flex-col min-w-0">
                                                    <span className={cn("text-xs truncate w-32", isDark ? "text-zinc-300" : "text-zinc-700")}>
                                                        {member.name || member.id.split('@')[0]}
                                                    </span>
                                                    {member.name && (
                                                        <span className="text-[9px] text-zinc-500 truncate">
                                                            {member.id.split('@')[0]}
                                                        </span>
                                                    )}
                                                    {member.admin && (
                                                        <span className="text-[9px] text-emerald-500 font-medium block">Admin</span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Admin Actions */}
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {member.admin ? (
                                                    <button onClick={() => handleDemoteParticipant(member.id)} title="Remover Admin" className="text-amber-500 hover:text-amber-600">
                                                        <ShieldAlert className="h-3 w-3" />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handlePromoteParticipant(member.id)} title="Promover Admin" className="text-emerald-500 hover:text-emerald-600">
                                                        <Shield className="h-3 w-3" />
                                                    </button>
                                                )}
                                                <button onClick={() => handleRemoveParticipant(member.id)} title="Remover do Grupo" className="text-red-500 hover:text-red-600">
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Box de Orientações Editável */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider flex items-center gap-1">
                                <FileText className="h-3 w-3" /> Orientações
                            </h4>
                            <CRMButton variant="ghost" size="icon" className="h-5 w-5" isDark={isDark}><Edit2 className="h-3 w-3" /></CRMButton>
                        </div>
                        <textarea 
                            value={orientations}
                            onChange={(e) => setOrientations(e.target.value)}
                            className={cn(
                                "w-full h-32 p-3 rounded-lg text-xs resize-none border focus:outline-none focus:ring-1",
                                isDark ? "bg-zinc-950 border-zinc-800 text-zinc-300 focus:border-zinc-600" : "bg-white border-zinc-200 text-zinc-700 focus:border-zinc-300"
                            )}
                        />
                    </div>
                  </>
              ) : (
                  <div className="text-center text-zinc-500 text-xs mt-10">
                      Selecione um contato para ver detalhes.
                  </div>
              )}
          </div>
      </div>

      {/* Popups do Inbox */}
      <CreateGroupDialog 
          isOpen={showNewGroup}
          onClose={() => setShowNewGroup(false)}
          onCreate={handleCreateGroup}
          isDark={isDark}
          themeColor={themeColor}
      />
      <SimpleInputModal 
          isOpen={showNewChat}
          onClose={() => setShowNewChat(false)}
          title="Iniciar Nova Conversa"
          submitLabel="Iniciar"
          isDark={isDark}
          themeColor={themeColor}
          onSave={handleStartNewChat}
          fields={[{ label: "Número ou Email", key: "contact", placeholder: "Ex: 5511999999999" }]}
      />
    </div>
    </CRMAuthenticatedLayout>
  );
};
