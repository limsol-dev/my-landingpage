'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ForceLogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // 모든 관련 쿠키 삭제
    document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    // 로컬 스토리지도 정리
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
    
    // 로그인 페이지로 리다이렉트
    setTimeout(() => {
      router.push('/admin/login');
    }, 1000);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">로그아웃 처리 중...</p>
      </div>
    </div>
  );
} 