import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import MultiSelect from '@/components/ui/multiselect'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateTask } from '@/hooks/useCreateTask'
import { apiService } from '@/lib/api'
// import { useAuthStore } from '@/store/auth.store'
import { TaskPriority, User } from '@jungle-gaming/types'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

interface TaskFormProps {
  readonly onClose: () => void
  readonly onSuccess: () => void
  readonly children?: React.ReactNode
}

export function TaskForm({ onClose, onSuccess, children }: TaskFormProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const { data: users, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiService.getUsers(),
  })

  // const { isAuthenticated, accessToken } = useAuthStore()

  // console.log('Users data:', users)
  // console.log('Users loading:', usersLoading)
  // console.log('Users error:', usersError)
  // console.log('Auth state - isAuthenticated:', isAuthenticated)
  // console.log('Auth state - accessToken:', accessToken ? 'Present' : 'Missing')

  const {
    formData,
    updateField,
    resetForm,
    submitTask,
    isLoading,
    isError,
    error,
  } = useCreateTask({
    onSuccess: () => {
      onSuccess()
      setIsDrawerOpen(false)
      resetForm()
    },
    onError: (error) => {
      console.error('Error creating task:', error)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitTask()
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
    resetForm()
    onClose()
  }

  const userOptions = users?.data?.map((user: User) => ({
    label: user.username,
    value: user.id,
  })) || []

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        {children || <Button>New Task</Button>}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create New Task</DrawerTitle>
          <DrawerDescription>
            Add a new task to the project
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter task title"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter task description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={4}
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: TaskPriority) => updateField('priority', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                    <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                    <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                    <SelectItem value={TaskPriority.URGENT}>Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => updateField('dueDate', e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedUsers">Assign to Users</Label>
              <div className="space-y-2">
                {/* <div className="text-xs text-gray-500">
                  Auth: {isAuthenticated ? '✅' : '❌'} |
                  Token: {accessToken ? '✅' : '❌'} |
                  Users: {users?.data?.length || 0} |
                  Loading: {usersLoading ? '⏳' : '✅'}
                </div> */}
                {(() => {
                  if (usersLoading) {
                    return <div className="p-2 text-sm text-gray-500">Loading users...</div>
                  }
                  if (usersError) {
                    return <div className="p-2 text-sm text-red-500">Error loading users: {usersError.message}</div>
                  }
                  return (
                    <MultiSelect
                      options={userOptions}
                      value={formData.assignedUserIds.map(id => userOptions.find(option => option.value === id) || { value: id, label: id })}
                      onChange={(options) => updateField('assignedUserIds', options.map(option => option.value))}
                      placeholder="Select users to assign"
                      hidePlaceholderWhenSelected
                      disabled={isLoading}
                    />
                  )
                })()}
              </div>
            </div>

            {isError && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                Error creating task: {error?.message || 'Unknown error'}
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleDrawerClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}


