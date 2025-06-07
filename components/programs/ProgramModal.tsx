import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { PensionProgram } from '@/data/programs'

interface ProgramModalProps {
  program: PensionProgram
  isOpen: boolean
  onClose: () => void
}

export function ProgramModal({ program, isOpen, onClose }: ProgramModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleReservation = () => {
    setIsLoading(true)
    // 예약 페이지로 이동하면서 선택한 프로그램 정보를 전달
    router.push(`/reservation?program=${program.id}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{program.title}</DialogTitle>
        </DialogHeader>
        
        <div className="relative w-full h-[300px] mb-4">
          <Image
            src={program.imageUrl}
            alt={program.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">프로그램 소개</h3>
            <p className="text-gray-600">{program.description}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">기본 정보</h3>
            <dl className="grid grid-cols-2 gap-2">
              <dt className="text-gray-600">기간</dt>
              <dd>{program.duration}</dd>
              
              <dt className="text-gray-600">최대 인원</dt>
              <dd>{program.maxGuests}명</dd>
              
              <dt className="text-gray-600">가격</dt>
              <dd>{program.price.toLocaleString()}원</dd>
            </dl>
          </div>

          <div>
            <h3 className="font-semibold mb-2">객실 시설</h3>
            <div className="flex flex-wrap gap-2">
              {program.amenities.map((amenity) => (
                <Badge key={amenity} variant="secondary">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">포함 사항</h3>
            <div className="flex flex-wrap gap-2">
              {program.includes.map((item) => (
                <Badge key={item} variant="outline">
                  {item}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              닫기
            </Button>
            <Button onClick={handleReservation} disabled={isLoading}>
              {isLoading ? '처리중...' : '예약하기'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 