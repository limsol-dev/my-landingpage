'use client';

import { useReservations } from '../context/ReservationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Users, CreditCard, Clock } from 'lucide-react';

export function DashboardContent() {
  const { reservations } = useReservations();

  // 오늘의 예약 수
  const todayReservations = reservations.filter(reservation => {
    const today = new Date();
    const checkIn = new Date(reservation.checkIn);
    return checkIn.toDateString() === today.toDateString();
  }).length;

  // 이번 주 예약 수
  const thisWeekReservations = reservations.filter(reservation => {
    const today = new Date();
    const checkIn = new Date(reservation.checkIn);
    const diffTime = Math.abs(checkIn.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  // 총 예약 금액
  const totalAmount = reservations.reduce((sum, reservation) => sum + reservation.totalAmount, 0);

  // 평균 체류 기간
  const averageStay = reservations.length > 0
    ? reservations.reduce((sum, reservation) => {
        const checkIn = new Date(reservation.checkIn);
        const checkOut = new Date(reservation.checkOut);
        const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      }, 0) / reservations.length
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘의 예약</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayReservations}건</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 주 예약</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisWeekReservations}건</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 예약 금액</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 체류 기간</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageStay.toFixed(1)}일</div>
          </CardContent>
        </Card>
      </div>

      {/* 최근 예약 목록 */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">최근 예약</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예약자</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">체크인</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">체크아웃</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">금액</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reservations.slice(0, 5).map((reservation) => (
                <tr key={reservation.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{reservation.guestName}</div>
                    <div className="text-sm text-gray-500">{reservation.guestPhone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(reservation.checkIn).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(reservation.checkOut).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₩{reservation.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {reservation.status === 'confirmed' ? '확정' :
                       reservation.status === 'pending' ? '대기' : '취소'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 