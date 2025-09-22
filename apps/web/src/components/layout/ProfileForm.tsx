import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthStore } from '@/store/auth.store'
import { User, UserRole } from '@jungle-gaming/types'
import { Eye, EyeOff, Save, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

interface ProfileFormProps {
  readonly onSuccess: () => void
}

interface ProfileData {
  username: string
  email: string
  password: string
  role: UserRole
}

export function ProfileForm({ onSuccess }: ProfileFormProps) {
  const { user, updateUser } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<ProfileData>({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      password: '',
      role: user?.role || UserRole.USER,
    },
  })

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form

  const onSubmit = async (data: ProfileData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Here you would call an API to update the user
      // For now, we'll just update the local store
      const updatedUser: User = {
        ...user,
        id: user?.id || '',
        username: data.username,
        email: data.email,
        role: data.role,
        createdAt: user?.createdAt || new Date(),
        updatedAt: new Date(),
      }

      updateUser(updatedUser)
      setIsEditing(false)
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar perfil')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setError(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setError(null)
    // Reset form to original values
    form.reset({
      username: user?.username || '',
      email: user?.email || '',
      password: '',
      role: user?.role || UserRole.USER,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Profile</h2>
          <p className="text-muted-foreground">
            Manage your account information
          </p>
        </div>
        {!isEditing && (
          <Button onClick={handleEdit} size="sm">
            <Save className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            {...register('username', { required: 'Username é obrigatório' })}
            id="username"
            disabled={!isEditing}
            className={errors.username ? 'border-red-500' : ''}
          />
          {errors.username && (
            <p className="text-sm text-red-500">{errors.username.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            {...register('email', {
              required: 'Email é obrigatório',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email inválido'
              }
            })}
            id="email"
            type="email"
            disabled={!isEditing}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password - only show when editing */}
        {isEditing && (
          <div className="space-y-2">
            <Label htmlFor="password">New Password (optional)</Label>
            <div className="relative">
              <Input
                {...register('password', {
                  minLength: {
                    value: 6,
                    message: 'Senha deve ter pelo menos 6 caracteres'
                  }
                })}
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Leave empty to keep current password"
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
        )}

        {/* Role */}
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={watch('role')}
            onValueChange={(value: UserRole) => setValue('role', value)}
            disabled={!isEditing}
          >
            <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UserRole.USER}>User</SelectItem>
              <SelectItem value={UserRole.ADMIN}>Administrator</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-sm text-red-500">{errors.role.message}</p>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Action buttons */}
        {isEditing && (
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </form>

      {/* User info display when not editing */}
      {!isEditing && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">User ID:</span>
            <span className="text-sm text-gray-900">{user?.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">Created:</span>
            <span className="text-sm text-gray-900">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">Last Updated:</span>
            <span className="text-sm text-gray-900">
              {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
