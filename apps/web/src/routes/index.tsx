import { useAuthStore } from '@/store/auth.store'
import { UserRole } from '@jungle-gaming/types'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const { isAuthenticated, user } = useAuthStore.getState()
    if (isAuthenticated) {
      if (user?.role === UserRole.ADMIN) {
        throw redirect({ to: '/dashboard' })
      } else {
        throw redirect({ to: '/tasks' })
      }
    } else {
      throw redirect({ to: '/login' })
    }
  },
})