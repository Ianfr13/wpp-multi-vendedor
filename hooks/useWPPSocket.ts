import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

const WPPCONNECT_URL = process.env.NEXT_PUBLIC_WPPCONNECT_URL || 'http://199.127.60.186:21465'

export function useWPPSocket(sessionName: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!sessionName) return

    const socketInstance = io(WPPCONNECT_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true
    })

    socketInstance.on('connect', () => {
      console.log('✅ Socket conectado')
      setConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket desconectado')
      setConnected(false)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [sessionName])

  return { socket, connected }
}
