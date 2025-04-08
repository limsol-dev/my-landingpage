import { Suspense } from 'react'
import FormattedDateClient from './FormattedDateClient'

export default function FormattedDate() {
  return (
    <div className="min-h-[24px]">
      <Suspense fallback={<span>&nbsp;</span>}>
        <FormattedDateClient />
      </Suspense>
    </div>
  )
} 