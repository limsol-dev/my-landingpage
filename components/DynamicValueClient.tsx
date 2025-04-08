'use client'

import { useEffect, useState } from 'react'

export default function DynamicValueClient() {
  const [value, setValue] = useState<string>(' ')

  useEffect(() => {
    const timer = setTimeout(() => {
      setValue(Math.random().toString())
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <span 
      inject_newsvd="true" 
      suppressHydrationWarning
    >
      {value}
    </span>
  )
} 