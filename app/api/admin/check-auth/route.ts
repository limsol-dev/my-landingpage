import { NextRequest, NextResponse } from 'next/server'
import { 
  authenticateRequest, 
  hasAnyPermission,
  createSuccessResponse,
  createErrorResponse,
  getAccessibleMenuItems,
  Permission
} from '@/lib/rbac'

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    
    if (!authResult.success || !authResult.user) {
      return createErrorResponse(
        authResult.error || '인증되지 않은 사용자입니다',
        authResult.statusCode || 401
      )
    }

    const user = authResult.user

    // 관리자 권한 확인 (admin, super_admin, group_leader)
    const adminPermissions: Permission[] = ['users:read', 'reservations:read']
    if (!hasAnyPermission(user.role, adminPermissions)) {
      return createErrorResponse('관리자 권한이 필요합니다', 403)
    }

    // 사용자 역할에 따른 접근 가능한 메뉴 조회
    const accessibleMenus = getAccessibleMenuItems(user.role)

    return createSuccessResponse({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role
      },
      permissions: {
        menus: accessibleMenus,
        role: user.role
      }
    }, '인증 확인 완료')

  } catch (error: any) {
    console.error('관리자 인증 확인 API 오류:', error)
    return createErrorResponse('인증 확인 중 오류가 발생했습니다', 500)
  }
} 