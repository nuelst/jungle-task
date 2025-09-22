import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuthForm } from '@/hooks/useAuthForm'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export function LoginForm() {
  const { isRegistering, toggleMode, form, onSubmit, isLoading } = useAuthForm()
  const { register, handleSubmit, formState: { errors } } = form
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Card className='p-0 shadow-none border-none'>
      <CardHeader className='px-0'>
        <CardTitle className='text-2xl font-bold'>{isRegistering ? 'Create Account' : 'Sign In'}</CardTitle>
        <CardDescription className='text-sm text-muted-foreground'>
          {isRegistering
            ? 'Enter your details to create a new account'
            : 'Enter your credentials to access your account'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className='p-0'>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div>
            <Input
              {...register('email')}
              type="email"
              placeholder="Email address"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{(errors.email as any)?.message}</p>
            )}
          </div>

          {isRegistering && (
            <div>
              <Input
                {...register('username')}
                type="text"
                placeholder="Username"
                className={(errors as any).username ? 'border-red-500' : ''}
              />
              {(errors as any).username && (
                <p className="text-sm text-red-500 mt-1">{(errors as any).username.message}</p>
              )}
            </div>
          )}

          <div>
            <div className="relative">
              <Input
                {...register('password')}
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
              <p className="text-sm text-red-500 mt-1">{(errors.password as any)?.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {(() => {
              if (isLoading) return 'Loading...'
              return isRegistering ? 'Create Account' : 'Sign In'
            })()}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-primary hover:text-primary/80"
            >
              {isRegistering
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

