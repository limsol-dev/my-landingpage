'use client';

import { useState } from 'react';
import { useReservations } from '../context/ReservationContext';
import { toast } from 'sonner';

export function ReservationsContent() {
  const { reservations, updateReservation, deleteReservation } = useReservations();
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (id: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    setIsLoading(true);
    try {
      updateReservation(id, { status });
      toast.success('예약 상태가 변경되었습니다.');
    } catch (error) {
      console.error('Error updating reservation:', error);
      toast.error('예약 상태 변경에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('정말로 이 예약을 삭제하시겠습니까?')) {
      return;
    }

    setIsLoading(true);
    try {
      deleteReservation(id);
      toast.success('예약이 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast.error('예약 삭제에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">예약 관리</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예약자</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">체크인</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">체크아웃</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">금액</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservations.map((reservation) => (
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
                  <select
                    value={reservation.status}
                    onChange={(e) => handleStatusChange(reservation.id, e.target.value as 'pending' | 'confirmed' | 'cancelled')}
                    disabled={isLoading}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2F513F] focus:ring-[#2F513F] sm:text-sm"
                  >
                    <option value="pending">대기</option>
                    <option value="confirmed">확정</option>
                    <option value="cancelled">취소</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(reservation.id)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-900"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 