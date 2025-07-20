import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock dependencies
const mockSignIn = jest.fn()
const mockSupabaseSignInWithOAuth = jest.fn()

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: jest.fn(),
    },
  },
}))

jest.mock('@/lib/auth', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    loading: false,
    user: null,
    error: null,
  }),
}))

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}))

// Import component after mocks
import LoginForm from '../LoginForm'
import { supabase } from '@/lib/supabase'

describe('LoginForm', () => {
  // Get the mocked function
  const mockSupabaseAuth = supabase.auth.signInWithOAuth as jest.MockedFunction<typeof supabase.auth.signInWithOAuth>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders login form with all elements', () => {
    render(<LoginForm />)
    
    expect(screen.getByText('로그인')).toBeInTheDocument()
    expect(screen.getByText('간편 로그인')).toBeInTheDocument()
    expect(screen.getByText('Google로 로그인')).toBeInTheDocument()
    expect(screen.getByText('카카오로 로그인')).toBeInTheDocument()
  })

  it('handles Google OAuth login click', async () => {
    const user = userEvent.setup()
    mockSupabaseAuth.mockResolvedValueOnce({
      data: { provider: 'google' },
      error: null
    })
    
    render(<LoginForm />)
    
    const googleButton = screen.getByText('Google로 로그인')
    await user.click(googleButton)
    
    await waitFor(() => {
      expect(mockSupabaseAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback?redirect=%2F'
        }
      })
    })
  })

  it('handles Kakao OAuth login click', async () => {
    const user = userEvent.setup()
    mockSupabaseSignInWithOAuth.mockResolvedValueOnce({
      data: { provider: 'kakao' },
      error: null
    })
    
    render(<LoginForm />)
    
    const kakaoButton = screen.getByText('카카오로 로그인')
    await user.click(kakaoButton)
    
    await waitFor(() => {
      expect(mockSupabaseSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'kakao',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback?redirect=%2F'
        }
      })
    })
  })

  it('shows error message when Google OAuth fails', async () => {
    const user = userEvent.setup()
    mockSupabaseSignInWithOAuth.mockResolvedValueOnce({
      data: null,
      error: { message: 'OAuth provider error' }
    })
    
    render(<LoginForm />)
    
    const googleButton = screen.getByText('Google로 로그인')
    await user.click(googleButton)
    
    await waitFor(() => {
      expect(screen.getByText('Google 로그인에 실패했습니다. 다시 시도해주세요.')).toBeInTheDocument()
    })
  })

  it('shows error message when Kakao OAuth fails', async () => {
    const user = userEvent.setup()
    mockSupabaseSignInWithOAuth.mockResolvedValueOnce({
      data: null,
      error: { message: 'OAuth provider error' }
    })
    
    render(<LoginForm />)
    
    const kakaoButton = screen.getByText('카카오로 로그인')
    await user.click(kakaoButton)
    
    await waitFor(() => {
      expect(screen.getByText('카카오 로그인에 실패했습니다. 다시 시도해주세요.')).toBeInTheDocument()
    })
  })

  it('handles network errors gracefully', async () => {
    const user = userEvent.setup()
    mockSupabaseSignInWithOAuth.mockRejectedValueOnce(new Error('Network error'))
    
    render(<LoginForm />)
    
    const googleButton = screen.getByText('Google로 로그인')
    await user.click(googleButton)
    
    await waitFor(() => {
      expect(screen.getByText('Google 로그인 중 오류가 발생했습니다.')).toBeInTheDocument()
    })
  })

  it('shows signup link when showSignupLink is true', () => {
    render(<LoginForm showSignupLink={true} />)
    
    expect(screen.getByText('계정이 없으신가요?')).toBeInTheDocument()
    expect(screen.getByText('회원가입')).toBeInTheDocument()
  })

  it('does not show signup link when showSignupLink is false', () => {
    render(<LoginForm showSignupLink={false} />)
    
    expect(screen.queryByText('계정이 없으신가요?')).not.toBeInTheDocument()
    expect(screen.queryByText('회원가입')).not.toBeInTheDocument()
  })
}) 