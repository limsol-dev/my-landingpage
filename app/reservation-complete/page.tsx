'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ReservationCompletePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <CardTitle className="text-2xl text-center">예약이 완료되었습니다</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-gray-600">
              예약해 주셔서 감사합니다.
            </p>
            <p className="text-gray-600">
              관리자 확인 후 연락드리겠습니다.
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <Link href="/">
              <Button variant="outline">
                홈으로 돌아가기
              </Button>
            </Link>
            <Link href="/programs">
              <Button className="bg-[#2F513F] hover:bg-[#3d6b4f]">
                다른 프로그램 보기
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 