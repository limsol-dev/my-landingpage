'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // 기본 경로로 접속하면 대시보드로 리다이렉트
    router.push('/admin/dashboard');
  }, [router]);

  return null;
} 