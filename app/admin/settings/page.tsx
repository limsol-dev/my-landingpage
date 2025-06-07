"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type BusinessInfo = {
  pensionName: string
  ownerName: string
  phone: string
  email: string
  address: string
  businessNumber: string
}

type ReservationSettings = {
  minStay: number
  maxStay: number
  checkInTime: string
  checkOutTime: string
  autoConfirm: boolean
  allowPartialPayment: boolean
  cancellationPolicy: string
}

type RoomSettings = {
  standardPrice: number
  deluxePrice: number
  extraPersonFee: number
  maxExtraPerson: number
  cleaningFee: number
}

type ServiceSettings = {
  bbqAvailable: boolean
  bbqPrice: number
  breakfastAvailable: boolean
  breakfastPrice: number
  shuttleAvailable: boolean
  shuttlePrice: number
}

export default function SettingsPage() {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    pensionName: '산들바람 펜션',
    ownerName: '김철수',
    phone: '010-1234-5678',
    email: 'info@example.com',
    address: '강원도 평창군 봉평면 창동리 123',
    businessNumber: '123-45-67890'
  })

  const [reservationSettings, setReservationSettings] = useState<ReservationSettings>({
    minStay: 1,
    maxStay: 7,
    checkInTime: '15:00',
    checkOutTime: '11:00',
    autoConfirm: false,
    allowPartialPayment: true,
    cancellationPolicy: '체크인 3일 전까지 무료 취소 가능'
  })

  const [roomSettings, setRoomSettings] = useState<RoomSettings>({
    standardPrice: 150000,
    deluxePrice: 200000,
    extraPersonFee: 20000,
    maxExtraPerson: 2,
    cleaningFee: 30000
  })

  const [serviceSettings, setServiceSettings] = useState<ServiceSettings>({
    bbqAvailable: true,
    bbqPrice: 50000,
    breakfastAvailable: true,
    breakfastPrice: 15000,
    shuttleAvailable: true,
    shuttlePrice: 10000
  })

  const updateBusinessInfo = (field: keyof BusinessInfo, value: string) => {
    setBusinessInfo(prev => ({ ...prev, [field]: value }))
  }

  const updateReservationSettings = (field: keyof ReservationSettings, value: string | number | boolean) => {
    setReservationSettings(prev => ({ ...prev, [field]: value }))
  }

  const updateRoomSettings = (field: keyof RoomSettings, value: number) => {
    setRoomSettings(prev => ({ ...prev, [field]: value }))
  }

  const updateServiceSettings = (field: keyof ServiceSettings, value: number | boolean) => {
    setServiceSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      // TODO: API 호출로 설정 저장
      console.log('Settings saved:', {
        businessInfo,
        reservationSettings,
        roomSettings,
        serviceSettings
      })
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">환경 설정</h1>

      <Tabs defaultValue="business" className="space-y-4">
        <TabsList>
          <TabsTrigger value="business">기본 정보</TabsTrigger>
          <TabsTrigger value="reservation">예약 설정</TabsTrigger>
          <TabsTrigger value="room">객실 설정</TabsTrigger>
          <TabsTrigger value="service">부가 서비스</TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>기본 정보 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>펜션 이름</Label>
                  <Input 
                    value={businessInfo.pensionName}
                    onChange={(e) => updateBusinessInfo('pensionName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>대표자 이름</Label>
                  <Input 
                    value={businessInfo.ownerName}
                    onChange={(e) => updateBusinessInfo('ownerName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>연락처</Label>
                  <Input 
                    value={businessInfo.phone}
                    onChange={(e) => updateBusinessInfo('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>이메일</Label>
                  <Input 
                    value={businessInfo.email}
                    onChange={(e) => updateBusinessInfo('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>주소</Label>
                  <Input 
                    value={businessInfo.address}
                    onChange={(e) => updateBusinessInfo('address', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>사업자 등록번호</Label>
                  <Input 
                    value={businessInfo.businessNumber}
                    onChange={(e) => updateBusinessInfo('businessNumber', e.target.value)}
                  />
                </div>
              </div>
              <Button className="w-full" onClick={handleSave}>저장</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reservation">
          <Card>
            <CardHeader>
              <CardTitle>예약 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>최소 숙박일</Label>
                  <Input 
                    type="number"
                    value={reservationSettings.minStay}
                    onChange={(e) => updateReservationSettings('minStay', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>최대 숙박일</Label>
                  <Input 
                    type="number"
                    value={reservationSettings.maxStay}
                    onChange={(e) => updateReservationSettings('maxStay', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>체크인 시간</Label>
                  <Input 
                    type="time"
                    value={reservationSettings.checkInTime}
                    onChange={(e) => updateReservationSettings('checkInTime', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>체크아웃 시간</Label>
                  <Input 
                    type="time"
                    value={reservationSettings.checkOutTime}
                    onChange={(e) => updateReservationSettings('checkOutTime', e.target.value)}
                  />
                </div>
                <div className="col-span-2 flex items-center justify-between">
                  <Label>자동 예약 확정</Label>
                  <Switch 
                    checked={reservationSettings.autoConfirm}
                    onCheckedChange={(checked: boolean) => updateReservationSettings('autoConfirm', checked)}
                  />
                </div>
                <div className="col-span-2 flex items-center justify-between">
                  <Label>부분 결제 허용</Label>
                  <Switch 
                    checked={reservationSettings.allowPartialPayment}
                    onCheckedChange={(checked: boolean) => updateReservationSettings('allowPartialPayment', checked)}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>취소 정책</Label>
                  <Textarea 
                    value={reservationSettings.cancellationPolicy}
                    onChange={(e) => updateReservationSettings('cancellationPolicy', e.target.value)}
                  />
                </div>
              </div>
              <Button className="w-full" onClick={handleSave}>저장</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="room">
          <Card>
            <CardHeader>
              <CardTitle>객실 요금 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>스탠다드룸 기본 요금</Label>
                  <Input 
                    type="number"
                    value={roomSettings.standardPrice}
                    onChange={(e) => updateRoomSettings('standardPrice', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>디럭스룸 기본 요금</Label>
                  <Input 
                    type="number"
                    value={roomSettings.deluxePrice}
                    onChange={(e) => updateRoomSettings('deluxePrice', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>추가 인원 요금 (1인당)</Label>
                  <Input 
                    type="number"
                    value={roomSettings.extraPersonFee}
                    onChange={(e) => updateRoomSettings('extraPersonFee', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>최대 추가 인원</Label>
                  <Input 
                    type="number"
                    value={roomSettings.maxExtraPerson}
                    onChange={(e) => updateRoomSettings('maxExtraPerson', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>청소 요금</Label>
                  <Input 
                    type="number"
                    value={roomSettings.cleaningFee}
                    onChange={(e) => updateRoomSettings('cleaningFee', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <Button className="w-full" onClick={handleSave}>저장</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service">
          <Card>
            <CardHeader>
              <CardTitle>부가 서비스 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>BBQ 서비스</Label>
                  <Switch 
                    checked={serviceSettings.bbqAvailable}
                    onCheckedChange={(checked: boolean) => updateServiceSettings('bbqAvailable', checked)}
                  />
                </div>
                {serviceSettings.bbqAvailable && (
                  <div className="space-y-2">
                    <Label>BBQ 요금</Label>
                    <Input 
                      type="number"
                      value={serviceSettings.bbqPrice}
                      onChange={(e) => updateServiceSettings('bbqPrice', parseInt(e.target.value))}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>조식 서비스</Label>
                  <Switch 
                    checked={serviceSettings.breakfastAvailable}
                    onCheckedChange={(checked: boolean) => updateServiceSettings('breakfastAvailable', checked)}
                  />
                </div>
                {serviceSettings.breakfastAvailable && (
                  <div className="space-y-2">
                    <Label>조식 요금 (1인당)</Label>
                    <Input 
                      type="number"
                      value={serviceSettings.breakfastPrice}
                      onChange={(e) => updateServiceSettings('breakfastPrice', parseInt(e.target.value))}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>셔틀 서비스</Label>
                  <Switch 
                    checked={serviceSettings.shuttleAvailable}
                    onCheckedChange={(checked: boolean) => updateServiceSettings('shuttleAvailable', checked)}
                  />
                </div>
                {serviceSettings.shuttleAvailable && (
                  <div className="space-y-2">
                    <Label>셔틀 요금 (1회당)</Label>
                    <Input 
                      type="number"
                      value={serviceSettings.shuttlePrice}
                      onChange={(e) => updateServiceSettings('shuttlePrice', parseInt(e.target.value))}
                    />
                  </div>
                )}
              </div>

              <Button className="w-full" onClick={handleSave}>저장</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 