'use client'

import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export default function ClientFormattedDate() {
  const [date, setDate] = useState<string>('')
  const { toast } = useToast()

  useEffect(() => {
    const timer = setTimeout(() => {
      const formatted = new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      setDate(formatted)
      toast({
        title: '날짜가 업데이트되었습니다.',
        description: '현재 시각이 표시됩니다.'
      })
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  if (!date) return null

  return <span inject_newsvd="true">{date}</span>
} 