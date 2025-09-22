import { Header } from '@/components/layout/Header'
import { NotificationsPanel } from '@/components/notifications/NotificationsPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'
import { apiService } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, CheckSquare, Users } from 'lucide-react'
import { useState } from 'react'
import { UsersTasksTable } from './data-talbel'
import { PriorityChart } from './priority-cart'
import { StatusChart } from './status-chart'

export function Dashboard() {
  const [showNotifications, setShowNotifications] = useState(false)

  useRealtimeNotifications()

  const { data: allTasks } = useQuery({
    queryKey: ['tasks', 'all'],
    queryFn: () => apiService.getTasks({}),
  })

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiService.getUsers(),
  })

  const { data: usersWithStats, isLoading: usersStatsLoading } = useQuery({
    queryKey: ['users', 'stats'],
    queryFn: () => apiService.getUsersWithStats(),
  })

  const { data: systemOverview } = useQuery({
    queryKey: ['system', 'overview'],
    queryFn: () => apiService.getSystemOverview(),
  })

  const { data: debugUsers } = useQuery({
    queryKey: ['debug', 'users'],
    queryFn: () => apiService.debugUsers(),
  })

  console.log('Debug users data:', debugUsers)
  console.log('System overview data:', systemOverview)


  const taskStats = systemOverview?.data ? {
    total: systemOverview.data.totalTasks,
    done: systemOverview.data.tasksByStatus.done,
    inProgress: systemOverview.data.tasksByStatus.inProgress,
    todo: systemOverview.data.tasksByStatus.todo,
    review: systemOverview.data.tasksByStatus.review,
  } : {
    total: allTasks?.data?.data?.length || 0,
    done: allTasks?.data?.data?.filter((task: any) => task.status === 'DONE').length || 0,
    inProgress: allTasks?.data?.data?.filter((task: any) => task.status === 'IN_PROGRESS').length || 0,
    todo: allTasks?.data?.data?.filter((task: any) => task.status === 'TODO').length || 0,
    review: allTasks?.data?.data?.filter((task: any) => task.status === 'REVIEW').length || 0,
  }

  const userCount = systemOverview?.data?.totalUsers || users?.data?.length || 0

  const statusChartData = [
    { status: 'Done', count: taskStats.done, color: '#10b981' },
    { status: 'In Progress', count: taskStats.inProgress, color: '#3b82f6' },
    { status: 'To Do', count: taskStats.todo, color: '#f59e0b' },
    { status: 'Review', count: taskStats.review, color: '#8b5cf6' },
  ]

  const hasData = statusChartData.some(item => item.count > 0)
  const chartData = hasData ? statusChartData.filter(item => item.count > 0) : [
    { status: 'No Data', count: 1, color: '#e5e7eb' }
  ]


  const priorityChartData = allTasks?.data?.data?.reduce((acc: any, task: any) => {
    const priority = task.priority || 'MEDIUM'
    acc[priority] = (acc[priority] || 0) + 1
    return acc
  }, {}) || {}

  const priorityChart = [
    { priority: 'Low', count: priorityChartData.LOW || 0, color: '#6b7280' },
    { priority: 'Medium', count: priorityChartData.MEDIUM || 0, color: '#3b82f6' },
    { priority: 'High', count: priorityChartData.HIGH || 0, color: '#f59e0b' },
    { priority: 'Urgent', count: priorityChartData.URGENT || 0, color: '#ef4444' },
  ]



  const usersWithTasks = usersWithStats?.data || []

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{taskStats.total}</div>
                <p className="text-xs text-muted-foreground">
                  All tasks in the system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Done Tasks</CardTitle>
                <CheckSquare className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{taskStats.done}</div>
                <p className="text-xs text-muted-foreground">
                  {taskStats.total > 0 ? Math.round((taskStats.done / taskStats.total) * 100) : 0}% completion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userCount}</div>
                <p className="text-xs text-muted-foreground">
                  Registered users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
                <p className="text-xs text-muted-foreground">
                  Tasks currently being worked on
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <UsersTasksTable users={usersWithTasks} loading={usersStatsLoading} />

            </div>

            <div className="lg:col-span-1 space-y-6">
              <StatusChart chartData={chartData} />
              <PriorityChart chartData={priorityChart} />
              <NotificationsPanel
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
              />
            </div>
          </div>
        </div>

      </main>

    </div>
  )
}

