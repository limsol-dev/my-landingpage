'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, loading, isAdmin, isSuperAdmin } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // 메인 로그인 페이지로 리다이렉트
        router.push('/login?redirect=/admin');
      } else if (!isAdmin && !isSuperAdmin) {
        // 관리자 권한이 없으면 메인 페이지로
        alert('관리자 권한이 필요합니다.');
        router.push('/');
      } else {
        // 관리자 권한이 있으면 대시보드로
        router.push('/admin/dashboard');
      }
    }
  }, [isAuthenticated, loading, isAdmin, isSuperAdmin, router]);

  // 로딩 중일 때 표시할 내용
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">권한 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">관리자 페이지로 이동 중...</p>
      </div>
    </div>
  );
} 