import { NotificationsPage } from '@/components/notifications/NotificationsPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/notifications')({
  component: NotificationsPage,
})