import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from './auth'

// =============================================
// 역할 기반 접근 제어 (RBAC) 시스템
// =============================================

export type UserRole = 'user' | 'group_leader' | 'admin' | 'super_admin'
export type Permission = 
  | 'users:read' | 'users:write' | 'users:delete'
  | 'reservations:read' | 'reservations:write' | 'reservations:delete' 
  | 'programs:read' | 'programs:write' | 'programs:delete'
  | 'rooms:read' | 'rooms:write' | 'rooms:delete'
  | 'payments:read' | 'payments:write'
  | 'coupons:read' | 'coupons:write' | 'coupons:delete'
  | 'analytics:read' | 'settings:read' | 'settings:write'

// 역할별 권한 매트릭스
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  user: [
    'reservations:read', // 본인 예약만
    'reservations:write', // 본인 예약만
    'programs:read',
    'rooms:read',
    'payments:read', // 본인 결제만
    'coupons:read'
  ],
  group_leader: [
    'reservations:read', // 본인 + 그룹 예약
    'reservations:write', // 본인 + 그룹 예약
    'programs:read',
    'rooms:read',
    'payments:read', // 본인 결제만
    'coupons:read',
    'users:read' // 그룹 멤버만
  ],
  admin: [
    'users:read',
    'users:write',
    'reservations:read',
    'reservations:write',
    'reservations:delete',
    'programs:read',
    'programs:write',
    'rooms:read',
    'rooms:write',
    'payments:read',
    'payments:write',
    'coupons:read',
    'coupons:write',
    'analytics:read'
  ],
  super_admin: [
    'users:read',
    'users:write',
    'users:delete',
    'reservations:read',
    'reservations:write',
    'reservations:delete',
    'programs:read',
    'programs:write',
    'programs:delete',
    'rooms:read',
    'rooms:write',
    'rooms:delete',
    'payments:read',
    'payments:write',
    'coupons:read',
    'coupons:write',
    'coupons:delete',
    'analytics:read',
    'settings:read',
    'settings:write'
  ]
}

// API 엔드포인트별 필요 권한 정의
const ENDPOINT_PERMISSIONS: Record<string, Permission> = {
  // 사용자 관리
  'GET /api/admin/users': 'users:read',
  'POST /api/admin/users': 'users:write',
  'PUT /api/admin/users': 'users:write',
  'DELETE /api/admin/users': 'users:delete',
  
  // 예약 관리
  'GET /api/reservations': 'reservations:read',
  'POST /api/reservations': 'reservations:write',
  'PUT /api/reservations': 'reservations:write',
  'DELETE /api/reservations': 'reservations:delete',
  
  // 프로그램 관리
  'GET /api/admin/programs': 'programs:read',
  'POST /api/admin/programs': 'programs:write',
  'PUT /api/admin/programs': 'programs:write',
  'DELETE /api/admin/programs': 'programs:delete',
  
  // 객실 관리
  'GET /api/admin/rooms': 'rooms:read',
  'POST /api/admin/rooms': 'rooms:write',
  'PUT /api/admin/rooms': 'rooms:write',
  'DELETE /api/admin/rooms': 'rooms:delete',
  
  // 결제 관리
  'GET /api/admin/payments': 'payments:read',
  'POST /api/admin/payments': 'payments:write',
  
  // 쿠폰 관리
  'GET /api/admin/coupons': 'coupons:read',
  'POST /api/admin/coupons': 'coupons:write',
  'PUT /api/admin/coupons': 'coupons:write',
  'DELETE /api/admin/coupons': 'coupons:delete',
  
  // 분석 및 설정
  'GET /api/admin/analytics': 'analytics:read',
  'GET /api/admin/settings': 'settings:read',
  'PUT /api/admin/settings': 'settings:write'
}

// =============================================
// 권한 검사 함수들
// =============================================

/**
 * 사용자가 특정 권한을 가지고 있는지 확인
 */
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || []
  return rolePermissions.includes(permission)
}

/**
 * 사용자가 여러 권한 중 하나라도 가지고 있는지 확인
 */
export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission))
}

/**
 * 사용자가 모든 권한을 가지고 있는지 확인
 */
export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission))
}

/**
 * API 엔드포인트 접근 권한 확인
 */
export function canAccessEndpoint(userRole: UserRole, method: string, pathname: string): boolean {
  const endpointKey = `${method} ${pathname}`
  const requiredPermission = ENDPOINT_PERMISSIONS[endpointKey]
  
  if (!requiredPermission) {
    // 정의되지 않은 엔드포인트는 기본적으로 접근 허용 (공개 API)
    return true
  }
  
  return hasPermission(userRole, requiredPermission)
}

// =============================================
// 인증 미들웨어 함수들
// =============================================

export interface AuthUser {
  id: string
  email: string
  username?: string
  name?: string
  role: UserRole
  profile: any
}

export interface AuthResult {
  success: boolean
  user?: AuthUser
  error?: string
  statusCode?: number
}

/**
 * 요청에서 인증된 사용자 정보 추출 및 검증
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  try {
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return {
        success: false,
        error: '인증이 필요합니다.',
        statusCode: 401
      }
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role as UserRole,
        profile: user.profile
      }
    }
  } catch (error) {
    console.error('인증 확인 오류:', error)
    return {
      success: false,
      error: '인증 확인 중 오류가 발생했습니다.',
      statusCode: 500
    }
  }
}

/**
 * 권한 기반 접근 제어 확인
 */
export async function authorizeRequest(
  request: NextRequest, 
  requiredPermission?: Permission | Permission[]
): Promise<AuthResult> {
  const authResult = await authenticateRequest(request)
  
  if (!authResult.success || !authResult.user) {
    return authResult
  }

  // 권한 확인이 필요한 경우
  if (requiredPermission) {
    const permissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission]
    
    if (!hasAnyPermission(authResult.user.role, permissions)) {
      return {
        success: false,
        error: '이 작업을 수행할 권한이 없습니다.',
        statusCode: 403
      }
    }
  }

  return authResult
}

/**
 * 리소스 소유권 확인 (사용자가 본인 데이터에만 접근할 수 있도록)
 */
export function canAccessResource(
  user: AuthUser, 
  resourceUserId: string, 
  resourceType: 'reservation' | 'payment' | 'profile'
): boolean {
  // 관리자는 모든 리소스 접근 가능
  if (user.role === 'admin' || user.role === 'super_admin') {
    return true
  }
  
  // 사용자는 본인 리소스만 접근 가능
  if (user.role === 'user') {
    return user.id === resourceUserId
  }
  
  // 모임장은 본인 및 그룹 리소스 접근 가능
  if (user.role === 'group_leader') {
    // TODO: 그룹 멤버십 확인 로직 추가
    return user.id === resourceUserId
  }
  
  return false
}

// =============================================
// API 응답 헬퍼 함수들
// =============================================

/**
 * 표준화된 에러 응답 생성
 */
export function createErrorResponse(error: string, statusCode: number = 400) {
  return Response.json(
    {
      success: false,
      error,
      timestamp: new Date().toISOString()
    },
    { status: statusCode }
  )
}

/**
 * 표준화된 성공 응답 생성
 */
export function createSuccessResponse(data: any, message?: string) {
  return Response.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  })
}

/**
 * 권한 오류 응답 생성
 */
export function createUnauthorizedResponse(message: string = '권한이 없습니다.') {
  return createErrorResponse(message, 403)
}

/**
 * 인증 오류 응답 생성
 */
export function createUnauthenticatedResponse(message: string = '인증이 필요합니다.') {
  return createErrorResponse(message, 401)
}

// =============================================
// 역할별 메뉴 및 기능 정의
// =============================================

export interface MenuItem {
  id: string
  title: string
  path: string
  icon?: string
  requiredPermission?: Permission
  children?: MenuItem[]
}

export const ADMIN_MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    title: '대시보드',
    path: '/admin/dashboard',
    icon: 'dashboard'
  },
  {
    id: 'reservations',
    title: '예약 관리',
    path: '/admin/reservations',
    icon: 'calendar',
    requiredPermission: 'reservations:read'
  },
  {
    id: 'customers',
    title: '고객 관리',
    path: '/admin/customers',
    icon: 'users',
    requiredPermission: 'users:read'
  },
  {
    id: 'rooms',
    title: '객실 관리',
    path: '/admin/rooms',
    icon: 'bed',
    requiredPermission: 'rooms:read'
  },
  {
    id: 'programs',
    title: '프로그램 관리',
    path: '/admin/programs',
    icon: 'activity',
    requiredPermission: 'programs:read'
  },
  {
    id: 'payments',
    title: '결제 관리',
    path: '/admin/payments',
    icon: 'credit-card',
    requiredPermission: 'payments:read'
  },
  {
    id: 'coupons',
    title: '쿠폰 관리',
    path: '/admin/coupons',
    icon: 'percent',
    requiredPermission: 'coupons:read'
  },
  {
    id: 'analytics',
    title: '분석',
    path: '/admin/analytics',
    icon: 'bar-chart',
    requiredPermission: 'analytics:read'
  },
  {
    id: 'users',
    title: '사용자 관리',
    path: '/admin/users',
    icon: 'user-cog',
    requiredPermission: 'users:read'
  },
  {
    id: 'settings',
    title: '설정',
    path: '/admin/settings',
    icon: 'settings',
    requiredPermission: 'settings:read'
  }
]

/**
 * 사용자 역할에 따라 접근 가능한 메뉴 항목 필터링
 */
export function getAccessibleMenuItems(userRole: UserRole): MenuItem[] {
  return ADMIN_MENU_ITEMS.filter(item => {
    if (!item.requiredPermission) {
      return true // 권한이 필요하지 않은 메뉴는 모두 접근 가능
    }
    return hasPermission(userRole, item.requiredPermission)
  })
}

// =============================================
// 내보내기
// =============================================

export { ROLE_PERMISSIONS, ENDPOINT_PERMISSIONS } 