import { toast } from 'sonner'

// =============================================
// 에러 타입 정의
// =============================================
export interface ErrorContext {
  component?: string
  action?: string
  user?: string
  timestamp?: Date
  additionalInfo?: Record<string, any>
}

export interface ProcessedError {
  userMessage: string
  technicalMessage: string
  errorCode: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  shouldReport: boolean
  suggestedAction?: string
}

// =============================================
// 에러 코드 및 메시지 매핑
// =============================================
export const ERROR_CODES = {
  // 인증 관련 에러
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  AUTH_TOO_MANY_REQUESTS: 'AUTH_TOO_MANY_REQUESTS',
  AUTH_EMAIL_NOT_CONFIRMED: 'AUTH_EMAIL_NOT_CONFIRMED',
  AUTH_PROVIDER_ERROR: 'AUTH_PROVIDER_ERROR',
  AUTH_NETWORK_ERROR: 'AUTH_NETWORK_ERROR',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',
  
  // 네트워크 관련 에러
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_CONNECTION_FAILED: 'NETWORK_CONNECTION_FAILED',
  NETWORK_SERVER_ERROR: 'NETWORK_SERVER_ERROR',
  
  // 데이터베이스 관련 에러
  DB_CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
  DB_QUERY_ERROR: 'DB_QUERY_ERROR',
  DB_CONSTRAINT_ERROR: 'DB_CONSTRAINT_ERROR',
  
  // 검증 관련 에러
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_DUPLICATE_VALUE: 'VALIDATION_DUPLICATE_VALUE',
  
  // 일반적인 에러
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

// =============================================
// 한국어 에러 메시지 매핑
// =============================================
const ERROR_MESSAGES: Record<ErrorCode, { 
  user: string, 
  technical: string, 
  severity: ProcessedError['severity'],
  suggestedAction?: string 
}> = {
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: {
    user: '아이디 또는 비밀번호가 올바르지 않습니다.',
    technical: 'Invalid login credentials provided',
    severity: 'low',
    suggestedAction: '아이디와 비밀번호를 확인해주세요.'
  },
  [ERROR_CODES.AUTH_USER_NOT_FOUND]: {
    user: '등록되지 않은 계정입니다. 회원가입을 먼저 진행해주세요.',
    technical: 'User not found in database',
    severity: 'low',
    suggestedAction: '회원가입 페이지로 이동하시겠습니까?'
  },
  [ERROR_CODES.AUTH_TOO_MANY_REQUESTS]: {
    user: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
    technical: 'Rate limit exceeded for authentication requests',
    severity: 'medium',
    suggestedAction: '5분 후 다시 시도해주세요.'
  },
  [ERROR_CODES.AUTH_EMAIL_NOT_CONFIRMED]: {
    user: '이메일 인증이 필요합니다. 받은 이메일을 확인해주세요.',
    technical: 'Email verification required',
    severity: 'medium',
    suggestedAction: '이메일 인증 링크를 클릭해주세요.'
  },
  [ERROR_CODES.AUTH_PROVIDER_ERROR]: {
    user: '소셜 로그인에 실패했습니다. 다시 시도해주세요.',
    technical: 'OAuth provider authentication failed',
    severity: 'medium',
    suggestedAction: '다른 로그인 방법을 사용해보세요.'
  },
  [ERROR_CODES.AUTH_NETWORK_ERROR]: {
    user: '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.',
    technical: 'Network error during authentication',
    severity: 'high',
    suggestedAction: '인터넷 연결을 확인하고 다시 시도해주세요.'
  },
  [ERROR_CODES.AUTH_UNAUTHORIZED]: {
    user: '로그인이 필요합니다.',
    technical: 'Authentication required',
    severity: 'medium',
    suggestedAction: '로그인 페이지로 이동하시겠습니까?'
  },
  [ERROR_CODES.AUTH_FORBIDDEN]: {
    user: '이 기능을 사용할 권한이 없습니다.',
    technical: 'Insufficient permissions',
    severity: 'medium',
    suggestedAction: '관리자에게 문의해주세요.'
  },
  [ERROR_CODES.NETWORK_TIMEOUT]: {
    user: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
    technical: 'Request timeout',
    severity: 'medium',
    suggestedAction: '잠시 후 다시 시도해주세요.'
  },
  [ERROR_CODES.NETWORK_CONNECTION_FAILED]: {
    user: '서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.',
    technical: 'Failed to connect to server',
    severity: 'high',
    suggestedAction: '서버 상태를 확인해주세요.'
  },
  [ERROR_CODES.NETWORK_SERVER_ERROR]: {
    user: '서버에 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    technical: 'Internal server error',
    severity: 'high',
    suggestedAction: '문제가 지속되면 고객센터에 문의해주세요.'
  },
  [ERROR_CODES.DB_CONNECTION_ERROR]: {
    user: '데이터베이스 연결에 실패했습니다. 잠시 후 다시 시도해주세요.',
    technical: 'Database connection failed',
    severity: 'critical',
    suggestedAction: '서비스 복구 중입니다. 잠시 후 다시 시도해주세요.'
  },
  [ERROR_CODES.DB_QUERY_ERROR]: {
    user: '데이터 처리 중 오류가 발생했습니다.',
    technical: 'Database query failed',
    severity: 'high',
    suggestedAction: '다시 시도해주세요.'
  },
  [ERROR_CODES.DB_CONSTRAINT_ERROR]: {
    user: '중복된 데이터가 있습니다. 다른 값을 사용해주세요.',
    technical: 'Database constraint violation',
    severity: 'low',
    suggestedAction: '다른 값을 입력해주세요.'
  },
  [ERROR_CODES.VALIDATION_REQUIRED_FIELD]: {
    user: '필수 항목을 입력해주세요.',
    technical: 'Required field validation failed',
    severity: 'low',
    suggestedAction: '모든 필수 항목을 확인해주세요.'
  },
  [ERROR_CODES.VALIDATION_INVALID_FORMAT]: {
    user: '올바른 형식으로 입력해주세요.',
    technical: 'Invalid format validation failed',
    severity: 'low',
    suggestedAction: '입력 형식을 확인해주세요.'
  },
  [ERROR_CODES.VALIDATION_DUPLICATE_VALUE]: {
    user: '이미 사용 중인 값입니다. 다른 값을 입력해주세요.',
    technical: 'Duplicate value validation failed',
    severity: 'low',
    suggestedAction: '다른 값을 선택해주세요.'
  },
  [ERROR_CODES.UNKNOWN_ERROR]: {
    user: '알 수 없는 오류가 발생했습니다.',
    technical: 'Unknown error occurred',
    severity: 'medium',
    suggestedAction: '문제가 지속되면 고객센터에 문의해주세요.'
  },
  [ERROR_CODES.SYSTEM_ERROR]: {
    user: '시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    technical: 'System error occurred',
    severity: 'critical',
    suggestedAction: '시스템 관리자에게 문의해주세요.'
  },
}

// =============================================
// 에러 분류 함수
// =============================================
export function classifyError(error: unknown): ErrorCode {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    
    // 인증 관련 에러
    if (message.includes('invalid login credentials') || 
        message.includes('invalid_credentials')) {
      return ERROR_CODES.AUTH_INVALID_CREDENTIALS
    }
    
    if (message.includes('user not found') || 
        message.includes('등록되지 않은 아이디')) {
      return ERROR_CODES.AUTH_USER_NOT_FOUND
    }
    
    if (message.includes('too many requests') || 
        message.includes('rate limit')) {
      return ERROR_CODES.AUTH_TOO_MANY_REQUESTS
    }
    
    if (message.includes('email not confirmed') || 
        message.includes('email verification')) {
      return ERROR_CODES.AUTH_EMAIL_NOT_CONFIRMED
    }
    
    if (message.includes('oauth') || 
        message.includes('provider')) {
      return ERROR_CODES.AUTH_PROVIDER_ERROR
    }
    
    if (message.includes('network') || 
        message.includes('connection')) {
      return ERROR_CODES.AUTH_NETWORK_ERROR
    }
    
    if (message.includes('unauthorized') || 
        message.includes('401')) {
      return ERROR_CODES.AUTH_UNAUTHORIZED
    }
    
    if (message.includes('forbidden') || 
        message.includes('403')) {
      return ERROR_CODES.AUTH_FORBIDDEN
    }
    
    // 네트워크 관련 에러
    if (message.includes('timeout')) {
      return ERROR_CODES.NETWORK_TIMEOUT
    }
    
    if (message.includes('fetch') || 
        message.includes('network error')) {
      return ERROR_CODES.NETWORK_CONNECTION_FAILED
    }
    
    if (message.includes('500') || 
        message.includes('server error')) {
      return ERROR_CODES.NETWORK_SERVER_ERROR
    }
    
    // 데이터베이스 관련 에러
    if (message.includes('database') || 
        message.includes('connection')) {
      return ERROR_CODES.DB_CONNECTION_ERROR
    }
    
    if (message.includes('query') || 
        message.includes('sql')) {
      return ERROR_CODES.DB_QUERY_ERROR
    }
    
    if (message.includes('constraint') || 
        message.includes('duplicate')) {
      return ERROR_CODES.DB_CONSTRAINT_ERROR
    }
    
    // 검증 관련 에러
    if (message.includes('required') || 
        message.includes('필수')) {
      return ERROR_CODES.VALIDATION_REQUIRED_FIELD
    }
    
    if (message.includes('format') || 
        message.includes('invalid')) {
      return ERROR_CODES.VALIDATION_INVALID_FORMAT
    }
    
    if (message.includes('duplicate') || 
        message.includes('중복')) {
      return ERROR_CODES.VALIDATION_DUPLICATE_VALUE
    }
  }
  
  return ERROR_CODES.UNKNOWN_ERROR
}

// =============================================
// 에러 처리 함수
// =============================================
export function processError(error: unknown, context?: ErrorContext): ProcessedError {
  const errorCode = classifyError(error)
  const errorConfig = ERROR_MESSAGES[errorCode]
  
  const processedError: ProcessedError = {
    userMessage: errorConfig.user,
    technicalMessage: errorConfig.technical,
    errorCode,
    severity: errorConfig.severity,
    shouldReport: errorConfig.severity === 'high' || errorConfig.severity === 'critical',
    suggestedAction: errorConfig.suggestedAction,
  }
  
  // 컨텍스트 정보 로깅
  if (context) {
    console.error('Error context:', {
      ...context,
      timestamp: new Date(),
      originalError: error,
      processedError,
    })
  }
  
  return processedError
}

// =============================================
// 에러 표시 함수
// =============================================
export function showError(
  error: unknown, 
  context?: ErrorContext,
  options: {
    showToast?: boolean
    showSuggestedAction?: boolean
    duration?: number
  } = {}
): ProcessedError {
  const {
    showToast = true,
    showSuggestedAction = true,
    duration = 5000,
  } = options
  
  const processedError = processError(error, context)
  
  if (showToast) {
    let message = processedError.userMessage
    
    if (showSuggestedAction && processedError.suggestedAction) {
      message += `\n\n${processedError.suggestedAction}`
    }
    
    // 심각도에 따라 다른 토스트 타입 사용
    switch (processedError.severity) {
      case 'low':
        toast.error(message, { duration })
        break
      case 'medium':
        toast.error(message, { duration: duration * 1.5 })
        break
      case 'high':
      case 'critical':
        toast.error(message, { 
          duration: duration * 2,
          action: {
            label: '고객센터',
            onClick: () => window.open('/contact', '_blank')
          }
        })
        break
    }
  }
  
  return processedError
}

// =============================================
// 재시도 가능한 에러 처리
// =============================================
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number
    delay?: number
    backoffFactor?: number
    retryIf?: (error: unknown) => boolean
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoffFactor = 2,
    retryIf = (error) => {
      const errorCode = classifyError(error)
      return errorCode === ERROR_CODES.NETWORK_TIMEOUT || 
             errorCode === ERROR_CODES.NETWORK_CONNECTION_FAILED
    }
  } = options
  
  let lastError: unknown
  let currentDelay = delay
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries || !retryIf(error)) {
        throw error
      }
      
      // 재시도 전 대기
      await new Promise(resolve => setTimeout(resolve, currentDelay))
      currentDelay *= backoffFactor
    }
  }
  
  throw lastError
}

// =============================================
// 에러 리포팅 함수
// =============================================
export function reportError(error: ProcessedError, context?: ErrorContext): void {
  if (!error.shouldReport) return
  
  // 개발 환경에서는 콘솔에 로그
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Report:', {
      error,
      context,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    })
  }
  
  // 프로덕션 환경에서는 외부 서비스에 전송
  if (process.env.NODE_ENV === 'production') {
    // TODO: Sentry, LogRocket 등 에러 추적 서비스 연동
    // sentry.captureException(error, { extra: context })
  }
}

// =============================================
// 유틸리티 함수들
// =============================================
export function isRetryableError(error: unknown): boolean {
  const errorCode = classifyError(error)
  const retryableCodes = [
    ERROR_CODES.NETWORK_TIMEOUT,
    ERROR_CODES.NETWORK_CONNECTION_FAILED,
    ERROR_CODES.NETWORK_SERVER_ERROR,
  ] as const
  return retryableCodes.includes(errorCode as typeof retryableCodes[number])
}

export function isAuthError(error: unknown): boolean {
  const errorCode = classifyError(error)
  return errorCode.startsWith('AUTH_')
}

export function isValidationError(error: unknown): boolean {
  const errorCode = classifyError(error)
  return errorCode.startsWith('VALIDATION_')
}

// =============================================
// 에러 바운더리용 함수
// =============================================
export function createErrorBoundaryHandler(context: ErrorContext) {
  return (error: Error, errorInfo: React.ErrorInfo) => {
    const processedError = processError(error, {
      ...context,
      additionalInfo: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
    })
    
    reportError(processedError, context)
  }
} 