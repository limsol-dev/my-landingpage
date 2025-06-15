"use client"

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { Upload, Download, Users, FileSpreadsheet } from 'lucide-react'

// 회원 타입 정의
interface Member {
  id: string
  name: string
  email: string
  phone: string
  joinDate: string
  reservationCount: number
  totalSpent: number
  status: 'active' | 'inactive'
  reservationHistory: Array<{
    date: string
    programType: string
    amount: number
  }>
}

// 예시 데이터 - 랜딩페이지 프로그램 기반으로 수정
const initialMembers: Member[] = [
  {
    id: '1',
    name: '홍길동',
    email: 'hong@example.com',
    phone: '010-1234-5678',
    joinDate: '2024-01-15',
    reservationCount: 3,
    totalSpent: 1170000,
    status: 'active',
    reservationHistory: [
      { date: '2024-03-15', programType: '힐링 캠프', amount: 190000 },
      { date: '2024-02-20', programType: '디지털 디톡스 캠프', amount: 450000 },
      { date: '2024-01-25', programType: '웰니스 디톡스', amount: 890000 }
    ]
  },
  {
    id: '2',
    name: '김영희',
    email: 'kim@example.com',
    phone: '010-9876-5432',
    joinDate: '2024-02-10',
    reservationCount: 2,
    totalSpent: 940000,
    status: 'active',
    reservationHistory: [
      { date: '2024-03-10', programType: '교원 힐링 연수', amount: 580000 },
      { date: '2024-02-15', programType: '가족 힐링 캠프', amount: 360000 }
    ]
  },
  {
    id: '3',
    name: '박철수',
    email: 'park@example.com',
    phone: '010-5555-1234',
    joinDate: '2024-03-01',
    reservationCount: 1,
    totalSpent: 700000,
    status: 'active',
    reservationHistory: [
      { date: '2024-03-05', programType: '펜션기본15인', amount: 700000 }
    ]
  },
  {
    id: '4',
    name: '이민수',
    email: 'lee@example.com',
    phone: '010-7777-8888',
    joinDate: '2024-02-25',
    reservationCount: 4,
    totalSpent: 670000,
    status: 'active',
    reservationHistory: [
      { date: '2024-03-20', programType: '명상 프로그램', amount: 80000 },
      { date: '2024-03-12', programType: '싱잉볼 테라피', amount: 120000 },
      { date: '2024-03-05', programType: '자연 요가 클래스', amount: 70000 },
      { date: '2024-02-28', programType: '주/야간 패키지', amount: 400000 }
    ]
  }
]

export default function MembersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [newMember, setNewMember] = useState({
    name: '',
    phone: '',
    email: '',
    reservationHistory: ''
  })

  // 대량 등록 관련 상태
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
  const [bulkMembers, setBulkMembers] = useState<Member[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 새 회원 추가 함수
  const handleAddMember = () => {
    if (!newMember.name || !newMember.phone) {
      toast.error('이름과 연락처는 필수 입력 항목입니다.')
      return
    }

    // 예약 내역 파싱 (간단한 형태로)
    const reservationHistory: Array<{date: string, programType: string, amount: number}> = []
    if (newMember.reservationHistory.trim()) {
      const lines = newMember.reservationHistory.split('\n')
      lines.forEach(line => {
        const parts = line.trim().split(',')
        if (parts.length >= 3) {
          reservationHistory.push({
            date: parts[0].trim(),
            programType: parts[1].trim(),
            amount: parseInt(parts[2].trim().replace(/[^0-9]/g, '')) || 0
          })
        }
      })
    }

    const totalSpent = reservationHistory.reduce((sum, res) => sum + res.amount, 0)
    
    const member: Member = {
      id: (members.length + 1).toString(),
      name: newMember.name,
      email: newMember.email || '',
      phone: newMember.phone,
      joinDate: new Date().toISOString().split('T')[0], // 오늘 날짜로 자동 설정
      reservationCount: reservationHistory.length,
      totalSpent: totalSpent,
      status: 'active',
      reservationHistory: reservationHistory
    }

    setMembers([...members, member])
    setNewMember({ name: '', phone: '', email: '', reservationHistory: '' })
    setIsAddDialogOpen(false)
    toast.success('새 회원이 추가되었습니다.')
  }

  // 엑셀 파일 업로드 처리
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

        // 첫 번째 행은 헤더로 가정하고 제외
        const rows = jsonData.slice(1)
        const processedMembers: Member[] = []

        rows.forEach((row, index) => {
          if (row.length >= 2 && row[0] && row[1]) { // 이름과 연락처는 필수
            const name = String(row[0]).trim()
            const phone = String(row[1]).trim()
            const email = row[2] ? String(row[2]).trim() : ''
            const joinDate = row[3] ? String(row[3]).trim() : new Date().toISOString().split('T')[0]
            
            // 예약 내역 파싱 (4번째 컬럼부터)
            const reservationHistory: Array<{date: string, programType: string, amount: number}> = []
            if (row[4]) {
              const historyText = String(row[4]).trim()
              const lines = historyText.split('\n')
              lines.forEach(line => {
                const parts = line.trim().split(',')
                if (parts.length >= 3) {
                  reservationHistory.push({
                    date: parts[0].trim(),
                    programType: parts[1].trim(),
                    amount: parseInt(parts[2].trim().replace(/[^0-9]/g, '')) || 0
                  })
                }
              })
            }

            const totalSpent = reservationHistory.reduce((sum, res) => sum + res.amount, 0)

            processedMembers.push({
              id: `bulk_${Date.now()}_${index}`,
              name,
              phone,
              email,
              joinDate,
              reservationCount: reservationHistory.length,
              totalSpent,
              status: 'active',
              reservationHistory
            })
          }
        })

        setBulkMembers(processedMembers)
        setIsProcessing(false)
        
        if (processedMembers.length > 0) {
          toast.success(`${processedMembers.length}명의 회원 데이터를 불러왔습니다.`)
        } else {
          toast.error('유효한 회원 데이터를 찾을 수 없습니다.')
        }
      } catch (error) {
        console.error('파일 처리 오류:', error)
        toast.error('파일을 처리하는 중 오류가 발생했습니다.')
        setIsProcessing(false)
      }
    }

    reader.readAsArrayBuffer(file)
  }

  // 대량 회원 저장
  const handleSaveBulkMembers = () => {
    if (bulkMembers.length === 0) {
      toast.error('저장할 회원 데이터가 없습니다.')
      return
    }

    // ID 재할당 (기존 회원과 중복되지 않도록)
    const maxId = Math.max(...members.map(m => parseInt(m.id) || 0))
    const membersWithNewIds = bulkMembers.map((member, index) => ({
      ...member,
      id: (maxId + index + 1).toString()
    }))

    setMembers([...members, ...membersWithNewIds])
    setBulkMembers([])
    setIsBulkDialogOpen(false)
    
    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    toast.success(`${membersWithNewIds.length}명의 회원이 추가되었습니다.`)
  }

  // 샘플 엑셀 파일 다운로드
  const handleDownloadSample = () => {
    const sampleData = [
      ['이름', '연락처', '이메일', '가입일', '예약내역'],
      ['홍길동', '010-1234-5678', 'hong@example.com', '2024-04-01', '2024-03-15,힐링 캠프,190000\n2024-02-20,디지털 디톡스 캠프,450000'],
      ['김영희', '010-9876-5432', 'kim@example.com', '2024-04-02', '2024-03-10,교원 힐링 연수,580000'],
      ['박철수', '010-5555-1234', 'park@example.com', '2024-04-03', '']
    ]

    const ws = XLSX.utils.aoa_to_sheet(sampleData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '회원목록')
    XLSX.writeFile(wb, '회원등록_샘플.xlsx')
    
    toast.success('샘플 파일이 다운로드되었습니다.')
  }

  // 회원 상세보기 열기
  const handleViewMember = (member: Member) => {
    setSelectedMember(member)
    setEditingMember({ ...member })
    setIsEditMode(false)
    setIsDetailDialogOpen(true)
  }

  // 편집 모드 시작
  const handleStartEdit = () => {
    setIsEditMode(true)
  }

  // 편집 취소
  const handleCancelEdit = () => {
    setEditingMember(selectedMember ? { ...selectedMember } : null)
    setIsEditMode(false)
  }

  // 회원 정보 저장
  const handleSaveMember = () => {
    if (!editingMember) return

    if (!editingMember.name || !editingMember.phone) {
      toast.error('이름과 연락처는 필수 입력 항목입니다.')
      return
    }

    const updatedMembers = members.map(member => 
      member.id === editingMember.id ? editingMember : member
    )
    
    setMembers(updatedMembers)
    setSelectedMember(editingMember)
    setIsEditMode(false)
    toast.success('회원 정보가 저장되었습니다.')
  }

  // 회원 비활성화
  const handleDeactivateMember = () => {
    if (!selectedMember) return

    const updatedMembers = members.map(member => 
      member.id === selectedMember.id 
        ? { ...member, status: 'inactive' as const }
        : member
    )
    
    setMembers(updatedMembers)
    const updatedMember = { ...selectedMember, status: 'inactive' as const }
    setSelectedMember(updatedMember)
    setEditingMember(updatedMember)
    toast.success('회원이 비활성화되었습니다.')
  }

  // 회원 활성화
  const handleActivateMember = () => {
    if (!selectedMember) return

    const updatedMembers = members.map(member => 
      member.id === selectedMember.id 
        ? { ...member, status: 'active' as const }
        : member
    )
    
    setMembers(updatedMembers)
    const updatedMember = { ...selectedMember, status: 'active' as const }
    setSelectedMember(updatedMember)
    setEditingMember(updatedMember)
    toast.success('회원이 활성화되었습니다.')
  }

  // 예약 내역 텍스트로 변환
  const reservationHistoryToText = (history: Array<{date: string, programType: string, amount: number}>) => {
    return history.map(res => `${res.date}, ${res.programType}, ${res.amount}`).join('\n')
  }

  // 예약 내역 텍스트에서 파싱
  const parseReservationHistory = (text: string) => {
    const reservationHistory: Array<{date: string, programType: string, amount: number}> = []
    if (text.trim()) {
      const lines = text.split('\n')
      lines.forEach(line => {
        const parts = line.trim().split(',')
        if (parts.length >= 3) {
          reservationHistory.push({
            date: parts[0].trim(),
            programType: parts[1].trim(),
            amount: parseInt(parts[2].trim().replace(/[^0-9]/g, '')) || 0
          })
        }
      })
    }
    return reservationHistory
  }

  // 편집 중인 회원의 예약 내역 업데이트
  const handleReservationHistoryChange = (text: string) => {
    if (!editingMember) return

    const reservationHistory = parseReservationHistory(text)
    const totalSpent = reservationHistory.reduce((sum, res) => sum + res.amount, 0)
    
    setEditingMember({
      ...editingMember,
      reservationHistory,
      reservationCount: reservationHistory.length,
      totalSpent
    })
  }

  // 검색 필터링
  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">회원 관리</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleDownloadSample}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            샘플 다운로드
          </Button>
          <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                대량 회원 등록
              </Button>
            </DialogTrigger>
          </Dialog>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                새 회원 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>새 회원 추가</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">이름 *</Label>
                  <Input
                    id="name"
                    placeholder="회원 이름을 입력하세요"
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">연락처 *</Label>
                  <Input
                    id="phone"
                    placeholder="010-0000-0000"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">이메일 (선택)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={newMember.email}
                    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reservationHistory">예약 내역 (선택)</Label>
                  <Textarea
                    id="reservationHistory"
                    placeholder="예: 2024-03-15, 힐링 캠프, 190000&#10;2024-02-20, 디지털 디톡스 캠프, 450000&#10;(날짜, 프로그램명, 금액 형식으로 한 줄씩 입력)"
                    rows={4}
                    value={newMember.reservationHistory}
                    onChange={(e) => setNewMember({...newMember, reservationHistory: e.target.value})}
                  />
                  <p className="text-xs text-gray-500">
                    각 줄마다 "날짜, 프로그램명, 금액" 형식으로 입력하세요. 없으면 비워두세요.
                  </p>
                  <div className="text-xs text-gray-400 space-y-1">
                    <p><strong>프로그램 예시:</strong></p>
                    <p>• 힐링 캠프, 디지털 디톡스 캠프, 교원 힐링 연수</p>
                    <p>• 가족 힐링 캠프, 웰니스 디톡스, 펜션기본15인</p>
                    <p>• 명상 프로그램, 싱잉볼 테라피, 자연 요가 클래스</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600">
                    <strong>가입일:</strong> {new Date().toLocaleDateString('ko-KR')} (자동 설정)
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleAddMember}>
                  회원 추가
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
                <span className="font-bold">{members.length}명</span>
              </div>
              <div className="flex justify-between">
                <span>이번 달 신규 회원</span>
                <span className="font-bold text-green-600">
                  +{members.filter(m => {
                    const joinDate = new Date(m.joinDate)
                    const now = new Date()
                    return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear()
                  }).length}명
                </span>
              </div>
              <div className="flex justify-between">
                <span>활성 회원 비율</span>
                <span className="font-bold">
                  {Math.round((members.filter(m => m.status === 'active').length / members.length) * 100)}%
                </span>
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
              <Label>이름, 연락처 또는 이메일</Label>
              <Input
                placeholder="검색어를 입력하세요"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={() => setSearchTerm('')}>
              검색 초기화
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>회원 등급 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>VIP (100만원 이상)</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-primary" />
                  </div>
                  <span className="text-sm">
                    {Math.round((members.filter(m => m.totalSpent >= 1000000).length / members.length) * 100)}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>골드 (50만원 이상)</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="w-1/2 h-full bg-primary" />
                  </div>
                  <span className="text-sm">
                    {Math.round((members.filter(m => m.totalSpent >= 500000 && m.totalSpent < 1000000).length / members.length) * 100)}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>일반</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="w-1/4 h-full bg-primary" />
                  </div>
                  <span className="text-sm">
                    {Math.round((members.filter(m => m.totalSpent < 500000).length / members.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>회원 목록 ({filteredMembers.length}명)</CardTitle>
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
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.id}</TableCell>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>{member.email || '없음'}</TableCell>
                  <TableCell>{member.joinDate}</TableCell>
                  <TableCell>{member.reservationCount}회</TableCell>
                  <TableCell>{member.totalSpent.toLocaleString()}원</TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                      {member.status === 'active' ? '활성' : '비활성'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewMember(member)}
                    >
                      상세보기
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 회원 상세보기/편집 다이얼로그 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? '회원 정보 수정' : '회원 상세 정보'}
            </DialogTitle>
          </DialogHeader>
          {editingMember && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>이름 {isEditMode && '*'}</Label>
                  {isEditMode ? (
                    <Input
                      value={editingMember.name}
                      onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                    />
                  ) : (
                    <p className="mt-1">{editingMember.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>연락처 {isEditMode && '*'}</Label>
                  {isEditMode ? (
                    <Input
                      value={editingMember.phone}
                      onChange={(e) => setEditingMember({...editingMember, phone: e.target.value})}
                    />
                  ) : (
                    <p className="mt-1">{editingMember.phone}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>이메일</Label>
                  {isEditMode ? (
                    <Input
                      type="email"
                      value={editingMember.email}
                      onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
                    />
                  ) : (
                    <p className="mt-1">{editingMember.email || '없음'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>가입일</Label>
                  {isEditMode ? (
                    <Input
                      type="date"
                      value={editingMember.joinDate}
                      onChange={(e) => setEditingMember({...editingMember, joinDate: e.target.value})}
                    />
                  ) : (
                    <p className="mt-1">{editingMember.joinDate}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>상태</Label>
                  <div className="mt-1">
                    <Badge variant={editingMember.status === 'active' ? 'default' : 'secondary'}>
                      {editingMember.status === 'active' ? '활성' : '비활성'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>예약 통계</Label>
                  <p className="mt-1 text-sm">
                    {editingMember.reservationCount}회 / {editingMember.totalSpent.toLocaleString()}원
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>예약 내역</Label>
                {isEditMode ? (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="예: 2024-03-15, 힐링 캠프, 190000&#10;2024-02-20, 디지털 디톡스 캠프, 450000&#10;(날짜, 프로그램명, 금액 형식으로 한 줄씩 입력)"
                      rows={6}
                      value={reservationHistoryToText(editingMember.reservationHistory)}
                      onChange={(e) => handleReservationHistoryChange(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      각 줄마다 "날짜, 프로그램명, 금액" 형식으로 입력하세요.
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                    {editingMember.reservationHistory.length > 0 ? (
                      editingMember.reservationHistory.map((reservation, index) => (
                        <div key={index} className="flex justify-between text-sm border-b pb-1">
                          <span>{reservation.date}</span>
                          <span>{reservation.programType}</span>
                          <span>{reservation.amount.toLocaleString()}원</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">예약 내역이 없습니다.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            {isEditMode ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancelEdit}>
                  취소
                </Button>
                <Button onClick={handleSaveMember}>
                  저장
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                {selectedMember?.status === 'active' ? (
                  <Button variant="outline" onClick={handleDeactivateMember}>
                    회원 비활성화
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleActivateMember}>
                    회원 활성화
                  </Button>
                )}
                <Button onClick={handleStartEdit}>
                  정보 수정
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 대량 회원 등록 다이얼로그 */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              대량 회원 등록
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* 파일 업로드 섹션 */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label>엑셀 파일 업로드</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileUpload}
                      disabled={isProcessing}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessing}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {isProcessing ? '처리중...' : '파일 선택'}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                <p className="font-medium mb-2">📋 파일 형식 안내:</p>
                <ul className="space-y-1 text-xs">
                  <li>• <strong>1열:</strong> 이름 (필수)</li>
                  <li>• <strong>2열:</strong> 연락처 (필수)</li>
                  <li>• <strong>3열:</strong> 이메일 (선택)</li>
                  <li>• <strong>4열:</strong> 가입일 (선택, 형식: YYYY-MM-DD)</li>
                  <li>• <strong>5열:</strong> 예약내역 (선택, 형식: 날짜,프로그램명,금액)</li>
                </ul>
                <p className="mt-2 text-xs">
                  💡 샘플 파일을 다운로드하여 형식을 확인하세요.
                </p>
              </div>
            </div>

            {/* 미리보기 테이블 */}
            {bulkMembers.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    미리보기 ({bulkMembers.length}명)
                  </h3>
                  <Badge variant="outline" className="text-green-600">
                    업로드 완료
                  </Badge>
                </div>
                
                <div className="border rounded-md max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>이름</TableHead>
                        <TableHead>연락처</TableHead>
                        <TableHead>이메일</TableHead>
                        <TableHead>가입일</TableHead>
                        <TableHead>예약횟수</TableHead>
                        <TableHead>누적금액</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bulkMembers.map((member, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{member.name}</TableCell>
                          <TableCell>{member.phone}</TableCell>
                          <TableCell>{member.email || '없음'}</TableCell>
                          <TableCell>{member.joinDate}</TableCell>
                          <TableCell>{member.reservationCount}회</TableCell>
                          <TableCell>{member.totalSpent.toLocaleString()}원</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsBulkDialogOpen(false)
                  setBulkMembers([])
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
              >
                취소
              </Button>
              <Button 
                onClick={handleSaveBulkMembers}
                disabled={bulkMembers.length === 0}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                {bulkMembers.length}명 저장
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 