import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { apiService } from '@/lib/api'
import { Comment, Task, TaskPriority, TaskStatus } from '@jungle-gaming/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Calendar, CheckCircle, Clock, Eye, MessageSquare, Send, User, X } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface TaskDetailsProps {
  readonly task: Task
  readonly onClose: () => void
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

export function TaskDetails({ task, onClose }: TaskDetailsProps) {
  const [newComment, setNewComment] = useState('')
  const queryClient = useQueryClient()

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['task-comments', task.id],
    queryFn: () => apiService.getTaskComments(task.id),
  })

  const createCommentMutation = useMutation({
    mutationFn: (content: string) => apiService.createTaskComment(task.id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', task.id] })
      setNewComment('')
      toast.success('Comment added successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add comment')
    },
  })

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      createCommentMutation.mutate(newComment.trim())
    }
  }

  const StatusIcon = statusIcons[task.status]
  const dueDate = new Date(task.dueDate)
  const isOverdue = dueDate < new Date() && task.status !== TaskStatus.DONE

  return (
    <Drawer open={true} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="h-screen">
        <DrawerHeader className="border-b flex-shrink-0">
          <div className="flex justify-between items-center">
            <DrawerTitle className="text-2xl font-bold">Task Details</DrawerTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="flex-1 flex flex-col p-6">
          <div className="space-y-4 flex-shrink-0 mb-6">
            <Card className="shadow-none">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{task.title}</CardTitle>
                    <CardDescription className="mt-2">
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
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Due: {dueDate.toLocaleDateString()}</span>
                    {isOverdue && (
                      <Badge variant="destructive" className="ml-2">
                        Overdue
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span>Created by: {task.createdBy?.username || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span>Assigned to: {task.assignedUsers?.length || 0} users</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Created: {new Date(task.createdAt).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Comments ({comments?.data?.data?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <form onSubmit={handleSubmitComment} className="mb-4 flex-shrink-0">
                  <div className="flex space-x-2">
                    <Input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={!newComment.trim() || createCommentMutation.isPending}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>

                <div className="space-y-3 flex-1 overflow-y-auto min-h-0">
                  {commentsLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }, (_, i) => (
                        <div key={`skeleton-${i}`} className="animate-pulse">
                          <div className="h-16 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : (() => {
                    const hasComments = (comments?.data?.data?.length || 0) > 0
                    if (!hasComments) {
                      return (
                        <div className="text-center py-4 text-gray-500">
                          No comments yet
                        </div>
                      )
                    }
                    return (
                      comments?.data?.data?.map((comment: Comment) => (
                        <div key={comment.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-sm">
                                {comment.author?.username || 'Unknown'}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      ))
                    )
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
