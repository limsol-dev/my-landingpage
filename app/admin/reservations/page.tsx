"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

// 예시 데이터
const reservations = [
  {
    id: '1',
    customerName: '홍길동',
    roomType: '스탠다드',
    checkIn: '2024-04-15',
    checkOut: '2024-04-17',
    status: 'confirmed',
    totalPrice: 300000,
    adults: 2,
    children: 1,
    options: {
      breakfast: true,
      bbq: { type: 'standard', quantity: 1 },
      bus: false
    }
  },
  // ... 더 많은 예약 데이터
]

export default function ReservationsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">예약 관리</h1>
        <Button>새 예약 추가</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>날짜별 조회</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ko}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>검색 필터</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>예약자명 검색</Label>
              <Input
                placeholder="예약자명을 입력하세요"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>예약 상태</Label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="pending">대기중</SelectItem>
                  <SelectItem value="confirmed">확정</SelectItem>
                  <SelectItem value="cancelled">취소</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>예약 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>오늘 예약</span>
                <span className="font-bold">3건</span>
              </div>
              <div className="flex justify-between">
                <span>이번 달 예약</span>
                <span className="font-bold">45건</span>
              </div>
              <div className="flex justify-between">
                <span>취소율</span>
                <span className="font-bold text-red-500">5%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>예약 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>예약번호</TableHead>
                <TableHead>예약자</TableHead>
                <TableHead>객실타입</TableHead>
                <TableHead>체크인</TableHead>
                <TableHead>체크아웃</TableHead>
                <TableHead>인원</TableHead>
                <TableHead>금액</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>{reservation.id}</TableCell>
                  <TableCell>{reservation.customerName}</TableCell>
                  <TableCell>{reservation.roomType}</TableCell>
                  <TableCell>{reservation.checkIn}</TableCell>
                  <TableCell>{reservation.checkOut}</TableCell>
                  <TableCell>
                    성인 {reservation.adults}명
                    {reservation.children > 0 && `, 아동 ${reservation.children}명`}
                  </TableCell>
                  <TableCell>{reservation.totalPrice.toLocaleString()}원</TableCell>
                  <TableCell>
                    <span className={
                      reservation.status === 'confirmed' ? 'text-green-600' :
                      reservation.status === 'cancelled' ? 'text-red-600' :
                      'text-yellow-600'
                    }>
                      {
                        reservation.status === 'confirmed' ? '확정' :
                        reservation.status === 'cancelled' ? '취소' :
                        '대기중'
                      }
                    </span>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">상세보기</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>예약 상세 정보</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>예약자</Label>
                              <p className="mt-1">{reservation.customerName}</p>
                            </div>
                            <div>
                              <Label>객실타입</Label>
                              <p className="mt-1">{reservation.roomType}</p>
                            </div>
                            <div>
                              <Label>체크인</Label>
                              <p className="mt-1">{reservation.checkIn}</p>
                            </div>
                            <div>
                              <Label>체크아웃</Label>
                              <p className="mt-1">{reservation.checkOut}</p>
                            </div>
                          </div>
                          <div>
                            <Label>추가 옵션</Label>
                            <ul className="mt-1 space-y-1">
                              {reservation.options.breakfast && (
                                <li>• 조식</li>
                              )}
                              {reservation.options.bbq.type && (
                                <li>• BBQ ({reservation.options.bbq.type})</li>
                              )}
                              {reservation.options.bus && (
                                <li>• 셔틀버스</li>
                              )}
                            </ul>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline">예약 취소</Button>
                            <Button>예약 확정</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 