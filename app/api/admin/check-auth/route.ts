import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = cookies()
  const adminToken = cookieStore.get('admin_token')

  if (adminToken?.value === 'authenticated') {
    return NextResponse.json({ authenticated: true })
  }

  return NextResponse.json(
    { error: '인증되지 않은 사용자입니다.' },
    { status: 401 }
  )
} 