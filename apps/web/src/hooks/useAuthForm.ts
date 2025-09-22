import { apiService } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters long')
    .max(20, 'Username must not exceed 20 characters')
    .regex(/^\w+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'), // example: MySecure123
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>

export function useAuthForm() {
  const navigate = useNavigate()
  const { login, setError } = useAuthStore()
  const [isRegistering, setIsRegistering] = useState(false)

  const form = useForm({
    resolver: zodResolver(isRegistering ? registerSchema : loginSchema),
  })

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) => apiService.login(data),
    onSuccess: (response) => {
      login(response.data)
      toast.success('Login successful!')
      navigate({ to: '/dashboard' })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Login failed'
      setError(message)
      toast.error(message)
    },
  })

  const registerMutation = useMutation({
    mutationFn: (data: RegisterFormData) => apiService.register(data),
    onSuccess: (response) => {
      login(response.data)
      toast.success('Registration successful!')
      navigate({ to: '/dashboard' })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Registration failed'
      setError(message)
      toast.error(message)
    },
  })

  const onSubmit = (data: any) => {
    if (isRegistering) {
      registerMutation.mutate(data as RegisterFormData)
    } else {
      loginMutation.mutate(data as LoginFormData)
    }
  }

  const toggleMode = () => {
    setIsRegistering(!isRegistering)
    form.reset()
  }

  const isLoading = loginMutation.isPending || registerMutation.isPending

  return {
    isRegistering,
    toggleMode,
    form,
    onSubmit,
    isLoading,
    loginMutation,
    registerMutation,
  }
}
