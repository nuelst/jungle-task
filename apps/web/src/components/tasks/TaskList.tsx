import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Task, TaskPriority, TaskStatus } from '@jungle-gaming/types'
import { AlertCircle, Calendar, CheckCircle, Clock, Eye, User } from 'lucide-react'
import { useState } from 'react'
import { TaskDetails } from './TaskDetails'

interface TaskListProps {
  readonly tasks: Task[]
  readonly loading?: boolean
}

const priorityColors = {
  [TaskPriority.LOW]: 'bg-green-100 text-green-800',
  [TaskPriority.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [TaskPriority.HIGH]: 'bg-orange-100 text-orange-800',
  [TaskPriority.URGENT]: 'bg-red-100 text-red-800',
}

const statusColors = {
  [TaskStatus.TODO]: 'bg-gray-100 text-gray-800',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [TaskStatus.REVIEW]: 'bg-purple-100 text-purple-800',
  [TaskStatus.DONE]: 'bg-green-100 text-green-800',
}

const statusIcons = {
  [TaskStatus.TODO]: Clock,
  [TaskStatus.IN_PROGRESS]: AlertCircle,
  [TaskStatus.REVIEW]: Eye,
  [TaskStatus.DONE]: CheckCircle,
}

export function TaskList({ tasks, loading }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={`skeleton-${i}`} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No tasks found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const StatusIcon = statusIcons[task.status]
        const dueDate = new Date(task.dueDate)
        const isOverdue = dueDate < new Date() && task.status !== TaskStatus.DONE

        return (
          <Card key={task.id} className={`${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {task.description}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Badge className={priorityColors[task.priority]}>
                    {task.priority}
                  </Badge>
                  <Badge className={statusColors[task.status]}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {dueDate.toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {task.assignedUsers.length} assigned
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTask(task)}
                  >
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {selectedTask && (
        <TaskDetails
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  )
}

