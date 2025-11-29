'use client'

import { useWPPSocket } from '@/hooks/useWPPSocket'
import { useState } from 'react'

export default function InboxPage() {
  const [sessionName] = useState('vendedor1')
  const { connected } = useWPPSocket(sessionName)

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>{connected ? 'Conectado' : 'Desconectado'}</span>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Interface de chat em desenvolvimento...
      </div>
    </div>
  )
}
