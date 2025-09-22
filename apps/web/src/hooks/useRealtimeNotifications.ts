import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useNotificationSound } from './useNotificationSound'

export function useRealtimeNotifications() {
  const queryClient = useQueryClient()
  const { playNotificationSound } = useNotificationSound()

  useEffect(() => {
    const handleTaskCreated = (event: any) => {
      console.log('Task created event received:', event.detail)
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })

      toast.success('Nova tarefa criada!', {
        duration: 4000,
        position: 'top-right',
        icon: '📝',
      })
      playNotificationSound()
    }

    const handleTaskUpdated = (event: any) => {
      console.log('Task updated event received:', event.detail)
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })

      toast.success('Tarefa atualizada!', {
        duration: 4000,
        position: 'top-right',
        icon: '✏️',
      })
      playNotificationSound()
    }

    const handleCommentCreated = (event: any) => {
      console.log('Comment created event received:', event.detail)
      queryClient.invalidateQueries({ queryKey: ['notifications'] })

      toast.success('Novo comentário adicionado!', {
        duration: 4000,
        position: 'top-right',
        icon: '💬',
      })
      playNotificationSound()
    }

    const handleNotification = (event: any) => {
      console.log('General notification event received:', event.detail)
      queryClient.invalidateQueries({ queryKey: ['notifications'] })

      toast.success('Nova notificação!', {
        duration: 4000,
        position: 'top-right',
        icon: '🔔',
      })
      playNotificationSound()
    }

    window.addEventListener('task:created', handleTaskCreated)
    window.addEventListener('task:updated', handleTaskUpdated)
    window.addEventListener('comment:created', handleCommentCreated)
    window.addEventListener('notification', handleNotification)

    return () => {
      window.removeEventListener('task:created', handleTaskCreated)
      window.removeEventListener('task:updated', handleTaskUpdated)
      window.removeEventListener('comment:created', handleCommentCreated)
      window.removeEventListener('notification', handleNotification)
    }
  }, [queryClient, playNotificationSound])
}
