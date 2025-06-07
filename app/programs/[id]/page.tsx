import { programs } from '@/data/programs'
import Link from 'next/link'

export default function ProgramPage({ params }: { params: { id: string } }) {
  const program = programs.find(p => p.id === params.id)

  if (!program) {
    return <div>프로그램을 찾을 수 없습니다.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
        ← 돌아가기
      </Link>
      
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-4">{program.title}</h1>
          <p className="text-gray-600 mb-6">{program.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">프로그램 정보</h2>
              <div className="space-y-2">
                <p><span className="font-medium">기간:</span> {program.duration}</p>
                <p><span className="font-medium">최소 인원:</span> {program.minParticipants}명</p>
                <p><span className="font-medium">가격:</span> {program.price.toLocaleString()}원</p>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">프로그램 일정</h2>
              <ul className="list-disc list-inside space-y-2">
                {program.details.schedule.map((item, index) => (
                  <li key={index} className="text-gray-600">{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">포함 사항</h2>
            <ul className="list-disc list-inside space-y-2">
              {program.details.includes.map((item, index) => (
                <li key={index} className="text-gray-600">{item}</li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">유의 사항</h2>
            <ul className="list-disc list-inside space-y-2">
              {program.details.notice.map((item, index) => (
                <li key={index} className="text-gray-600">{item}</li>
              ))}
            </ul>
          </div>

          <div className="mt-12">
            <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
              예약하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 