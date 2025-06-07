import { useState } from 'react'
import { useReservationStore } from '@/store/useReservationStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export function ReservationForm() {
  const { selectedDate, roomType, adults, children, options, totalPrice, reset } = useReservationStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDate || !roomType) {
      toast.error('날짜와 객실을 선택해주세요.')
      return
    }

    try {
      setIsSubmitting(true)

      // 예약 가능 여부 확인
      const availabilityCheck = await fetch(
        `/api/reservations?date=${selectedDate}&roomType=${roomType}`
      )
      const { available } = await availabilityCheck.json()

      if (!available) {
        toast.error('선택하신 날짜의 객실이 이미 예약되었습니다.')
        return
      }

      // 예약 생성 요청
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          selectedDate,
          roomType,
          adults,
          children,
          options,
          totalPrice,
          customerInfo
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('예약이 완료되었습니다!')
        reset() // 폼 초기화
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast.error('예약 중 오류가 발생했습니다. 다시 시도해주세요.')
      console.error('Reservation error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">이름</Label>
        <Input
          id="name"
          value={customerInfo.name}
          onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="phone">연락처</Label>
        <Input
          id="phone"
          type="tel"
          value={customerInfo.phone}
          onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          value={customerInfo.email}
          onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
          required
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? '예약 처리중...' : '예약하기'}
      </Button>
    </form>
  )
} 