import { supabase } from './supabase'
import { logPrivacyAction, logAdminAccess } from './security'

// =============================================================================
// 사용자 관리 유틸리티
// =============================================================================

export interface UserProfile {
  id: string
  username: string
  email: string
  full_name: string | null
  phone: string | null
  birth_date: string | null
  profile_image: string | null
  bio: string | null
  role: 'user' | 'group_leader' | 'admin' | 'super_admin'
  provider: string
  is_active: boolean
  email_verified: boolean
  phone_verified: boolean
  created_at: string
  updated_at: string
  last_login_at: string | null
  login_count: number
}

export interface CreateUserProfileInput {
  id: string
  email: string
  username?: string
  full_name?: string
  phone?: string
  birth_date?: string
  profile_image?: string
  provider?: string
  user_metadata?: Record<string, any>
}

export interface UpdateUserProfileInput {
  username?: string
  full_name?: string
  phone?: string
  birth_date?: string
  profile_image?: string
  bio?: string
  role?: string
  is_active?: boolean
}

// =============================================================================
// 프로필 관리 함수들
// =============================================================================

/**
 * 사용자 프로필 생성 (소셜 로그인 포함)
 */
export async function createUserProfile(input: CreateUserProfileInput): Promise<{
  success: boolean
  profile?: UserProfile
  error?: string
}> {
  try {
    console.log('📝 Creating user profile:', input.email)

    // 기존 프로필 확인
    const existingProfile = await getUserProfile(input.id)
    if (existingProfile.success && existingProfile.profile) {
      console.log('📋 Profile already exists, updating login info')
      
      const updateResult = await updateLoginInfo(input.id)
      return {
        success: true,
        profile: existingProfile.profile
      }
    }

    // 중복 이메일 확인
    const { data: emailCheck, error: emailError } = await supabase
      .from('user_profiles')
      .select('id, email, provider')
      .eq('email', input.email.toLowerCase())
      .limit(1)

    if (emailError) {
      console.error('❌ Email check failed:', emailError)
      return { success: false, error: '이메일 확인 중 오류가 발생했습니다.' }
    }

    if (emailCheck && emailCheck.length > 0) {
      console.log('⚠️ Email already exists:', emailCheck[0])
      return { 
        success: false, 
        error: '이미 등록된 이메일 주소입니다.' 
      }
    }

    // 유니크한 username 생성
    const username = await generateUniqueUsername(
      input.username || input.email.split('@')[0]
    )

    // 제공자별 정보 추출
    const userData = extractUserDataFromMetadata(input)

    // 프로필 데이터 구성
    const profileData = {
      id: input.id,
      username: username,
      email: input.email.toLowerCase(),
      full_name: userData.full_name,
      phone: userData.phone,
      birth_date: userData.birth_date,
      profile_image: userData.profile_image,
      provider: input.provider || 'email',
      role: 'user' as const,
      is_active: true,
      email_verified: true,
      phone_verified: false,
      last_login_at: new Date().toISOString(),
      login_count: 1
    }

    // 프로필 생성
    const { data: newProfile, error: createError } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single()

    if (createError) {
      console.error('❌ Profile creation failed:', createError)
      return { 
        success: false, 
        error: '프로필 생성에 실패했습니다.' 
      }
    }

    console.log('✅ Profile created successfully:', newProfile.email)

    // 개인정보 처리 로그
    await logPrivacyAction(
      input.id,
      'create',
      'personal_info',
      `User registration via ${input.provider || 'email'}`,
      'Article 6(1)(b) GDPR - Contract performance'
    )

    return {
      success: true,
      profile: newProfile as UserProfile
    }

  } catch (error: any) {
    console.error('❌ Profile creation error:', error)
    return { 
      success: false, 
      error: error.message || '프로필 생성 중 오류가 발생했습니다.' 
    }
  }
}

/**
 * 사용자 프로필 조회
 */
export async function getUserProfile(userId: string): Promise<{
  success: boolean
  profile?: UserProfile
  error?: string
}> {
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: '프로필을 찾을 수 없습니다.' }
      }
      console.error('❌ Profile fetch failed:', error)
      return { success: false, error: '프로필 조회에 실패했습니다.' }
    }

    return {
      success: true,
      profile: profile as UserProfile
    }

  } catch (error: any) {
    console.error('❌ Profile fetch error:', error)
    return { 
      success: false, 
      error: error.message || '프로필 조회 중 오류가 발생했습니다.' 
    }
  }
}

/**
 * 사용자 프로필 업데이트
 */
export async function updateUserProfile(
  userId: string, 
  updates: UpdateUserProfileInput
): Promise<{
  success: boolean
  profile?: UserProfile
  error?: string
}> {
  try {
    console.log('📝 Updating user profile:', userId)

    // 권한 확인
    const { data: currentUser } = await supabase.auth.getUser()
    if (!currentUser?.user) {
      return { success: false, error: '인증이 필요합니다.' }
    }

    // 본인 또는 관리자만 수정 가능
    const isOwnProfile = currentUser.user.id === userId
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', currentUser.user.id)
      .single()

    const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin'

    if (!isOwnProfile && !isAdmin) {
      return { success: false, error: '수정 권한이 없습니다.' }
    }

    // username 중복 확인 (변경하는 경우)
    if (updates.username) {
      const { data: usernameCheck } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('username', updates.username)
        .neq('id', userId)
        .limit(1)

      if (usernameCheck && usernameCheck.length > 0) {
        return { success: false, error: '이미 사용 중인 사용자명입니다.' }
      }
    }

    // 데이터 정리
    const sanitizedUpdates = sanitizeProfileData(updates)

    // 프로필 업데이트
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        ...sanitizedUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Profile update failed:', updateError)
      return { success: false, error: '프로필 업데이트에 실패했습니다.' }
    }

    console.log('✅ Profile updated successfully')

    // 개인정보 처리 로그
    await logPrivacyAction(
      userId,
      'modify',
      'personal_info',
      'Profile update',
      'Article 6(1)(b) GDPR - Contract performance'
    )

    // 관리자가 다른 사용자 수정 시 관리자 로그
    if (!isOwnProfile && isAdmin) {
      await logAdminAccess(
        'user_profile_update',
        'user_profiles',
        userId,
        updates
      )
    }

    return {
      success: true,
      profile: updatedProfile as UserProfile
    }

  } catch (error: any) {
    console.error('❌ Profile update error:', error)
    return { 
      success: false, 
      error: error.message || '프로필 업데이트 중 오류가 발생했습니다.' 
    }
  }
}

/**
 * 로그인 정보 업데이트
 */
export async function updateLoginInfo(userId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        last_login_at: new Date().toISOString(),
        login_count: supabase.raw('login_count + 1'),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('❌ Login info update failed:', error)
      return { success: false, error: '로그인 정보 업데이트에 실패했습니다.' }
    }

    return { success: true }

  } catch (error: any) {
    console.error('❌ Login info update error:', error)
    return { 
      success: false, 
      error: error.message || '로그인 정보 업데이트 중 오류가 발생했습니다.' 
    }
  }
}

/**
 * 이메일로 사용자 검색
 */
export async function findUserByEmail(email: string): Promise<{
  success: boolean
  user?: UserProfile
  error?: string
}> {
  try {
    const { data: user, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: '사용자를 찾을 수 없습니다.' }
      }
      return { success: false, error: '사용자 검색에 실패했습니다.' }
    }

    return {
      success: true,
      user: user as UserProfile
    }

  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || '사용자 검색 중 오류가 발생했습니다.' 
    }
  }
}

// =============================================================================
// 유틸리티 함수들
// =============================================================================

async function generateUniqueUsername(baseUsername: string): Promise<string> {
  const cleanBase = baseUsername.toLowerCase().replace(/[^a-z0-9_]/g, '')
  let username = cleanBase
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

    username = `${cleanBase}_${counter}`
    counter++

    if (counter > 100) {
      username = `${cleanBase}_${Date.now()}`
      break
    }
  }

  return username
}

function extractUserDataFromMetadata(input: CreateUserProfileInput) {
  const metadata = input.user_metadata || {}
  const provider = input.provider || 'email'

  let fullName = input.full_name || metadata.full_name || metadata.name
  let profileImage = metadata.avatar_url || metadata.picture
  let phone = input.phone || metadata.phone
  let birthDate = input.birth_date || metadata.birth_date

  // 제공자별 특별 처리
  switch (provider) {
    case 'google':
      fullName = metadata.full_name || metadata.name || fullName
      profileImage = metadata.picture || profileImage
      break
      
    case 'kakao':
      fullName = metadata.name || metadata.full_name || fullName
      profileImage = metadata.avatar_url || profileImage
      break
      
    case 'github':
      fullName = metadata.full_name || metadata.name || fullName
      profileImage = metadata.avatar_url || profileImage
      break
  }

  return {
    full_name: fullName || input.email.split('@')[0],
    profile_image: profileImage,
    phone: phone,
    birth_date: birthDate
  }
}

function sanitizeProfileData(data: UpdateUserProfileInput) {
  const sanitized: any = {}

  if (data.username) {
    sanitized.username = data.username.trim().toLowerCase()
  }
  
  if (data.full_name) {
    sanitized.full_name = data.full_name.trim().substring(0, 100)
  }
  
  if (data.phone) {
    sanitized.phone = data.phone.replace(/[^\d\-\+\(\)\s]/g, '')
  }
  
  if (data.birth_date) {
    sanitized.birth_date = data.birth_date
  }
  
  if (data.profile_image) {
    sanitized.profile_image = data.profile_image.substring(0, 500)
  }
  
  if (data.bio) {
    sanitized.bio = data.bio.trim().substring(0, 500)
  }
  
  if (data.role) {
    sanitized.role = data.role
  }
  
  if (data.is_active !== undefined) {
    sanitized.is_active = data.is_active
  }

  return sanitized
}

/**
 * 대량 사용자 조회 (관리자용)
 */
export async function getUsers(options: {
  page?: number
  limit?: number
  search?: string
  role?: string
  isActive?: boolean
} = {}): Promise<{
  success: boolean
  users?: UserProfile[]
  total?: number
  error?: string
}> {
  try {
    const { page = 1, limit = 20, search, role, isActive } = options

    let query = supabase
      .from('user_profiles')
      .select('*', { count: 'exact' })

    // 필터 적용
    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%,username.ilike.%${search}%`)
    }
    
    if (role) {
      query = query.eq('role', role)
    }
    
    if (isActive !== undefined) {
      query = query.eq('is_active', isActive)
    }

    // 페이지네이션
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    // 정렬
    query = query.order('created_at', { ascending: false })

    const { data: users, error, count } = await query

    if (error) {
      console.error('❌ Users fetch failed:', error)
      return { success: false, error: '사용자 목록 조회에 실패했습니다.' }
    }

    return {
      success: true,
      users: users as UserProfile[],
      total: count || 0
    }

  } catch (error: any) {
    console.error('❌ Users fetch error:', error)
    return { 
      success: false, 
      error: error.message || '사용자 목록 조회 중 오류가 발생했습니다.' 
    }
  }
} 