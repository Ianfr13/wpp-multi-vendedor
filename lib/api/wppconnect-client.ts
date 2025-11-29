const WPPCONNECT_URL = process.env.NEXT_PUBLIC_WPPCONNECT_URL || 'http://199.127.60.186:21465'
const SECRET_KEY = process.env.NEXT_PUBLIC_WPPCONNECT_SECRET_KEY || 'THISISMYSECURETOKEN'

let cachedToken: string | null = null
let sessionName = 'vendedor1' // Default session

export const setSessionName = (name: string) => {
  sessionName = name
  cachedToken = null // Reset token when session changes
}

const getToken = async (): Promise<string> => {
  if (cachedToken) return cachedToken
  
  const response = await fetch(`${WPPCONNECT_URL}/api/${sessionName}/${SECRET_KEY}/generate-token`, {
    method: 'POST'
  })
  
  if (!response.ok) throw new Error('Failed to generate token')
  
  const data = await response.json()
  cachedToken = data.token
  return data.token
}

const request = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getToken()
  
  const response = await fetch(`${WPPCONNECT_URL}/api/${sessionName}/${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }
  
  return response.json()
}

export const wppconnectClient = {
  chats: {
    listChats: async () => {
      return request('all-chats')
    },
    
    syncChats: async () => {
      // WPPConnect não tem sync, mas podemos fazer um refresh
      return request('all-chats')
    },
    
    getMessages: async (chatId: string) => {
      return request(`get-messages/${chatId}`)
    },
    
    sendMessage: async (chatId: string, message: string) => {
      return request('send-message', {
        method: 'POST',
        body: JSON.stringify({
          phone: chatId,
          message
        })
      })
    }
  },
  
  session: {
    startSession: async () => {
      return request('start-session', { method: 'POST' })
    },
    
    getQRCode: async () => {
      const token = await getToken()
      return `${WPPCONNECT_URL}/api/${sessionName}/qrcode-session?token=${token}`
    },
    
    getStatus: async () => {
      return request('status-session')
    }
  }
}
