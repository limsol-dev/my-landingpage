'use client'

import { useEffect, useState } from 'react'

export default function FormattedDateClient() {
  const [date, setDate] = useState<string>(' ')

  useEffect(() => {
    const timer = setTimeout(() => {
      const formatted = new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      setDate(formatted)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <span 
      inject_newsvd="true" 
      suppressHydrationWarning
    >
      {date}
    </span>
  )
} 