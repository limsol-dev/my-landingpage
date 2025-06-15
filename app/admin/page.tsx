'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // 인증된 경우 대시보드로 이동
        router.push('/admin/dashboard');
      } else {
        // 인증되지 않은 경우 로그인 페이지로 이동
        router.push('/admin/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // 로딩 중일 때 표시할 내용
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return null;
} 