'use client'

import { useEffect, useState, useRef } from 'react'
import { uazapiClient } from '@/lib/api/uazapi-client'
import { Send, Loader2, Phone, Video, MoreVertical, Check, CheckCheck, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Conversation {
  id: string
  contact?: { name: string; phone?: string; email?: string }
  channel: string
  status: string
  unread_count: number
}

interface Message {
  id: string
  content: string
  sender_type: string
  sender_id?: string
  created_at: string
  status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  attachments?: any[]
}

interface ChatAreaProps {
  conversation: Conversation
  messages: Message[]
  loading: boolean
  onStatusChange: (id: string, status: string) => void
  onSendMessage: (text: string) => Promise<void>
}

export function ChatArea({ conversation, messages, loading, onStatusChange, onSendMessage }: ChatAreaProps) {
  const [sending, setSending] = useState(false)
  const [messageText, setMessageText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim()) return

    try {
      setSending(true)
      await onSendMessage(messageText)
      setMessageText('')
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      alert('Erro ao enviar mensagem')
    } finally {
      setSending(false)
    }
  }

  const getSenderColor = (senderType: string) => {
    const colors: Record<string, string> = {
      user: 'bg-blue-100 dark:bg-blue-900',
      contact: 'bg-gray-100 dark:bg-gray-700',
      agent: 'bg-green-100 dark:bg-green-900',
      system: 'bg-yellow-100 dark:bg-yellow-900',
    }
    return colors[senderType] || 'bg-gray-100 dark:bg-gray-700'
  }

  const getSenderLabel = (senderType: string) => {
    const labels: Record<string, string> = {
      user: 'Você',
      contact: 'Contato',
      agent: 'Agente',
      system: 'Sistema',
    }
    return labels[senderType] || senderType
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {conversation.contact?.name || 'Conversa'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {conversation.contact?.phone || conversation.contact?.email || 'Sem contato'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={conversation.status}
            onChange={(e) => onStatusChange(conversation.id, e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="open">Aberta</option>
            <option value="closed">Fechada</option>
            <option value="snoozed">Pausada</option>
          </select>

          <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Phone className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Video className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>Nenhuma mensagem ainda</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${getSenderColor(message.sender_type)}`}>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {getSenderLabel(message.sender_type)}
                </p>
                <p className="text-gray-900 dark:text-white break-words">
                  {message.content}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center justify-end gap-1">
                  {formatDistanceToNow(new Date(message.created_at), {
                    addSuffix: false,
                    locale: ptBR,
                  })}
                  {message.sender_type === 'user' && (
                    <span className="ml-1">
                        {message.status === 'read' ? (
                            <CheckCheck className="h-3 w-3 text-blue-500" />
                        ) : message.status === 'delivered' ? (
                            <CheckCheck className="h-3 w-3 text-gray-500" />
                        ) : message.status === 'sent' ? (
                            <Check className="h-3 w-3 text-gray-500" />
                        ) : (
                            <Clock className="h-3 w-3 text-gray-400" />
                        )}
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Digite uma mensagem..."
            disabled={sending}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !messageText.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
