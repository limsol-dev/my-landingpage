import { Suspense } from 'react'
import DynamicValueClient from './DynamicValueClient'

export default function DynamicValue() {
  return (
    <div className="min-h-[24px]">
      <Suspense fallback={<span inject_newsvd="true">&nbsp;</span>}>
        <DynamicValueClient />
      </Suspense>
    </div>
  )
} 