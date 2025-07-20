import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const body = await request.json()
    
    // 필수 필드 검증
    if (!body.user_id || !body.email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: user_id or email' },
        { status: 400 }
      )
    }

    console.log('🔄 Calling Edge Function for user:', body.email)

    // Supabase Edge Function 호출
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/handle-auth-user`
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(body)
    })

    const result = await response.json()
    
    if (!response.ok) {
      console.error('Edge Function error:', result)
      return NextResponse.json(
        { success: false, error: result.error || 'Edge Function failed' },
        { status: response.status }
      )
    }

    console.log('✅ Edge Function success:', result.action)
    return NextResponse.json(result)

  } catch (error: any) {
    console.error('❌ API route error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 