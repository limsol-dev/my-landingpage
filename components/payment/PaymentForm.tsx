"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'

interface PaymentFormProps {
  reservationId: string
  amount: number
}

export function PaymentForm({ reservationId, amount }: PaymentFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>('card')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)

      // TODO: 실제 PG사 결제 모듈 연동
      // const paymentResult = await processPayment({
      //   amount,
      //   method: paymentMethod,
      //   ...paymentData
      // })

      // 결제 처리 API 호출
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reservationId,
          paymentData: {
            method: paymentMethod,
            amount
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('결제가 완료되었습니다!')
        router.push('/reservations/' + reservationId)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast.error('결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.')
      console.error('Payment error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">결제 방법 선택</h2>
        <RadioGroup
          value={paymentMethod}
          onValueChange={(value) => setPaymentMethod(value as 'card' | 'transfer')}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card">신용카드</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="transfer" id="transfer" />
            <Label htmlFor="transfer">계좌이체</Label>
          </div>
        </RadioGroup>
      </div>

      {paymentMethod === 'card' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="cardNumber">카드 번호</Label>
            <Input
              id="cardNumber"
              placeholder="0000-0000-0000-0000"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate">유효기간</Label>
              <Input
                id="expiryDate"
                placeholder="MM/YY"
                required
              />
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="password"
                maxLength={3}
                required
              />
            </div>
          </div>
        </div>
      )}

      {paymentMethod === 'transfer' && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">입금 계좌 안내</h3>
          <p>신한은행 123-456-789012</p>
          <p>예금주: (주)펜션이름</p>
          <p className="text-sm text-blue-600 mt-2">
            * 입금자명을 예약자명과 동일하게 해주세요.
          </p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {amount.toLocaleString()}원 결제하기
      </Button>
    </form>
  )
} 