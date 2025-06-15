import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')

  if (adminSession?.value === 'true') {
    return NextResponse.json({ authenticated: true })
  }

  return NextResponse.json(
    { authenticated: false, error: '인증되지 않은 사용자입니다.' },
    { status: 401 }
  )
} 