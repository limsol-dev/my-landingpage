import { notFound } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { PaymentForm } from '@/components/payment/PaymentForm'

const prisma = new PrismaClient()

interface PaymentPageProps {
  params: {
    id: string
  }
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: params.id }
  })

  if (!reservation) {
    notFound()
  }

  if (reservation.paymentStatus === 'completed') {
    return (
      <div className="container max-w-2xl mx-auto py-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-green-800 mb-4">
            이미 결제가 완료된 예약입니다
          </h1>
          <p className="text-green-700">
            예약 확인 이메일을 확인해주세요.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">결제하기</h1>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">예약 정보</h2>
        <dl className="grid grid-cols-2 gap-4">
          <dt className="text-gray-600">예약 번호</dt>
          <dd>{reservation.id}</dd>
          
          <dt className="text-gray-600">예약자</dt>
          <dd>{reservation.customerName}</dd>
          
          <dt className="text-gray-600">날짜</dt>
          <dd>{reservation.selectedDate.toLocaleDateString()}</dd>
          
          <dt className="text-gray-600">객실</dt>
          <dd>{reservation.roomType}</dd>
          
          <dt className="text-gray-600">인원</dt>
          <dd>성인 {reservation.adults}명, 아동 {reservation.children}명</dd>
          
          <dt className="text-gray-600">총 금액</dt>
          <dd className="font-semibold">{reservation.totalPrice.toLocaleString()}원</dd>
        </dl>
      </div>

      <PaymentForm 
        reservationId={reservation.id}
        amount={reservation.totalPrice}
      />
    </div>
  )
} 