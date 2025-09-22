import Logo from '@/assets/logo.png'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { apiService } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { useQuery } from '@tanstack/react-query'
import { Link, useRouter } from '@tanstack/react-router'
import { Bell, ChevronDown, Eye, Home, ListTodo, User, UserCircle } from 'lucide-react'
import { useState } from 'react'
import { ProfileForm } from './ProfileForm'

export function Header() {
  const { user, logout } = useAuthStore()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const router = useRouter()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Tasks', href: '/tasks', icon: ListTodo },
  ]

  const isActive = (path: string) => router.state.location.pathname === path

  const { data: recentNotifications } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: () => apiService.getNotifications({ size: 5, page: 1 }),
    enabled: !!user,
  })

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center justify-between space-x-8">
            <div className="flex items-center space-x-2">
              <img src={Logo} alt="Jungle Gaming" className="w-12 h-12" />
            </div>
            <div>
              <nav className="hidden md:flex space-x-6">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.href)
                        ? 'bg-blue-100 text-primary'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const info = (window as any).webSocketService?.getConnectionInfo?.()
                console.log('🔍 WebSocket Debug Info:', info)
                alert(`WebSocket Status:\nConnected: ${info?.connected}\nSocket ID: ${info?.socketId}\nTransport: ${info?.transport}`)
              }}
              title="Debug WebSocket Connection"
            >
              <Wifi className="h-4 w-4" />
            </Button> */}

            <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {recentNotifications?.data?.data && recentNotifications.data.data.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {recentNotifications.data.data.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end">
                <div className="p-2">
                  <h4 className="font-semibold text-sm">Notificações Recentes</h4>
                </div>
                <DropdownMenuSeparator />
                <div className="max-h-64 overflow-y-auto">
                  {recentNotifications?.data?.data?.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Nenhuma notificação
                    </div>
                  ) : (
                    recentNotifications?.data?.data?.map((notification: any) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={`p-3 ${notification.status === 'unread' ? 'bg-blue-50 border-l-4 border-l-primary' : ''}`}
                      >
                        <div className="flex flex-col space-y-1 w-full">
                          <div className="flex items-start justify-between">
                            <p className={`text-sm font-medium ${notification.status === 'unread' ? 'text-primary font-semibold' : 'text-gray-900'}`}>
                              {notification.title}
                            </p>
                            {notification.status === 'unread' && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                          <p className={`text-xs ${notification.status === 'unread' ? 'text-primary' : 'text-muted-foreground'}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/notifications" className="flex items-center justify-center w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    See all notifications
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex border-none items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.username}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {user?.role?.toLowerCase()}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowProfile(true)}>
                  <UserCircle className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <User className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <Drawer open={showProfile} onOpenChange={setShowProfile}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Profile</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4">
            <ProfileForm
              onSuccess={() => setShowProfile(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </header>
  )
}
