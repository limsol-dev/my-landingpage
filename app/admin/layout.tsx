"use client"

import { ReactNode } from 'react'
import AdminLayoutContent from './AdminLayoutContent'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminLayoutContent>{children}</AdminLayoutContent>
  )
} 