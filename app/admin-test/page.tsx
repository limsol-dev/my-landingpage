'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminTestPage() {
  const [user, setUser] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    checkUserAndProfile();
  }, []);

  const checkUserAndProfile = async () => {
    try {
      // 1. 현재 로그인된 사용자 확인
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        setError(`사용자 확인 오류: ${userError.message}`);
        return;
      }

      if (!user) {
        setError('로그인이 필요합니다');
        return;
      }

      setUser(user);
      console.log('✅ 현재 사용자:', user.email);

      // 2. 프로필 직접 조회
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id);

      if (profileError) {
        setError(`프로필 조회 오류: ${profileError.message}`);
        return;
      }

      console.log('📋 프로필 데이터:', profiles);

      if (profiles && profiles.length > 0) {
        setProfile(profiles[0]);
        console.log('🎯 사용자 역할:', profiles[0].role);
      } else {
        // 프로필이 없으면 생성
        console.log('🔧 프로필 없음 - 자동 생성 중...');
        await createUserProfile(user);
      }

    } catch (error) {
      console.error('❌ 오류:', error);
      setError(`예상치 못한 오류: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const createUserProfile = async (user: any) => {
    try {
      const newProfile = {
        user_id: user.id,
        email: user.email,
        role: user.email === 'sool9241@naver.com' ? 'super_admin' : 'user',
        username: user.email.split('@')[0],
        full_name: user.user_metadata?.full_name || user.email.split('@')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(newProfile)
        .select()
        .single();

      if (error) {
        setError(`프로필 생성 오류: ${error.message}`);
        return;
      }

      setProfile(data);
      console.log('🎉 프로필 생성 완료:', data);
    } catch (error) {
      setError(`프로필 생성 실패: ${error}`);
    }
  };

  const forceAdminAccess = () => {
    // 강제로 관리자 대시보드로 이동
    window.location.href = '/admin/dashboard';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>사용자 정보 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8">🔧 관리자 테스트 페이지</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <strong>오류:</strong> {error}
            </div>
          )}

          {user && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* 사용자 정보 */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">👤 사용자 정보</h2>
                <div className="space-y-2">
                  <p><strong>이메일:</strong> {user.email}</p>
                  <p><strong>ID:</strong> {user.id}</p>
                  <p><strong>생성일:</strong> {new Date(user.created_at).toLocaleString()}</p>
                  <p><strong>마지막 로그인:</strong> {new Date(user.last_sign_in_at || '').toLocaleString()}</p>
                </div>
              </div>

              {/* 프로필 정보 */}
              <div className="bg-green-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">📋 프로필 정보</h2>
                {profile ? (
                  <div className="space-y-2">
                    <p><strong>역할:</strong> <span className={`font-bold ${profile.role === 'super_admin' ? 'text-red-600' : profile.role === 'admin' ? 'text-orange-600' : 'text-blue-600'}`}>{profile.role}</span></p>
                    <p><strong>사용자명:</strong> {profile.username}</p>
                    <p><strong>전체 이름:</strong> {profile.full_name}</p>
                    <p><strong>전화번호:</strong> {profile.phone || '없음'}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">프로필을 찾을 수 없습니다.</p>
                )}
              </div>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <button
              onClick={checkUserAndProfile}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 다시 확인
            </button>

            <button
              onClick={forceAdminAccess}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              🚀 강제 관리자 접속
            </button>

            <button
              onClick={() => window.location.href = '/admin/login'}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              🔐 관리자 로그인
            </button>
          </div>

          {/* 권한 상태 표시 */}
          {profile && (
            <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">🎯 권한 상태</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className={`p-3 rounded ${profile.role === 'user' ? 'bg-blue-200' : 'bg-gray-200'}`}>
                  <p className="font-semibold">일반 사용자</p>
                  <p className="text-sm">{profile.role === 'user' ? '✅ 현재' : '❌'}</p>
                </div>
                <div className={`p-3 rounded ${profile.role === 'admin' ? 'bg-orange-200' : 'bg-gray-200'}`}>
                  <p className="font-semibold">관리자</p>
                  <p className="text-sm">{profile.role === 'admin' ? '✅ 현재' : '❌'}</p>
                </div>
                <div className={`p-3 rounded ${profile.role === 'super_admin' ? 'bg-red-200' : 'bg-gray-200'}`}>
                  <p className="font-semibold">슈퍼 관리자</p>
                  <p className="text-sm">{profile.role === 'super_admin' ? '✅ 현재' : '❌'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 