import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { User, UserRole } from '@jungle-gaming/types'
import { Calendar, Mail, Shield, User as UserIcon, X } from 'lucide-react'

interface UserProfileProps {
  readonly user: User
  readonly isOpen: boolean
  readonly onClose: () => void
}

const roleColors = {
  [UserRole.ADMIN]: 'bg-red-100 text-red-800',
  [UserRole.USER]: 'bg-blue-100 text-blue-800',
}

const roleIcons = {
  [UserRole.ADMIN]: Shield,
  [UserRole.USER]: UserIcon,
}

export function UserProfile({ user, isOpen, onClose }: UserProfileProps) {
  const RoleIcon = roleIcons[user.role]

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b">
          <div className="flex justify-between items-center">
            <DrawerTitle className="text-2xl font-bold">User Profile</DrawerTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* User Info Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{user.username}</CardTitle>
                    <CardDescription className="text-lg">{user.email}</CardDescription>
                    <div className="mt-2">
                      <Badge className={roleColors[user.role]}>
                        <RoleIcon className="h-3 w-3 mr-1" />
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-sm">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <UserIcon className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Username</p>
                        <p className="text-sm">{user.username}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Member Since</p>
                        <p className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Last Updated</p>
                        <p className="text-sm">{new Date(user.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Role Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Role</span>
                    <Badge className={roleColors[user.role]}>
                      <RoleIcon className="h-3 w-3 mr-1" />
                      {user.role}
                    </Badge>
                  </div>

                  <div className="text-sm text-gray-600">
                    {user.role === UserRole.ADMIN ? (
                      <p>
                        Administrators have full access to the system, including the ability to create tasks,
                        manage users, and access the dashboard.
                      </p>
                    ) : (
                      <p>
                        Regular users can view and manage their assigned tasks, add comments,
                        and view task details.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.floor((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                    <p className="text-sm text-gray-600">Days Active</p>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {user.role === UserRole.ADMIN ? 'Full' : 'Limited'}
                    </p>
                    <p className="text-sm text-gray-600">Access Level</p>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {user.role === UserRole.ADMIN ? 'Yes' : 'No'}
                    </p>
                    <p className="text-sm text-gray-600">Admin Rights</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
