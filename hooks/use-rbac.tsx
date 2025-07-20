import React from 'react'
import { useAuth } from './use-auth'
import { UserRole, Permission, hasPermission, getAccessibleMenuItems } from '@/lib/rbac'

// =============================================
// React Hook for RBAC in Frontend
// =============================================

interface UseRBACReturn {
  // 현재 사용자 정보
  userRole: UserRole | null
  isAuthenticated: boolean
  
  // 권한 확인 함수들
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  
  // 역할 확인 함수들
  isUser: boolean
  isGroupLeader: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  
  // UI 제어 함수들
  canAccessPage: (path: string) => boolean
  getAccessibleMenus: () => any[]
  
  // 리소스 접근 확인
  canEditResource: (resourceUserId: string) => boolean
  canDeleteResource: (resourceUserId: string) => boolean
}

/**
 * 역할 기반 접근 제어를 위한 React Hook
 */
export function useRBAC(): UseRBACReturn {
  const { user, profile, loading } = useAuth()
  
  const userRole: UserRole | null = profile?.role || null
  const isAuthenticated = !!user && !loading
  
  // 권한 확인 함수들
  const checkPermission = (permission: Permission): boolean => {
    if (!userRole) return false
    return hasPermission(userRole, permission)
  }
  
  const checkAnyPermission = (permissions: Permission[]): boolean => {
    if (!userRole) return false
    return permissions.some(permission => hasPermission(userRole, permission))
  }
  
  const checkAllPermissions = (permissions: Permission[]): boolean => {
    if (!userRole) return false
    return permissions.every(permission => hasPermission(userRole, permission))
  }
  
  // 역할 확인 함수들
  const isUser = userRole === 'user'
  const isGroupLeader = userRole === 'group_leader'
  const isAdmin = userRole === 'admin'
  const isSuperAdmin = userRole === 'super_admin'
  
  // UI 제어 함수들
  const canAccessPage = (path: string): boolean => {
    if (!userRole) return false
    
    // 공개 페이지는 누구나 접근 가능
    const publicPaths = ['/', '/rooms', '/programs', '/login', '/signup']
    if (publicPaths.includes(path)) return true
    
    // 관리자 페이지 접근 권한 확인
    if (path.startsWith('/admin')) {
      return checkAnyPermission(['users:read', 'reservations:read'])
    }
    
    // 사용자 페이지는 로그인한 사용자만
    if (path.startsWith('/my-')) {
      return isAuthenticated
    }
    
    return true
  }
  
  const getAccessibleMenus = () => {
    if (!userRole) return []
    return getAccessibleMenuItems(userRole)
  }
  
  // 리소스 접근 확인
  const canEditResource = (resourceUserId: string): boolean => {
    if (!user || !userRole) return false
    
    // 관리자는 모든 리소스 수정 가능
    if (isAdmin || isSuperAdmin) return true
    
    // 사용자는 본인 리소스만 수정 가능
    return user.id === resourceUserId
  }
  
  const canDeleteResource = (resourceUserId: string): boolean => {
    if (!user || !userRole) return false
    
    // 최고 관리자만 삭제 가능
    if (isSuperAdmin) return true
    
    // 일반 관리자는 제한적 삭제 권한
    if (isAdmin) {
      return checkPermission('users:delete') && user.id !== resourceUserId // 본인은 삭제 불가
    }
    
    return false
  }
  
  return {
    // 현재 사용자 정보
    userRole,
    isAuthenticated,
    
    // 권한 확인 함수들
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    
    // 역할 확인 함수들
    isUser,
    isGroupLeader,
    isAdmin,
    isSuperAdmin,
    
    // UI 제어 함수들
    canAccessPage,
    getAccessibleMenus,
    
    // 리소스 접근 확인
    canEditResource,
    canDeleteResource
  }
}

// =============================================
// 권한 기반 UI 컴포넌트들
// =============================================

interface ProtectedComponentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface RoleGuardProps extends ProtectedComponentProps {
  allowedRoles: UserRole[]
}

interface PermissionGuardProps extends ProtectedComponentProps {
  requiredPermission: Permission | Permission[]
  requireAll?: boolean // true: 모든 권한 필요, false: 하나라도 있으면 됨
}

/**
 * 특정 역할만 접근할 수 있는 컴포넌트
 */
export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback = null 
}: RoleGuardProps) {
  const { userRole } = useRBAC()
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

/**
 * 특정 권한이 있는 사용자만 접근할 수 있는 컴포넌트
 */
export function PermissionGuard({ 
  children, 
  requiredPermission, 
  requireAll = false,
  fallback = null 
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useRBAC()
  
  const permissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission]
  
  let hasAccess = false
  if (requireAll) {
    hasAccess = hasAllPermissions(permissions)
  } else {
    hasAccess = hasAnyPermission(permissions)
  }
  
  if (!hasAccess) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

/**
 * 관리자만 접근할 수 있는 컴포넌트
 */
export function AdminGuard({ children, fallback = null }: ProtectedComponentProps) {
  return (
    <RoleGuard allowedRoles={['admin', 'super_admin']} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

/**
 * 최고 관리자만 접근할 수 있는 컴포넌트
 */
export function SuperAdminGuard({ children, fallback = null }: ProtectedComponentProps) {
  return (
    <RoleGuard allowedRoles={['super_admin']} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

/**
 * 모임장 이상 권한이 필요한 컴포넌트
 */
export function GroupLeaderGuard({ children, fallback = null }: ProtectedComponentProps) {
  return (
    <RoleGuard allowedRoles={['group_leader', 'admin', 'super_admin']} fallback={fallback}>
      {children}
    </RoleGuard>
  )
} 