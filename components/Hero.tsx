import Link from 'next/link'

export default function Hero() {
  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            펜션 창업과 운영의 모든 것
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            20년 노하우를 담은 프리미엄 교육부터 실전 운영 솔루션까지,<br />
            성공적인 펜션 비즈니스의 시작과 성장을 함께합니다.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="#programs"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              프로그램 살펴보기
            </Link>
            <Link href="#features" className="text-sm font-semibold leading-6 text-gray-900">
              자세히 알아보기 <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 