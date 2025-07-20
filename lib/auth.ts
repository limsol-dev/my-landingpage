import { NextRequest } from 'next/server'
import { supabase, supabaseAdmin } from './supabase'
import { UserProfileRow } from '@/types/supabase'

// 기존 중복된 클라이언트 생성 코드 제거
// lib/supabase.ts에서 import하도록 변경

// Extract user from request headers or cookies
export async function getAuthenticatedUser(request: NextRequest) {
  if (!supabaseAdmin) {
    console.warn('Supabase가 설정되지 않아 인증을 건너뜁니다.')
    return null
  }

  try {
    let token: string | null = null
    
    // Try to get token from Authorization header first
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
    
    // If no bearer token, try to get from cookies
    if (!token) {
      token = request.cookies.get('auth_token')?.value || null
    }
    
    if (!token) {
      return null
    }
    
    // If it's a simple base64 token (from our generateToken function), decode it
    if (!token.startsWith('eyJ')) {
      try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
        if (decoded.exp && decoded.exp < Date.now()) {
          return null // Token expired
        }
        
        // Get user profile from database
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .select('*')
          .eq('id', decoded.userId)
          .single()

        if (profileError) {
          console.error('Error fetching user profile:', profileError)
          return null
        }

        return {
          id: decoded.userId,
          email: decoded.email,
          username: profile.username,
          name: profile.full_name,
          role: profile.role,
          profile
        }
      } catch (error) {
        console.error('Error decoding token:', error)
        return null
      }
    }
    
    // If it's a Supabase JWT token, verify with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !user) {
      return null
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return null
    }

    return {
      id: user.id,
      email: user.email,
      username: profile.username,
      name: profile.full_name,
      role: profile.role,
      profile
    }
  } catch (error) {
    console.error('Error getting authenticated user:', error)
    return null
  }
}

// Check if user is admin
export function isAdmin(user: any): boolean {
  if (!user) return false
  return user.role === 'admin' || user.role === 'super_admin'
}

// Check if user is super admin
export function isSuperAdmin(user: any): boolean {
  if (!user) return false
  return user.role === 'super_admin'
}

// Login user with email/username and password
export async function loginUser(identifier: string, password: string) {
  if (!supabaseAdmin) {
    return { 
      user: null, 
      session: null, 
      token: null,
      error: { message: 'Supabase 설정이 필요합니다.' }
    }
  }

  try {
    // Check if identifier is email or username
    const isEmail = identifier.includes('@')
    let email = identifier
    
    // If username, get email from profile
    if (!isEmail) {
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .select('email')
        .eq('username', identifier)
        .single()
      
      if (profileError || !profileData) {
        return { 
          user: null, 
          session: null, 
          error: { message: '등록되지 않은 아이디입니다.' }
        }
      }
      
      email = profileData.email
    }
    
    // Sign in with Supabase
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: email,
      password: password,
    })
    
    if (error) {
      return { user: null, session: null, error }
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return { user: null, session: null, error: { message: '사용자 정보를 가져올 수 없습니다.' } }
    }

    // Generate token for API authentication
    const token = generateToken({
      userId: data.user.id,
      email: data.user.email!,
      role: profile.role,
      username: profile.username
    })

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        username: profile.username,
        name: profile.full_name,
        role: profile.role,
        profile
      },
      session: data.session,
      token: token,
      error: null
    }
  } catch (error: any) {
    console.error('Login error:', error)
    return { 
      user: null, 
      session: null, 
      error: { message: '로그인 중 오류가 발생했습니다.' }
    }
  }
}

// Check if email exists
export async function checkEmailExists(email: string): Promise<boolean> {
  if (!supabaseAdmin) {
    return false
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single()
    
    return !error && !!data
  } catch (error) {
    console.error('Error checking email:', error)
    return false
  }
}

// Check if username exists
export async function checkUsernameExists(username: string): Promise<boolean> {
  if (!supabaseAdmin) {
    return false
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('username', username)
      .single()
    
    return !error && !!data
  } catch (error) {
    console.error('Error checking username:', error)
    return false
  }
}

// Create new user
export async function createUser(userData: {
  email: string
  password: string
  username?: string
  name?: string
}) {
  if (!supabaseAdmin) {
    throw new Error('Supabase 설정이 필요합니다.')
  }

  try {
    // Create user in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        username: userData.username || userData.email.split('@')[0],
        full_name: userData.name || userData.username || userData.email.split('@')[0]
      }
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error('Failed to create user')
    }

    // Create user profile
    const profileData = {
      id: data.user.id,
      username: userData.username || userData.email.split('@')[0] + '_' + Date.now(),
      email: userData.email,
      full_name: userData.name || userData.username || userData.email.split('@')[0],
      role: 'user' as const
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single()

    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(data.user.id)
      throw new Error(profileError.message)
    }

    return {
      id: data.user.id,
      email: data.user.email,
      username: profile.username,
      name: profile.full_name,
      role: profile.role
    }
  } catch (error: any) {
    console.error('Error creating user:', error)
    throw new Error(error.message || 'Failed to create user')
  }
}

// Generate JWT token (simple implementation)
export function generateToken(payload: {
  userId: string
  email: string
  role: string
  username?: string
}) {
  // For now, return a simple token
  // In production, use proper JWT library
  const tokenData = {
    ...payload,
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  }
  
  return Buffer.from(JSON.stringify(tokenData)).toString('base64')
}

export { supabaseAdmin } 