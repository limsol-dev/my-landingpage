import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '예약하기 | 펜션',
  description: '편안한 휴식을 위한 최적의 선택',
}

export default function ReservationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 