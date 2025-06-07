"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
} from 'lucide-react'

export default function AdminDashboardPage() {
  const stats = [
    {
      name: '오늘 예약',
      value: '12',
      icon: Calendar,
      description: '전일 대비 20% 증가',
    },
    {
      name: '이번 달 매출',
      value: '₩3,250,000',
      icon: DollarSign,
      description: '전월 대비 15% 증가',
    },
    {
      name: '총 회원수',
      value: '245',
      icon: Users,
      description: '신규 회원 5명 증가',
    },
    {
      name: '객실 점유율',
      value: '85%',
      icon: TrendingUp,
      description: '전주 대비 5% 증가',
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">대시보드</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>최근 예약</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="font-medium">홍길동</p>
                    <p className="text-sm text-muted-foreground">
                      스탠다드 룸 / 2박
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₩300,000</p>
                    <p className="text-sm text-muted-foreground">
                      2024.03.15 - 03.17
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>객실 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>스탠다드</span>
                <span className="font-medium text-green-600">3/5 예약</span>
              </div>
              <div className="flex items-center justify-between">
                <span>디럭스</span>
                <span className="font-medium text-green-600">2/3 예약</span>
              </div>
              <div className="flex items-center justify-between">
                <span>스위트</span>
                <span className="font-medium text-red-600">만실</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>공지사항</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b pb-2 last:border-0">
                  <p className="font-medium">시스템 점검 안내</p>
                  <p className="text-sm text-muted-foreground">
                    2024.03.20 02:00 - 04:00
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 