import { products } from '@/data/products'
import Link from 'next/link'

function ProgramCard({ program }: { program: any }) {
  return (
    <div className="flex flex-col rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-8 bg-white h-full flex flex-col">
        <div className="flex-1">
          <p className="text-sm font-medium text-indigo-600">
            {program.type === 'class' ? '교육 프로그램' :
             program.type === 'membership' ? '멤버십' :
             program.type === 'consulting' ? '컨설팅' :
             program.type === 'license' ? '라이선스' :
             program.type === 'retreat' ? '워케이션' :
             program.type === 'goods' ? '굿즈' :
             program.type === 'digital' ? '디지털 상품' : '마이크로 클래스'}
          </p>
          <div className="block mt-2">
            <h3 className="text-xl font-semibold text-gray-900">{program.title}</h3>
            <p className="mt-3 text-base text-gray-500">{program.description}</p>
          </div>
          <div className="mt-6">
            <div className="text-2xl font-bold text-gray-900">
              {program.discountedPrice ? (
                <>
                  <span className="line-through text-gray-400 text-lg mr-2">
                    {program.price.toLocaleString()}원
                  </span>
                  {program.discountedPrice.toLocaleString()}원
                </>
              ) : (
                `${program.price.toLocaleString()}원`
              )}
            </div>
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900">주요 특징</h4>
              <ul className="mt-2 space-y-2">
                {program.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center text-sm text-gray-500">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <Link
            href={`/programs/${program.id}`}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            자세히 보기
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function Programs() {
  return (
    <div id="programs" className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            성공적인 펜션 운영을 위한 프로그램
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            창업부터 운영까지, 단계별로 필요한 모든 솔루션을 제공합니다.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {products.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      </div>
    </div>
  )
} 