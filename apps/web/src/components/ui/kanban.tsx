"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Task } from "@jungle-gaming/types"
import { Calendar, User } from "lucide-react"
import * as React from "react"

interface KanbanColumn {
  id: string
  title: string
  tasks: Task[]
}

interface KanbanProps {
  readonly columns: KanbanColumn[]
  readonly onTaskMove: (taskId: string, newStatus: string) => void
  readonly onTaskClick?: (task: Task) => void
}

const TaskCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    task: Task
    onClick?: () => void
    isDragging?: boolean
  }
>(({ task, onClick, isDragging = false, className, ...props }, ref) => {
  const priorityColors = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800',
  }

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'DONE'

  return (
    <Card
      ref={ref}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-all hover:shadow-md",
        isOverdue && "border-red-200 bg-red-50",
        isDragging && "opacity-50 scale-95 rotate-1",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium line-clamp-2">
            {task.title}
          </CardTitle>
          <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
            {task.priority}
          </Badge>
        </div>
        <CardDescription className="text-xs line-clamp-2">
          {task.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(task.dueDate).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {task.assignedUsers.length}
          </div>
        </div>
        {task.assignedUsers.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {task.assignedUsers.slice(0, 3).map((user) => (
              <Badge key={user.id} variant="secondary" className="text-xs">
                {user.username}
              </Badge>
            ))}
            {task.assignedUsers.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{task.assignedUsers.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
})
TaskCard.displayName = "TaskCard"

const DroppableColumn = ({
  column,
  onTaskClick,
  onTaskMove,
  onDragStart,
  onDragEnd,
  draggedTaskId
}: {
  column: KanbanColumn
  onTaskClick?: (task: Task) => void
  onTaskMove: (taskId: string, newStatus: string) => void
  onDragStart: (taskId: string) => void
  onDragEnd: () => void
  draggedTaskId: string | null
}) => {
  const [dragOverColumn, setDragOverColumn] = React.useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    console.log('Drag start:', { taskId, columnId: column.id })
    onDragStart(taskId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', taskId)
    e.dataTransfer.setData('application/json', JSON.stringify({ taskId, fromColumn: column.id }))
  }

  const handleDragEnd = () => {
    onDragEnd()
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(column.id)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()

    let taskId: string
    let fromColumn: string

    try {
      const jsonData = e.dataTransfer.getData('application/json')
      if (jsonData) {
        const data = JSON.parse(jsonData)
        taskId = data.taskId
        fromColumn = data.fromColumn
      } else {
        taskId = e.dataTransfer.getData('text/plain')
        fromColumn = ''
      }
    } catch {
      taskId = e.dataTransfer.getData('text/plain')
      fromColumn = ''
    }

    console.log('Drop event:', { taskId, fromColumn, toColumn: column.id })

    if (taskId && fromColumn !== column.id) {
      console.log(`Moving task ${taskId} from ${fromColumn} to ${column.id}`)
      onTaskMove(taskId, column.id)
    } else {
      console.log('No move needed - same column or invalid data')
    }

    setDragOverColumn(null)
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-sm">{column.title}</h3>
        <Badge variant="secondary" className="text-xs">
          {column.tasks.length}
        </Badge>
      </div>
      <section
        className={cn(
          "flex flex-col gap-2 min-h-[200px] p-3 rounded-lg border-2 border-dashed transition-all duration-200",
          // Desktop: vertical scroll for tasks
          "md:overflow-y-auto md:max-h-[calc(100vh-200px)]",
          // Mobile: horizontal scroll for tasks with proper container
          "overflow-hidden md:overflow-x-hidden",
          dragOverColumn === column.id
            ? "border-blue-500 bg-blue-100 scale-105 shadow-lg"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-column-id={column.id}
        aria-label={`${column.title} column`}
      >
        {/* Mobile: horizontal layout for tasks with proper overflow */}
        <div className="flex gap-2 md:flex-col md:gap-2 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto md:max-h-[calc(100vh-250px)]">
          {column.tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              draggable
              onDragStart={(e) => handleDragStart(e, task.id)}
              onDragEnd={handleDragEnd}
              onClick={() => onTaskClick?.(task)}
              className="w-64 md:w-full transition-all duration-200 text-left flex-shrink-0"
            >
              <TaskCard
                task={task}
                onClick={() => onTaskClick?.(task)}
                isDragging={draggedTaskId === task.id}
              />
            </button>
          ))}
        </div>
        {column.tasks.length === 0 && (
          <div className={cn(
            "flex items-center justify-center h-32 text-sm transition-colors",
            dragOverColumn === column.id
              ? "text-blue-600 font-medium"
              : "text-muted-foreground"
          )}>
            {dragOverColumn === column.id ? "Drop here to move task" : "Drop tasks here"}
          </div>
        )}
      </section>
    </div>
  )
}

export function Kanban({ columns, onTaskMove, onTaskClick }: KanbanProps) {
  const [draggedTaskId, setDraggedTaskId] = React.useState<string | null>(null)

  const handleTaskMove = React.useCallback((taskId: string, newStatus: string) => {
    // Find the current task
    const currentTask = columns
      .flatMap((col) => col.tasks)
      .find((task) => task.id === taskId)

    if (!currentTask) {
      console.log('Task not found')
      return
    }

    // Check if we're moving to a different status
    if (currentTask.status !== newStatus) {
      console.log(`Moving task ${taskId} from ${currentTask.status} to ${newStatus}`)
      onTaskMove(taskId, newStatus)
    } else {
      console.log('Task not moved - same status')
    }
  }, [columns, onTaskMove])

  const handleDragStart = (taskId: string) => {
    console.log('Global drag start:', taskId)
    setDraggedTaskId(taskId)
  }

  const handleDragEnd = () => {
    console.log('Global drag end')
    setDraggedTaskId(null)
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Mobile: Vertical layout for columns */}
      <div className="flex flex-col md:hidden gap-4 h-full overflow-y-auto px-4">
        {columns.map((column) => (
          <DroppableColumn
            key={column.id}
            column={column}
            onTaskClick={onTaskClick}
            onTaskMove={handleTaskMove}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            draggedTaskId={draggedTaskId}
          />
        ))}
      </div>

      {/* Desktop: Horizontal layout for columns */}
      <div className="hidden md:flex md:justify-center md:items-start md:h-full md:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full no-scrollbar max-w-7xl h-full">
          {columns.map((column) => (
            <DroppableColumn
              key={column.id}
              column={column}
              onTaskClick={onTaskClick}
              onTaskMove={handleTaskMove}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              draggedTaskId={draggedTaskId}
            />
          ))}
        </div>
      </div>
    </div>
  )
}