import { Conversation } from '@/types'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { User, MessageCircle, Mail, Facebook, Instagram } from 'lucide-react'

interface InboxSidebarProps {
    conversations: Conversation[]
    selectedId: string | null
    onSelect: (id: string) => void
}

const ChannelIcon = ({ channel }: { channel: string }) => {
    switch (channel) {
        case 'email': return <Mail className="h-4 w-4" />
        case 'facebook': return <Facebook className="h-4 w-4" />
        case 'instagram': return <Instagram className="h-4 w-4" />
        default: return <MessageCircle className="h-4 w-4" />
    }
}

export function InboxSidebar({ conversations, selectedId, onSelect }: InboxSidebarProps) {
    return (
        <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
                <div
                    key={conv.id}
                    onClick={() => onSelect(conv.id)}
                    className={cn(
                        "p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                        selectedId === conv.id && "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-primary"
                    )}
                >
                    <div className="flex justify-between items-start mb-1">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                            {conv.contact?.name || 'Unknown Contact'}
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                            {conv.last_message_at && formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <ChannelIcon channel={conv.channel} />
                        <span className="truncate">
                            {/* We could show last message snippet here if we fetch it */}
                            {conv.status}
                        </span>
                        {conv.unread_count > 0 && (
                            <span className="ml-auto bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                                {conv.unread_count}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
