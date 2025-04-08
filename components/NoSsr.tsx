'use client'

import { useEffect, useState, ReactNode } from 'react'

interface NoSsrProps {
  children: ReactNode
  fallback?: ReactNode
}

export default function NoSsr({ children, fallback = null }: NoSsrProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMounted(true)
    }, 0)
    return () => clearTimeout(timeout)
  }, [])

  if (!mounted) {
    return fallback
  }

  return <>{children}</>
} 