import { TasksPage } from '@/components/tasks/TasksPage'
import { useAuthStore } from '@/store/auth.store'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/tasks')({
  component: TasksPageComponent,
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
})

function TasksPageComponent() {
  return (
    <TasksPage />
  )
}
