"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

// 예시 데이터
const members = [
  {
    id: '1',
    name: '홍길동',
    email: 'hong@example.com',
    phone: '010-1234-5678',
    joinDate: '2024-01-15',
    reservationCount: 3,
    totalSpent: 900000,
    status: 'active'
  },
  // ... 더 많은 회원 데이터
]

export default function MembersPage() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">회원 관리</h1>
        <Button>새 회원 추가</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>회원 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>총 회원수</span>
                <span className="font-bold">245명</span>
              </div>
              <div className="flex justify-between">
                <span>이번 달 신규 회원</span>
                <span className="font-bold text-green-600">+12명</span>
              </div>
              <div className="flex justify-between">
                <span>활성 회원 비율</span>
                <span className="font-bold">85%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>회원 검색</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>이름 또는 연락처</Label>
              <Input
                placeholder="검색어를 입력하세요"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button className="w-full">검색</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>회원 등급 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>VIP</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-primary" />
                  </div>
                  <span className="text-sm">15%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>골드</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="w-1/2 h-full bg-primary" />
                  </div>
                  <span className="text-sm">30%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>일반</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="w-1/4 h-full bg-primary" />
                  </div>
                  <span className="text-sm">55%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>회원 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>회원번호</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead>예약 횟수</TableHead>
                <TableHead>누적 금액</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.id}</TableCell>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.joinDate}</TableCell>
                  <TableCell>{member.reservationCount}회</TableCell>
                  <TableCell>{member.totalSpent.toLocaleString()}원</TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                      {member.status === 'active' ? '활성' : '비활성'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">상세보기</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>회원 상세 정보</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>이름</Label>
                              <p className="mt-1">{member.name}</p>
                            </div>
                            <div>
                              <Label>연락처</Label>
                              <p className="mt-1">{member.phone}</p>
                            </div>
                            <div>
                              <Label>이메일</Label>
                              <p className="mt-1">{member.email}</p>
                            </div>
                            <div>
                              <Label>가입일</Label>
                              <p className="mt-1">{member.joinDate}</p>
                            </div>
                          </div>
                          <div>
                            <Label>예약 내역</Label>
                            <div className="mt-2 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>2024-03-15</span>
                                <span>스탠다드룸</span>
                                <span>300,000원</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>2024-02-20</span>
                                <span>디럭스룸</span>
                                <span>400,000원</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline">회원 비활성화</Button>
                            <Button>정보 수정</Button>
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