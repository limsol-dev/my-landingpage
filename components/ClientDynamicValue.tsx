'use client'

import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export default function ClientDynamicValue() {
  const [value, setValue] = useState<string>('')
  const { toast } = useToast()

  useEffect(() => {
    const timer = setTimeout(() => {
      const newValue = Math.random().toString()
      setValue(newValue)
      toast({
        title: '값이 업데이트되었습니다.',
        description: '새로운 값이 생성되었습니다.'
      })
    }, 0)
    return () => clearTimeout(timer)
  }, [toast])

  if (!value) return null

  return <span>{value}</span>
} 