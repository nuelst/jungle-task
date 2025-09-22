import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiService } from '@/lib/api'
import { UserRole } from '@jungle-gaming/types'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

interface CreateUserFormProps {
  readonly onClose: () => void
  readonly onSuccess: () => void
}

interface CreateUserData {
  name: string
  email: string
  password: string
  role: UserRole
}

function slugify(name: string): string {
  const today = new Date();
  const dateStr = today
    .toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    .split('/')
    .join('');

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

  return `${slug}_${dateStr}`;
}

export function CreateUserForm({ onClose, onSuccess }: CreateUserFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<CreateUserData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: UserRole.USER,
    },
  })

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form
  const watchedName = watch('name')

  const generatedUsername = watchedName ? slugify(watchedName) : ''

  const onSubmit = async (data: CreateUserData) => {
    setIsLoading(true)
    setError(null)

    try {
      const userData = {
        username: generatedUsername,
        email: data.email,
        password: data.password,
        role: data.role,
      }

      await apiService.createUser(userData)
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating user')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Create New User</h2>
        <p className="text-muted-foreground">
          Fill the data to create a new user
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            {...register('name', { required: 'Name is required' })}
            id="name"
            placeholder="Full name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email invalid'
              }
            })}
            id="email"
            type="email"
            placeholder="email@exemplo.com"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Tipo de Usuário</Label>
          <Select
            value={watch('role')}
            onValueChange={(value: UserRole) => setValue('role', value)}
          >
            <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select the type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UserRole.USER}>User</SelectItem>
              <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-sm text-red-500">{errors.role.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username (gerado automaticamente)</Label>
          <Input
            id="username"
            value={generatedUsername}
            disabled
            className="bg-gray-50 text-gray-600"
          />
          <p className="text-xs text-muted-foreground">
            The username will be generated automatically based on the name (only letters, numbers and underscores)
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </form>
    </div>
  )
}
