import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// =============================================================================
// 사용자 인증 후 프로필 관리 Edge Function
// =============================================================================

interface WebhookPayload {
  type: string
  table: string
  record?: any
  old_record?: any
  schema: string
  event_ts: string
}

interface DirectCallPayload {
  user_id: string
  email: string
  user_metadata?: any
  app_metadata?: any
}

interface UserMetadata {
  provider?: string
  full_name?: string
  name?: string
  preferred_username?: string
  username?: string
  avatar_url?: string
  picture?: string
  sub?: string
  iss?: string
  email_verified?: boolean
  phone_verified?: boolean
  phone?: string
  birth_date?: string
}

serve(async (req: Request) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response('Missing environment variables', { status: 500 })
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const payload = await req.json()
    console.log('🔔 Auth handler called:', payload)

    let user: any
    let isWebhook = false

    // Webhook 호출 확인
    if (payload.type === 'INSERT' && payload.table === 'users' && payload.record) {
      user = payload.record
      isWebhook = true
      console.log('📥 Webhook call detected')
    } 
    // Direct API 호출 확인
    else if (payload.user_id && payload.email) {
      const directPayload = payload as DirectCallPayload
      user = {
        id: directPayload.user_id,
        email: directPayload.email,
        user_metadata: directPayload.user_metadata || {},
        app_metadata: directPayload.app_metadata || {},
        email_confirmed_at: new Date().toISOString(), // 소셜 로그인은 이미 검증됨
        phone_confirmed_at: null
      }
      isWebhook = false
      console.log('🎯 Direct API call detected')
    } 
    else {
      console.log('⚠️ Invalid payload format')
      return new Response('Invalid payload format', { status: 400 })
    }

    if (!user?.id || !user?.email) {
      console.error('❌ Invalid user data:', user)
      return new Response('Invalid user data', { status: 400 })
    }

    console.log('👤 Processing user:', user.email)

    // 기존 프로필 확인
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('user_profiles')
      .select('id, provider, email, updated_at')
      .eq('id', user.id)
      .single()

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error('❌ Profile check error:', profileCheckError)
      throw profileCheckError
    }

    // 이미 프로필이 있으면 로그인 정보만 업데이트
    if (existingProfile) {
      console.log('📝 Updating existing profile:', existingProfile.email)
      
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          last_login_at: new Date().toISOString(),
          login_count: supabase.raw('login_count + 1'),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('❌ Failed to update login info:', updateError)
        return new Response('Failed to update login info', { status: 500 })
      } else {
        console.log('✅ Login info updated successfully')
      }

      return new Response(JSON.stringify({ 
        success: true, 
        action: 'updated',
        profile: existingProfile 
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 신규 사용자 프로필 생성
    console.log('🆕 Creating new user profile')
    
    const metadata: UserMetadata = user.user_metadata || {}
    const appMetadata = user.app_metadata || {}
    
    // OAuth 제공자 확인
    const provider = appMetadata.provider || metadata.provider || 'email'
    console.log('🔗 OAuth Provider:', provider)

    // 사용자 정보 추출 및 정리 (최소 정보만)
    const userData = extractMinimalUserData(user, metadata, provider)
    
    // 중복 이메일 확인 (다른 제공자로 이미 가입한 경우)
    const { data: emailCheck, error: emailCheckError } = await supabase
      .from('user_profiles')
      .select('id, email, provider')
      .eq('email', userData.email)
      .limit(1)

    if (emailCheckError) {
      console.error('❌ Email check error:', emailCheckError)
      throw emailCheckError
    }

    if (emailCheck && emailCheck.length > 0) {
      console.log('⚠️ Email already exists with different provider:', emailCheck[0])
      
      // 기존 계정에 새 제공자 정보 연결
      const { error: linkError } = await supabase
        .from('user_profiles')
        .update({
          provider: `${emailCheck[0].provider},${provider}`, // 다중 제공자 지원
          last_login_at: new Date().toISOString(),
          login_count: supabase.raw('login_count + 1'),
          updated_at: new Date().toISOString()
        })
        .eq('email', userData.email)

      if (linkError) {
        console.error('❌ Failed to link provider:', linkError)
        throw linkError
      }

      return new Response(JSON.stringify({ 
        success: true, 
        action: 'linked',
        message: 'Provider linked to existing account' 
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 유니크한 username 생성
    userData.username = await generateUniqueUsername(supabase, userData.username)

    // 개인정보 보호 처리
    const sanitizedData = sanitizeUserData(userData)

    // 프로필 생성
    const { data: newProfile, error: createError } = await supabase
      .from('user_profiles')
      .insert({
        ...sanitizedData,
        id: user.id,
        provider: provider,
        is_active: true,
        email_verified: user.email_confirmed_at ? true : false,
        phone_verified: user.phone_confirmed_at ? true : false,
        last_login_at: new Date().toISOString(),
        login_count: 1
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Profile creation failed:', createError)
      throw createError
    }

    console.log('✅ User profile created successfully:', newProfile.email)

    // 개인정보 처리 로그 기록
    await logPrivacyAction(supabase, user.id, 'create', 'personal_info', 'User registration via ' + provider)

    // 환영 알림 생성 (선택적)
    await createWelcomeNotification(supabase, user.id, provider)

    return new Response(JSON.stringify({ 
      success: true, 
      action: 'created',
      profile: newProfile 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('❌ Handler error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error?.message || 'Unknown error occurred'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

// =============================================================================
// 유틸리티 함수들
// =============================================================================

function extractUserData(user: any, metadata: UserMetadata, provider: string) {
  let username = user.email?.split('@')[0] || 'user'
  let fullName = metadata.full_name || metadata.name || '사용자'
  let profileImage = metadata.avatar_url || metadata.picture || null

  // 제공자별 데이터 처리
  switch (provider) {
    case 'google':
      fullName = metadata.full_name || metadata.name || fullName
      username = metadata.preferred_username || username
      profileImage = metadata.picture || profileImage
      break
      
    case 'kakao':
      fullName = metadata.name || metadata.full_name || fullName
      username = metadata.preferred_username || username
      profileImage = metadata.avatar_url || profileImage
      break
      
    case 'github':
      fullName = metadata.full_name || metadata.name || fullName
      username = metadata.preferred_username || metadata.username || username
      profileImage = metadata.avatar_url || profileImage
      break
      
    default:
      // 이메일 가입의 경우
      break
  }

  return {
    email: user.email,
    username: username,
    full_name: fullName,
    profile_image: profileImage,
    phone: metadata.phone || null,
    birth_date: metadata.birth_date || null
  }
}

// T-015: 최소 정보만 추출하는 함수 (추가 입력이 필요하도록)
function extractMinimalUserData(user: any, metadata: UserMetadata, provider: string) {
  // 기본 username 생성 (이메일 기반)
  const baseUsername = user.email?.split('@')[0] || 'user'
  const timestamp = Date.now().toString().slice(-4)
  const username = `${baseUsername}_${timestamp}`

  return {
    email: user.email,
    username: username,
    // full_name은 의도적으로 임시값 설정 (사용자가 직접 입력해야 함)
    full_name: '사용자', // 임시 이름 (isTemporaryName에서 감지됨)
    profile_image: metadata.avatar_url || metadata.picture || null,
    // phone은 null로 설정 (필수 입력 필드)
    phone: null,
    birth_date: null
  }
}

async function generateUniqueUsername(supabase: any, baseUsername: string): Promise<string> {
  let username = baseUsername
  let counter = 1

  while (true) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('username', username)
      .limit(1)

    if (error) {
      console.error('Username check error:', error)
      break
    }

    if (!data || data.length === 0) {
      break // 사용 가능한 username
    }

    username = `${baseUsername}_${counter}`
    counter++

    if (counter > 100) {
      // 무한 루프 방지
      username = `${baseUsername}_${Date.now()}`
      break
    }
  }

  return username
}

function sanitizeUserData(userData: any) {
  // 개인정보 보호를 위한 데이터 정리
  return {
    email: userData.email?.trim().toLowerCase(),
    username: userData.username?.trim().toLowerCase(),
    full_name: userData.full_name?.trim().substring(0, 100), // 길이 제한
    profile_image: userData.profile_image?.substring(0, 500), // URL 길이 제한
    phone: userData.phone?.replace(/[^\d\-\+\(\)\s]/g, ''), // 숫자와 일반적인 기호만 허용
    birth_date: userData.birth_date // Date validation은 DB에서 처리
  }
}

async function logPrivacyAction(
  supabase: any, 
  userId: string, 
  action: string, 
  dataType: string, 
  reason: string
) {
  try {
    await supabase.rpc('log_privacy_action', {
      p_user_id: userId,
      p_action_type: action,
      p_data_type: dataType,
      p_reason: reason,
      p_legal_basis: 'Article 6(1)(b) GDPR - Contract performance'
    })
  } catch (error) {
    console.error('Failed to log privacy action:', error)
  }
}

async function createWelcomeNotification(supabase: any, userId: string, provider: string) {
  try {
    const message = provider === 'email' 
      ? '달팽이 아지트에 오신 것을 환영합니다!' 
      : `${provider} 계정으로 달팽이 아지트에 오신 것을 환영합니다!`

    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'welcome',
        title: '환영합니다!',
        message: message,
        is_read: false
      })
  } catch (error) {
    console.error('Failed to create welcome notification:', error)
  }
} 