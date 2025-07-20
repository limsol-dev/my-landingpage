"use client"
import { supabase } from '@/lib/supabase-simple'
import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'

// 🔐 1. 인증 관련 예제
export function AuthExample() {
  const [user, setUser] = useState<User | null>(null)

  // 회원가입
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) {
      console.error('회원가입 오류:', error.message)
    } else {
      console.log('회원가입 성공:', data.user)
    }
  }

  // 로그인
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('로그인 오류:', error.message)
    } else {
      console.log('로그인 성공:', data.user)
      setUser(data.user)
    }
  }

  // 로그아웃
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
    }
  }

  // 현재 사용자 확인
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  return (
    <div>
      {user ? (
        <div>
          <p>안녕하세요, {user.email}님!</p>
          <button onClick={signOut}>로그아웃</button>
        </div>
      ) : (
        <div>
          <button onClick={() => signIn('test@example.com', 'password123')}>
            로그인
          </button>
          <button onClick={() => signUp('test@example.com', 'password123')}>
            회원가입
          </button>
        </div>
      )}
    </div>
  )
}

// 🗄️ 2. 데이터베이스 조회 예제
export function DatabaseExample() {
  const [users, setUsers] = useState<any[]>([])

  // 데이터 조회
  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(10)

    if (error) {
      console.error('조회 오류:', error.message)
    } else {
      setUsers(data || [])
    }
  }

  // 데이터 추가
  const addUser = async (username: string, email: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([
        { username, email, full_name: username }
      ])
      .select()

    if (error) {
      console.error('추가 오류:', error.message)
    } else {
      console.log('추가 성공:', data)
      fetchUsers() // 목록 새로고침
    }
  }

  // 데이터 수정
  const updateUser = async (id: string, newName: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ full_name: newName })
      .eq('id', id)
      .select()

    if (error) {
      console.error('수정 오류:', error.message)
    } else {
      console.log('수정 성공:', data)
      fetchUsers()
    }
  }

  // 데이터 삭제
  const deleteUser = async (id: string) => {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('삭제 오류:', error.message)
    } else {
      console.log('삭제 성공')
      fetchUsers()
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div>
      <h3>사용자 목록</h3>
      <button onClick={fetchUsers}>새로고침</button>
      
      {users.map((user: any) => (
        <div key={user.id}>
          <span>{user.username} ({user.email})</span>
          <button onClick={() => updateUser(user.id, '새이름')}>
            수정
          </button>
          <button onClick={() => deleteUser(user.id)}>
            삭제
          </button>
        </div>
      ))}
      
      <button onClick={() => addUser('testuser', 'test@example.com')}>
        사용자 추가
      </button>
    </div>
  )
}

// 🔄 3. 실시간 구독 예제
export function RealtimeExample() {
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    // 실시간 구독 설정
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages' 
        }, 
        (payload) => {
          console.log('실시간 변경:', payload)
          
          // 새 메시지 추가
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, payload.new])
          }
          
          // 메시지 삭제
          if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(msg => msg.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    // 클린업
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <div>
      <h3>실시간 메시지</h3>
      {messages.map((message: any) => (
        <div key={message.id}>
          {message.content}
        </div>
      ))}
    </div>
  )
}

// 📁 4. 파일 업로드 예제
export function StorageExample() {
  const [uploading, setUploading] = useState(false)

  const uploadFile = async (file: File) => {
    setUploading(true)
    
    try {
      // 파일명 생성 (타임스탬프 포함)
      const fileName = `${Date.now()}-${file.name}`
      
      // Supabase Storage에 업로드
      const { data, error } = await supabase.storage
        .from('uploads')  // 버킷 이름
        .upload(fileName, file)

      if (error) {
        console.error('업로드 오류:', error.message)
      } else {
        console.log('업로드 성공:', data)
        
        // 공개 URL 가져오기
        const { data: { publicUrl } } = supabase.storage
          .from('uploads')
          .getPublicUrl(fileName)
        
        console.log('파일 URL:', publicUrl)
      }
    } catch (error) {
      console.error('업로드 예외:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) uploadFile(file)
        }}
        disabled={uploading}
      />
      {uploading && <p>업로드 중...</p>}
    </div>
  )
} 