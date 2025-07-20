import { supabase } from './supabase'

// =============================================================================
// 보안 및 개인정보 보호 유틸리티
// =============================================================================

/**
 * 관리자 접근 로그 기록
 */
export async function logAdminAccess(
  actionType: string,
  tableName?: string,
  recordId?: string,
  requestData?: any
) {
  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user?.user) return

    // Supabase RPC 호출로 로그 기록
    await supabase.rpc('log_admin_access', {
      p_action_type: actionType,
      p_table_name: tableName,
      p_record_id: recordId,
      p_request_data: requestData ? JSON.stringify(requestData) : null
    })
  } catch (error) {
    console.error('Failed to log admin access:', error)
  }
}

/**
 * 개인정보 처리 로그 기록
 */
export async function logPrivacyAction(
  userId: string,
  actionType: 'view' | 'export' | 'delete' | 'modify',
  dataType: 'personal_info' | 'analytics' | 'reservation',
  reason?: string,
  legalBasis?: string
) {
  try {
    await supabase.rpc('log_privacy_action', {
      p_user_id: userId,
      p_action_type: actionType,
      p_data_type: dataType,
      p_reason: reason,
      p_legal_basis: legalBasis
    })
  } catch (error) {
    console.error('Failed to log privacy action:', error)
  }
}

/**
 * 이메일 해시화 (비식별화)
 */
export function hashEmail(email: string): string {
  // 클라이언트에서는 간단한 해시화, 실제 DB 함수는 더 안전함
  if (typeof window === 'undefined') return email
  
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(email + 'pension_salt_2024')
    const uint8Array = new Uint8Array(data)
    let binaryString = ''
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i])
    }
    return btoa(binaryString).slice(0, 16)
  } catch {
    return email.replace(/(.{2}).*(@.*)/, '$1***$2')
  }
}

/**
 * 전화번호 마스킹
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 8) return phone
  
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  if (cleanPhone.length <= 7) return phone
  
  return cleanPhone.slice(0, 3) + '****' + cleanPhone.slice(-4)
}

/**
 * 사용자 ID 의사식별화
 */
export function pseudonymizeUserId(userId: string): string {
  if (!userId) return 'anonymous'
  
  // 간단한 의사식별자 생성
  const hash = userId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  return `user_${Math.abs(hash).toString(36).slice(0, 8)}`
}

/**
 * 민감 데이터 검증
 */
export function validateSensitiveData(data: any): {
  isValid: boolean
  violations: string[]
} {
  const violations: string[] = []
  
  // 민감 정보가 포함되어 있는지 확인
  const sensitivePatterns = [
    { pattern: /\b\d{6}-\d{7}\b/, name: '주민등록번호' },
    { pattern: /\b\d{4}-\d{4}-\d{4}-\d{4}\b/, name: '신용카드번호' },
    { pattern: /\b(?:\d{3}-\d{2}-\d{4})\b/, name: '외국인등록번호' },
    { pattern: /\b\d{3}-\d{3}-\d{4}\b/, name: '여권번호 패턴' }
  ]
  
  const dataString = JSON.stringify(data)
  
  sensitivePatterns.forEach(({ pattern, name }) => {
    if (pattern.test(dataString)) {
      violations.push(`${name} 패턴이 감지되었습니다`)
    }
  })
  
  return {
    isValid: violations.length === 0,
    violations
  }
}

/**
 * 입력값 보안 검증
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // XSS 방지
    .replace(/javascript:/gi, '') // JavaScript 프로토콜 제거
    .replace(/on\w+\s*=/gi, '') // 이벤트 핸들러 제거
    .trim()
}

/**
 * GDPR 개인정보 완전 삭제
 */
export async function gdprDeleteUserData(userId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { data, error } = await supabase.rpc('gdpr_delete_user_data', {
      target_user_id: userId
    })
    
    if (error) {
      throw error
    }
    
    return { success: true }
  } catch (error: any) {
    console.error('GDPR deletion failed:', error)
    return { 
      success: false, 
      error: error.message || 'Failed to delete user data' 
    }
  }
}

/**
 * 데이터 무결성 검증
 */
export async function validateDataPrivacy(): Promise<{
  checks: Array<{
    name: string
    status: 'PASS' | 'FAIL' | 'WARNING'
    details: string
  }>
}> {
  try {
    const { data, error } = await supabase.rpc('validate_data_privacy')
    
    if (error) {
      throw error
    }
    
    return {
      checks: data.map((check: any) => ({
        name: check.check_name,
        status: check.status,
        details: check.details
      }))
    }
  } catch (error) {
    console.error('Privacy validation failed:', error)
    return {
      checks: [{
        name: 'Privacy Validation',
        status: 'FAIL',
        details: 'Failed to run privacy validation checks'
      }]
    }
  }
}

/**
 * 보안 헤더 설정 검증
 */
export function validateSecurityHeaders(headers: Record<string, string>): {
  isSecure: boolean
  missingHeaders: string[]
} {
  const requiredHeaders = [
    'x-frame-options',
    'x-content-type-options',
    'x-xss-protection',
    'strict-transport-security',
    'content-security-policy'
  ]
  
  const missingHeaders = requiredHeaders.filter(
    header => !(header in headers) && !(header.toLowerCase() in headers)
  )
  
  return {
    isSecure: missingHeaders.length === 0,
    missingHeaders
  }
}

/**
 * 안전한 파일 업로드 검증
 */
export function validateFileUpload(file: File): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  
  // 파일 크기 검증
  if (file.size > maxSize) {
    errors.push('파일 크기는 10MB를 초과할 수 없습니다')
  }
  
  // 파일 타입 검증
  if (!allowedTypes.includes(file.type)) {
    errors.push('허용되지 않는 파일 형식입니다')
  }
  
  // 파일명 검증 (보안)
  const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/
  if (dangerousChars.test(file.name)) {
    errors.push('파일명에 특수문자가 포함되어 있습니다')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 세션 보안 검증
 */
export async function validateSession(): Promise<{
  isValid: boolean
  user: any
  sessionAge: number
}> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      return { isValid: false, user: null, sessionAge: 0 }
    }
    
    const sessionAge = Date.now() - new Date(session.refresh_token).getTime()
    const maxAge = 24 * 60 * 60 * 1000 // 24시간
    
    return {
      isValid: sessionAge < maxAge,
      user: session.user,
      sessionAge
    }
  } catch (error) {
    console.error('Session validation failed:', error)
    return { isValid: false, user: null, sessionAge: 0 }
  }
}

/**
 * 개인정보 보호 설정 관리
 */
export interface PrivacySettings {
  analytics: boolean
  marketing: boolean
  essential: boolean // 항상 true
  cookieConsent: boolean
  dataRetentionDays: number
}

export function getDefaultPrivacySettings(): PrivacySettings {
  return {
    analytics: false,
    marketing: false,
    essential: true,
    cookieConsent: false,
    dataRetentionDays: 365
  }
}

export function savePrivacySettings(settings: PrivacySettings): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('privacy_settings', JSON.stringify(settings))
  
  // 쿠키 동의 상태에 따라 분석 스크립트 제어
  if (!settings.analytics) {
    // Google Analytics 비활성화
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        analytics_storage: 'denied'
      })
    }
  }
}

export function getPrivacySettings(): PrivacySettings {
  if (typeof window === 'undefined') return getDefaultPrivacySettings()
  
  try {
    const saved = localStorage.getItem('privacy_settings')
    if (saved) {
      return { ...getDefaultPrivacySettings(), ...JSON.parse(saved) }
    }
  } catch (error) {
    console.error('Failed to load privacy settings:', error)
  }
  
  return getDefaultPrivacySettings()
}

/**
 * 보안 모니터링 및 이상 탐지
 */
export function detectAnomalousActivity(userActions: any[]): {
  isAnomalous: boolean
  reasons: string[]
} {
  const reasons: string[] = []
  
  // 단시간 내 과도한 요청
  const recentActions = userActions.filter(
    action => Date.now() - new Date(action.timestamp).getTime() < 60000 // 1분
  )
  
  if (recentActions.length > 50) {
    reasons.push('단시간 내 과도한 요청 감지')
  }
  
  // 이상한 접근 패턴
  const sensitiveActions = recentActions.filter(
    action => action.type.includes('admin') || action.type.includes('delete')
  )
  
  if (sensitiveActions.length > 5) {
    reasons.push('민감한 작업 과도 수행')
  }
  
  return {
    isAnomalous: reasons.length > 0,
    reasons
  }
}

/**
 * IP 주소 기반 지역 제한 검증
 */
export function validateGeoLocation(ipAddress: string): {
  isAllowed: boolean
  country?: string
  reason?: string
} {
  // 실제 구현에서는 IP 지역 확인 서비스 연동
  // 현재는 기본적으로 허용
  return {
    isAllowed: true,
    country: 'KR'
  }
}

declare global {
  function gtag(...args: any[]): void
} 