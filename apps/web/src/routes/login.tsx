import { LoginForm } from '@/components/auth/login-form'
import { useAuthStore } from '@/store/auth.store'


import logo from "@/assets/logo.png"
import mainImage from "@/assets/main-image.svg"
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: LoginPage,
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (isAuthenticated) {
      throw redirect({ to: '/dashboard' })
    }
  },
})

function LoginPage() {

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center items-center gap-2 md:justify-start">
          <div className=" text-primary-foreground flex size-10 items-center justify-center rounded-md">
            <img src={logo} alt="Logo" className="size-8" />
          </div>
          <span className="text-2xl font-bold"> Jungle Tasks  </span>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src={mainImage}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}




