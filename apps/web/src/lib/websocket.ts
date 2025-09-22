import { useAuthStore } from '@/store/auth.store'
import { io, Socket } from 'socket.io-client'

class WebSocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private readonly maxReconnectAttempts = 5
  private readonly reconnectDelay = 1000
  private isConnecting = false
  private shouldReconnect = true
  private lastTokenCheck = 0

  connect(): void {
    if (this.socket?.connected || this.isConnecting) {
      console.log('WebSocket already connected or connecting, skipping')
      return
    }

    if (!this.shouldReconnect) {
      console.log('WebSocket reconnection disabled')
      return
    }

    const { accessToken, isAuthenticated } = useAuthStore.getState()
    if (!accessToken || !isAuthenticated) {
      console.warn('No access token or not authenticated for WebSocket connection')
      this.shouldReconnect = false
      return
    }

    const now = Date.now()
    if (now - this.lastTokenCheck < 65000) { //  throttle  
      return
    }
    this.lastTokenCheck = now


    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < currentTime) {
        console.warn('Token is expired, disabling WebSocket reconnection')
        this.shouldReconnect = false
        return
      }
    } catch (error) {
      console.warn('Invalid token format, disabling WebSocket reconnection:', error)
      this.shouldReconnect = false
      return
    }

    this.isConnecting = true

    if (this.socket) {
      console.log('Disconnecting existing socket')
      this.socket.disconnect()
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3001'
    console.log(' Connecting to WebSocket:', wsUrl)
    console.log(' Access token present:', !!accessToken)
    console.log(' Access token preview:', accessToken?.substring(0, 20) + '...')

    this.socket = io(wsUrl, {
      auth: {
        token: accessToken,
      },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true,
      autoConnect: true,
    })

    this.socket.on('connect', () => {
      console.log('🎉 WebSocket connected successfully!')
      console.log('🆔 Socket ID:', this.socket?.id)
      console.log('🌐 Connected to:', wsUrl)
      this.reconnectAttempts = 0
      this.isConnecting = false
      this.shouldReconnect = true
    })

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason)
      console.log('Disconnect reason:', reason)
      this.isConnecting = false

      if (reason === 'io server disconnect') {
        if (this.shouldReconnect) {
          this.handleReconnect()
        }
      }
    })

    this.socket.on('connect_error', (error: any) => {
      console.error('WebSocket connection error:', error)
      console.error('Error message:', error.message)
      console.error('Error type:', error.type)
      this.isConnecting = false

      const isAuthError = error.message === 'Invalid token for WebSocket connection' ||
        error.message === 'Token recently rejected, disconnecting' ||
        error.message === 'No user ID in token payload' ||
        error.message === 'No token provided for WebSocket connection' ||
        error.message === 'Token expired for WebSocket connection'

      if (isAuthError) {
        console.warn('Authentication error, disabling reconnection:', error.message)
        this.shouldReconnect = false
        return
      }

      if (this.shouldReconnect) {
        this.handleReconnect()
      }
    })

    this.socket.on('task:created', (data) => {
      console.log('Task created notification:', data)
      this.handleTaskCreated(data)
    })

    this.socket.on('task:updated', (data) => {
      console.log(' Task updated notification received via WebSocket!')
      console.log(' Data:', data)
      console.log(' Data type:', typeof data)
      console.log(' Data keys:', Object.keys(data || {}))
      this.handleTaskUpdated(data)
    })

    this.socket.on('comment:created', (data) => {
      console.log('Comment created notification:', data)
      this.handleCommentCreated(data)
    })

    this.socket.on('notification', (data) => {
      console.log('General notification received via WebSocket:', data)
      console.log('General notification data type:', typeof data)
      console.log('General notification data keys:', Object.keys(data || {}))
      // Handle general notification
      this.handleNotification(data)
    })
  }

  disconnect(): void {
    this.shouldReconnect = false
    this.isConnecting = false

    if (this.socket) {
      console.log(' Disconnecting WebSocket...')
      this.socket.disconnect()
      this.socket = null
      console.log(' WebSocket disconnected')
    } else {
      console.log('ℹ WebSocket already disconnected')
    }
  }

  reconnectWithNewToken(): void {
    this.shouldReconnect = true
    this.reconnectAttempts = 0
    this.lastTokenCheck = 0
    this.connect()
  }

  private handleReconnect(): void {
    if (!this.shouldReconnect) {
      console.log('Reconnection disabled, skipping')
      return
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached, disabling reconnection')
      this.shouldReconnect = false
      return
    }

    const now = Date.now()
    if (now - this.lastTokenCheck < 65000) {
      console.log('Reconnection throttled')
      return
    }
    this.lastTokenCheck = now

    const { accessToken, isAuthenticated } = useAuthStore.getState()
    if (!accessToken || !isAuthenticated) {
      console.warn('Not authenticated, disabling reconnection')
      this.shouldReconnect = false
      return
    }

    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < now) {
        console.warn('Token is expired, disabling reconnection')
        this.shouldReconnect = false
        return
      }
    } catch (error) {
      console.warn('Invalid token format, disabling reconnection:', error)
      this.shouldReconnect = false
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    setTimeout(() => {
      if (this.shouldReconnect) {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.connect()
      }
    }, delay)
  }

  private handleTaskCreated(data: any): void {
    console.log('Task created notification received:', data)
    window.dispatchEvent(new CustomEvent('task:created', { detail: data }))
  }

  private handleTaskUpdated(data: any): void {
    console.log('Task updated notification received in WebSocket service:', data)
    console.log('Task updated data type:', typeof data)
    console.log('Task updated data keys:', Object.keys(data || {}))
    console.log('Dispatching task:updated event to window')
    window.dispatchEvent(new CustomEvent('task:updated', { detail: data }))
    console.log('Task:updated event dispatched to window')
  }

  private handleCommentCreated(data: any): void {
    console.log('Comment created notification received:', data)
    window.dispatchEvent(new CustomEvent('comment:created', { detail: data }))
  }

  private handleNotification(data: any): void {
    console.log('General notification received in WebSocket service:', data)
    console.log('General notification data type:', typeof data)
    console.log('General notification data keys:', Object.keys(data || {}))
    console.log('Dispatching notification event to window')
    window.dispatchEvent(new CustomEvent('notification', { detail: data }))
    console.log('Notification event dispatched to window')
  }

  joinRoom(room: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join-room', { room })
    }
  }

  leaveRoom(room: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave-room', { room })
    }
  }

  isConnected(): boolean {
    const connected = this.socket?.connected || false
    console.log('🔍 WebSocket connection status:', connected)
    return connected
  }

  getConnectionInfo(): any {
    return {
      connected: this.socket?.connected || false,
      socketId: this.socket?.id || null,
      reconnectAttempts: this.reconnectAttempts,
      transport: this.socket?.io?.engine?.transport?.name || null,
    }
  }
}

export const webSocketService = new WebSocketService()

