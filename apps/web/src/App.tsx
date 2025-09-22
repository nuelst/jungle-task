import { webSocketService } from '@/lib/websocket'
import { useAuthStore } from '@/store/auth.store'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { useEffect } from 'react'

import { routeTree } from './routeTree.gen'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  const { isAuthenticated, accessToken } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]))
        const now = Math.floor(Date.now() / 1000)
        if (payload.exp && payload.exp > now) {
          console.log('Valid token found, connecting WebSocket')
          webSocketService.reconnectWithNewToken()
        } else {
          console.warn('Token is expired, disconnecting WebSocket and disabling auto-reconnect')
          webSocketService.disconnect()

        }
      } catch (error) {
        console.warn('Invalid token format, disconnecting WebSocket:', error)
        webSocketService.disconnect()
      }
    } else {
      console.log('Not authenticated, disconnecting WebSocket')
      webSocketService.disconnect()
    }

    return () => {
    }
  }, [isAuthenticated, accessToken])

  return <RouterProvider router={router} />
}

export default App

