import { Dashboard } from '@/components/dashboard/Dashboard'
import { useAuthStore } from '@/store/auth.store'
import { UserRole } from '@jungle-gaming/types'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
  beforeLoad: () => {
    const { isAuthenticated, user } = useAuthStore.getState()
    if (!isAuthenticated) {
      throw redirect({ to: '/login' })
    }
    if (user?.role !== UserRole.ADMIN) {
      throw redirect({ to: '/tasks' })
    }
  },
})

function DashboardPage() {
  return <Dashboard />
}

