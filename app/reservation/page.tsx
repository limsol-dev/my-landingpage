"use client"

import { Suspense } from 'react'
import ReservationForm from '@/components/ReservationForm'

export default function ReservationPage() {
  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<div>Loading...</div>}>
        <ReservationForm />
      </Suspense>
    </div>
  )
} 