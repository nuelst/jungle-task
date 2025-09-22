import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'
import { useAuthStore } from '@/store/auth.store'
import { UserRole } from '@jungle-gaming/types'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { KanbanBoard } from './KanbanBoard'
import { TaskForm } from './TaskForm'


export function TasksPage() {
  const { user } = useAuthStore()
  const [filter, setFilter] = useState<'all' | 'my'>('all')

  useRealtimeNotifications()

  const isAdmin = user?.role === UserRole.ADMIN

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col overflow-hidden  bg-gray-50">
        <div className="flex md:px-6 container mx-auto justify-end items-center self-end space-x-4">
          <Select value={filter} onValueChange={(value: 'all' | 'my') => setFilter(value)}>
            <SelectTrigger className="w-40 shadow-none">
              <SelectValue placeholder="Filter tasks" />
            </SelectTrigger>
            <SelectContent className="shadow-none">
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="my">My Tasks</SelectItem>
            </SelectContent>
          </Select>
          {isAdmin && (
            <TaskForm
              onClose={() => { }}
              onSuccess={() => {
                // Invalidate queries to refresh the list
              }}
            >
              <Button className="shadow-none">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </TaskForm>
          )}

        </div>

        <KanbanBoard filter={filter} />
      </main>



    </div>
  )
}
