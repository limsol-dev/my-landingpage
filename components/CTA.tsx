import Link from 'next/link'

export default function CTA() {
  return (
    <div className="bg-indigo-50">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:justify-between lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          성공적인 펜션 운영의 시작
          <br />
          지금 바로 시작하세요.
        </h2>
        <div className="mt-10 flex items-center gap-x-6 lg:mt-0 lg:flex-shrink-0">
          <Link
            href="#programs"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            프로그램 신청하기
          </Link>
          <Link
            href="#contact"
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            상담 문의하기 <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
} 