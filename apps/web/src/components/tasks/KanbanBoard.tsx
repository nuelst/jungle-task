import { Kanban } from '@/components/ui/kanban'
import { apiService } from '@/lib/api'
import { Task, TaskStatus } from '@jungle-gaming/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { TaskDetails } from './TaskDetails'

interface KanbanBoardProps {
  readonly filter?: 'all' | 'my'
}

export function KanbanBoard({ filter = 'all' }: KanbanBoardProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const queryClient = useQueryClient()


  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', filter],
    queryFn: () => {
      if (filter === 'my') {
        return apiService.getMyTasks()
      }
      return apiService.getTasks({})
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      apiService.updateTask(taskId, { status: status as TaskStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'all'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'my'] })
    },
    onError: (error) => {
      console.error('Failed to update task:', error)
    },
  })

  const handleTaskMove = (taskId: string, newStatus: string) => {
    updateTaskMutation.mutate({ taskId, status: newStatus })
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
  }

  if (tasksLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="space-y-4 w-full">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={`skeleton-${i}`} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!tasks?.data?.data?.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No tasks found</p>
      </div>
    )
  }

  const tasksByStatus = tasks.data.data.reduce((acc: Record<string, Task[]>, task: Task) => {
    if (!acc[task.status]) {
      acc[task.status] = []
    }
    acc[task.status].push(task)
    return acc
  }, {})

  const columns = [
    {
      id: TaskStatus.TODO,
      title: 'To Do',
      tasks: tasksByStatus[TaskStatus.TODO] || [],
    },
    {
      id: TaskStatus.IN_PROGRESS,
      title: 'In Progress',
      tasks: tasksByStatus[TaskStatus.IN_PROGRESS] || [],
    },
    {
      id: TaskStatus.REVIEW,
      title: 'Review',
      tasks: tasksByStatus[TaskStatus.REVIEW] || [],
    },
    {
      id: TaskStatus.DONE,
      title: 'Done',
      tasks: tasksByStatus[TaskStatus.DONE] || [],
    },
  ]

  return (
    <>

      <Kanban
        columns={columns}
        onTaskMove={handleTaskMove}
        onTaskClick={handleTaskClick}
      />

      {selectedTask && (
        <TaskDetails
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </>
  )
}
