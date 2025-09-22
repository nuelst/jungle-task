import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'
import { apiService } from '@/lib/api'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Check, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useInView } from 'react-intersection-observer'

export function NotificationsPage() {
  const queryClient = useQueryClient()
  const { ref, inView } = useInView()

  useRealtimeNotifications()

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['notifications', 'infinite'],
    queryFn: ({ pageParam = 1 }) => apiService.getNotifications({ page: pageParam, size: 10 }),
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.data.total / 10)
      return lastPage.data.page < totalPages ? lastPage.data.page + 1 : undefined
    },
    initialPageParam: 1,
  })

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => apiService.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
      toast.success('Notification marked as read')
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiService.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
      toast.success('All notifications marked as read')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
      toast.success('Notification deleted')
    },
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const allNotifications = data?.pages.flatMap(page => page.data.data) || []

  if (status === 'pending') {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="space-y-4">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={`skeleton-${i}`} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-red-600">Error loading notifications: {error?.message}</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Bell className="h-6 w-6 mr-2" />
                  Notifications
                </h1>
                <p className="text-gray-600 mt-1">
                  Stay updated with your tasks and activities
                </p>
              </div>
              {allNotifications.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark all as read
                </Button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {allNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                  <p className="text-gray-500">You're all caught up! Check back later for updates.</p>
                </CardContent>
              </Card>
            ) : (
              allNotifications.map((notification: any) => (
                <Card
                  key={notification.id}
                  className={`transition-all duration-200 ${notification.status === 'unread'
                    ? 'bg-blue-50 border-blue-300 shadow-md ring-1 ring-blue-200'
                    : 'bg-white border-gray-200'
                    }`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start space-x-3">
                          <div className={`w-3 h-3 rounded-full mt-1 ${notification.status === 'unread' ? 'bg-blue-500' : 'bg-gray-300'
                            }`} />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className={`font-medium text-sm ${notification.status === 'unread' ? 'text-blue-900 font-semibold' : 'text-gray-900'}`}>
                                {notification.title}
                              </h4>
                              {notification.status === 'unread' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Nova
                                </span>
                              )}
                            </div>
                            <p className={`text-sm mt-1 ${notification.status === 'unread' ? 'text-blue-700' : 'text-gray-600'}`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        {notification.status === 'unread' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsReadMutation.mutate(notification.id)}
                            disabled={markAsReadMutation.isPending}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(notification.id)}
                          disabled={deleteMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            <div ref={ref} className="h-4" />

            {!hasNextPage && allNotifications.length > 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                You've reached the end of your notifications
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
