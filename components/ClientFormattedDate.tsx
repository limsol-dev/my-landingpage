'use client'

import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export default function ClientFormattedDate() {
  const [date, setDate] = useState<string>('')
  const { toast } = useToast()

  const formatDate = () => {
    return new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const formattedDate = formatDate()
      setDate(formattedDate)
      toast({
        title: '날짜가 업데이트되었습니다.',
        description: formattedDate
      })
    }, 0)
    return () => clearTimeout(timer)
  }, [toast])

  if (!date) return null

  return <span>{date}</span>
} 