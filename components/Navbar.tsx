import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              슬로우 로지
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/programs" className="text-gray-600 hover:text-gray-900">
              프로그램
            </Link>
            <Link href="/reservation" className="text-gray-600 hover:text-gray-900">
              예약하기
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              소개
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900">
              문의
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
} 