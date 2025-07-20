"use client"

import { UserProfileRow } from '@/types/supabase'

// =============================================================================
// 프로필 완성도 체크 및 신규 사용자 감지 유틸리티
// =============================================================================

/**
 * 필수 프로필 필드 정의
 */
export const REQUIRED_PROFILE_FIELDS = {
  // 기본 필수 필드 (소셜 로그인시 자동 생성)
  basic: ['email', 'username'] as const,
  
  // 사용자 입력 필수 필드 (T-015 요구사항)
  userInput: ['full_name', 'phone'] as const,
  
  // 선택 필드
  optional: ['birth_date', 'profile_image', 'bio'] as const
}

/**
 * 프로필 완성도 상태 타입
 */
export type ProfileCompletionStatus = {
  isComplete: boolean
  missingFields: string[]
  completionPercentage: number
  isNewUser: boolean
  requiresInput: boolean
}

/**
 * 프로필 완성도 체크
 * @param profile 사용자 프로필 데이터
 * @returns 완성도 상태 객체
 */
export function checkProfileCompletion(profile: UserProfileRow | null): ProfileCompletionStatus {
  if (!profile) {
    return {
      isComplete: false,
      missingFields: [...REQUIRED_PROFILE_FIELDS.basic, ...REQUIRED_PROFILE_FIELDS.userInput],
      completionPercentage: 0,
      isNewUser: true,
      requiresInput: true
    }
  }

  const missingFields: string[] = []
  const allRequiredFields = [...REQUIRED_PROFILE_FIELDS.basic, ...REQUIRED_PROFILE_FIELDS.userInput]
  
  // 필수 필드 체크
  for (const field of allRequiredFields) {
    const value = profile[field as keyof UserProfileRow]
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missingFields.push(field)
    }
  }

  // 특별 검증: 닉네임이 임시 생성 패턴인지 확인
  if (profile.full_name && isTemporaryName(profile.full_name)) {
    if (!missingFields.includes('full_name')) {
      missingFields.push('full_name')
    }
  }

  // 완성도 계산
  const totalFields = allRequiredFields.length
  const completedFields = totalFields - missingFields.length
  const completionPercentage = Math.round((completedFields / totalFields) * 100)

  // 신규 사용자 판정
  const isNewUser = checkIsNewUser(profile)
  
  // 사용자 입력이 필요한지 체크 (기본 필드 외에 미완성 필드가 있는 경우)
  const requiresInput = missingFields.some(field => 
    REQUIRED_PROFILE_FIELDS.userInput.includes(field as any)
  )

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercentage,
    isNewUser,
    requiresInput
  }
}

/**
 * 신규 사용자 여부 판정
 * @param profile 사용자 프로필
 * @returns 신규 사용자 여부
 */
export function checkIsNewUser(profile: UserProfileRow): boolean {
  // 로그인 횟수가 1회 이하인 경우
  if (profile.login_count <= 1) {
    return true
  }

  // 생성일과 마지막 로그인이 같은 날인 경우 (최근 1시간 이내)
  const createdAt = new Date(profile.created_at)
  const lastLoginAt = profile.last_login_at ? new Date(profile.last_login_at) : createdAt
  const timeDiff = Math.abs(lastLoginAt.getTime() - createdAt.getTime())
  const oneHour = 60 * 60 * 1000 // 1시간 in milliseconds
  
  if (timeDiff <= oneHour) {
    return true
  }

  return false
}

/**
 * 임시 생성된 이름인지 확인 (자동 생성 패턴 감지)
 * @param name 확인할 이름
 * @returns 임시 이름 여부
 */
export function isTemporaryName(name: string): boolean {
  if (!name || name.trim() === '') return true
  
  const trimmedName = name.trim()
  
  // 임시 패턴들
  const temporaryPatterns = [
    /^사용자$/,                    // "사용자"
    /^user$/i,                     // "user"
    /^.+@.+\..+$/,                // 이메일 형태
    /^[a-zA-Z0-9]+_\d+$/,         // "username_123" 패턴
    /^[가-힣]+\d+$/,              // "사용자123" 패턴
    /^temp.*/i,                    // "temp"로 시작
    /^guest.*/i,                   // "guest"로 시작
  ]
  
  return temporaryPatterns.some(pattern => pattern.test(trimmedName))
}

/**
 * 프로필 완성에 필요한 필드 리스트 반환
 * @param profile 현재 프로필
 * @returns 입력 필요한 필드 정보
 */
export function getRequiredFieldsInfo(profile: UserProfileRow | null) {
  const completion = checkProfileCompletion(profile)
  
  const fieldLabels: Record<string, string> = {
    full_name: '실명 (닉네임)',
    phone: '휴대폰 번호',
    birth_date: '생년월일',
    email: '이메일',
    username: '사용자명'
  }

  const requiredFields = completion.missingFields
    .filter(field => REQUIRED_PROFILE_FIELDS.userInput.includes(field as any))
    .map(field => ({
      field,
      label: fieldLabels[field] || field,
      required: true
    }))

  const optionalFields = REQUIRED_PROFILE_FIELDS.optional.map(field => ({
    field,
    label: fieldLabels[field] || field,
    required: false
  }))

  return {
    required: requiredFields,
    optional: optionalFields,
    missingRequiredCount: requiredFields.length
  }
}

/**
 * 프로필 완성 상태에 따른 액션 결정
 * @param profile 사용자 프로필
 * @returns 다음 액션 정보
 */
export function determineProfileAction(profile: UserProfileRow | null) {
  const completion = checkProfileCompletion(profile)
  
  if (!profile) {
    return { action: 'login', message: '로그인이 필요합니다.' }
  }
  
  if (completion.requiresInput) {
    return { 
      action: 'complete_profile', 
      message: '서비스 이용을 위해 추가 정보 입력이 필요합니다.' 
    }
  }
  
  if (completion.isComplete) {
    return { action: 'allow_access', message: '프로필이 완성되었습니다.' }
  }
  
  return { 
    action: 'review_profile', 
    message: '프로필을 검토해주세요.' 
  }
}

/**
 * 보호된 라우트 목록 (프로필 완성이 필요한 페이지들)
 */
export const PROTECTED_ROUTES = [
  '/booking',           // 예약 페이지
  '/reservations',      // 예약 내역
  '/profile',           // 프로필 페이지  
  '/admin',             // 관리자 페이지
  '/dashboard',         // 대시보드
  '/my-page',           // 마이페이지
] as const

/**
 * 라우트 접근 권한 체크
 * @param pathname 현재 경로
 * @param profile 사용자 프로필
 * @returns 접근 허용 여부
 */
export function canAccessRoute(pathname: string, profile: UserProfileRow | null): boolean {
  // 프로필 완성 페이지는 항상 접근 가능
  if (pathname === '/profile-completion') {
    return true
  }
  
  // 로그아웃 관련 페이지는 항상 접근 가능
  if (pathname.includes('/logout') || pathname.includes('/login')) {
    return true
  }
  
  // 공개 페이지 (홈, 소개 등)는 접근 가능
  const publicRoutes = ['/', '/about', '/contact', '/auth']
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return true
  }
  
  // 보호된 라우트 체크
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route))
  if (!isProtectedRoute) {
    return true // 보호되지 않은 라우트는 접근 가능
  }
  
  // 프로필 완성도 체크
  const completion = checkProfileCompletion(profile)
  return completion.isComplete && !completion.requiresInput
}

/**
 * 프로필 완성도에 따른 리다이렉트 경로 결정
 * @param profile 사용자 프로필
 * @param intendedPath 원래 가려던 경로
 * @returns 리다이렉트할 경로
 */
export function getRedirectPath(profile: UserProfileRow | null, intendedPath: string = '/'): string {
  const completion = checkProfileCompletion(profile)
  
  if (!profile) {
    return '/login'
  }
  
  if (completion.requiresInput) {
    return `/profile-completion?redirect=${encodeURIComponent(intendedPath)}`
  }
  
  return intendedPath
} 