import { apiService } from '@/lib/api'
import { CreateTaskDto, TaskPriority } from '@jungle-gaming/types'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

interface UseCreateTaskOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useCreateTask(options?: UseCreateTaskOptions) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    dueDate: '',
    assignedUserIds: [] as string[],
  })

  const mutation = useMutation({
    mutationFn: (data: CreateTaskDto) => apiService.createTask(data),
    onSuccess: () => {
      setFormData({
        title: '',
        description: '',
        priority: TaskPriority.MEDIUM,
        dueDate: '',
        assignedUserIds: [],
      })
      options?.onSuccess?.()
    },
    onError: (error: Error) => {
      options?.onError?.(error)
    },
  })

  const updateField = <K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: TaskPriority.MEDIUM,
      dueDate: '',
      assignedUserIds: [],
    })
  }

  const submitTask = () => {
    mutation.mutate({
      title: formData.title,
      description: formData.description,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : new Date(),
      priority: formData.priority,
      assignedUserIds: formData.assignedUserIds,
    })
  }

  return {
    formData,
    updateField,
    resetForm,
    submitTask,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  }
}
