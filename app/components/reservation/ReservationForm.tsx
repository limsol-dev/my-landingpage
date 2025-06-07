"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ReservationInfo,
  PRICE_CONFIG,
  validateReservation,
  calculateTotalPrice,
} from './types';

export default function ReservationForm() {
  const [reservation, setReservation] = useState<ReservationInfo>({
    checkIn: null,
    checkOut: null,
    adults: 1,
    children: 0,
    totalGuests: 1,
    extraGuests: 0,
    bbq: {
      grillCount: 0,
      meatSetCount: 0,
      fullSetCount: 0,
    },
    meal: {
      breakfastCount: 0,
    },
    transport: {
      needsBus: false,
    },
  });

  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateReservation(reservation);
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      // TODO: 예약 처리 로직 구현
      console.log('예약 정보:', reservation);
    }
  };

  const updateGuests = (adults: number, children: number) => {
    const totalGuests = adults + children;
    const extraGuests = Math.max(0, totalGuests - PRICE_CONFIG.BASE_CAPACITY);
    
    setReservation(prev => ({
      ...prev,
      adults,
      children,
      totalGuests,
      extraGuests,
    }));
  };

  // 예약 정보 요약
  const getReservationSummary = () => {
    const summary = [];
    
    // 기본 인원 정보
    summary.push(`총 인원: ${reservation.totalGuests}명 (성인 ${reservation.adults}명, 아동 ${reservation.children}명)`);
    
    // 추가 인원 정보
    if (reservation.extraGuests > 0) {
      summary.push(`추가 인원: ${reservation.extraGuests}명`);
    }

    // 저녁 준비 서비스 정보
    if (reservation.bbq.grillCount > 0) {
      summary.push(`바베큐 그릴: ${reservation.bbq.grillCount}개`);
    }
    if (reservation.bbq.meatSetCount > 0) {
      summary.push(`고기만 세트: ${reservation.bbq.meatSetCount}명`);
    }
    if (reservation.bbq.fullSetCount > 0) {
      summary.push(`저녁 식사: ${reservation.bbq.fullSetCount}명`);
    }

    // 조식 정보
    if (reservation.meal.breakfastCount > 0) {
      summary.push(`조식: ${reservation.meal.breakfastCount}명`);
    }

    // 버스 렌트 정보
    if (reservation.transport.needsBus) {
      summary.push('버스 렌트 필요');
    }

    return summary;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle>펜션 예약</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 날짜 선택 */}
          <div className="space-y-2">
            <Label>체크인/체크아웃 날짜</Label>
            <DateRangePicker
              selected={reservation.checkIn && reservation.checkOut ? {
                from: reservation.checkIn,
                to: reservation.checkOut
              } : undefined}
              onSelect={(range: any) => {
                setReservation(prev => ({
                  ...prev,
                  checkIn: range?.from || null,
                  checkOut: range?.to || null,
                }));
              }}
            />
          </div>

          {/* 인원 선택 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>성인</Label>
              <Input
                type="number"
                min="1"
                value={reservation.adults}
                onChange={(e) => updateGuests(parseInt(e.target.value) || 0, reservation.children)}
              />
            </div>
            <div className="space-y-2">
              <Label>아동</Label>
              <Input
                type="number"
                min="0"
                value={reservation.children}
                onChange={(e) => updateGuests(reservation.adults, parseInt(e.target.value) || 0)}
              />
            </div>
            {reservation.extraGuests > 0 && (
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">
                  * 기본 패키지 {PRICE_CONFIG.BASE_CAPACITY}인 초과, 추가 인원 {reservation.extraGuests}명
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* 저녁 준비 서비스 */}
          <div className="space-y-4">
            <h3 className="font-semibold">저녁 준비 서비스</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>1. 바베큐 그릴대여 (최대 {PRICE_CONFIG.BBQ.MAX_GRILLS}개)</Label>
                <Input
                  type="number"
                  min="0"
                  max={PRICE_CONFIG.BBQ.MAX_GRILLS}
                  value={reservation.bbq.grillCount}
                  onChange={(e) => setReservation(prev => ({
                    ...prev,
                    bbq: { ...prev.bbq, grillCount: parseInt(e.target.value) || 0 }
                  }))}
                />
                <p className="text-sm text-muted-foreground">
                  숯 + 토치 + 그릴 제공 (8인 1세트 추천)
                </p>
              </div>
              <div className="space-y-2">
                <Label>2. 고기만 세트 - 1인 {PRICE_CONFIG.BBQ.MEAT_SET.toLocaleString()}원</Label>
                <Input
                  type="number"
                  min="0"
                  value={reservation.bbq.meatSetCount}
                  onChange={(e) => setReservation(prev => ({
                    ...prev,
                    bbq: { ...prev.bbq, meatSetCount: parseInt(e.target.value) || 0 }
                  }))}
                />
                <p className="text-sm text-muted-foreground">국내산 한돈 냉장</p>
              </div>
              <div className="space-y-2">
                <Label>3. 저녁 식사 제공 - 1인 {PRICE_CONFIG.BBQ.FULL_SET.toLocaleString()}원</Label>
                <Input
                  type="number"
                  min="0"
                  value={reservation.bbq.fullSetCount}
                  onChange={(e) => setReservation(prev => ({
                    ...prev,
                    bbq: { ...prev.bbq, fullSetCount: parseInt(e.target.value) || 0 }
                  }))}
                />
                <p className="text-sm text-muted-foreground">고기 + 밥 + 채소</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* 조식 옵션 */}
          <div className="space-y-4">
            <h3 className="font-semibold">조식 서비스</h3>
            <div className="space-y-2">
              <Label>보리밥 조식 인원 (1인 {PRICE_CONFIG.BREAKFAST.toLocaleString()}원)</Label>
              <Input
                type="number"
                min="0"
                value={reservation.meal.breakfastCount}
                onChange={(e) => setReservation(prev => ({
                  ...prev,
                  meal: { ...prev.meal, breakfastCount: parseInt(e.target.value) || 0 }
                }))}
              />
            </div>
          </div>

          <Separator />

          {/* 교통 옵션 */}
          <div className="space-y-4">
            <h3 className="font-semibold">교통 서비스</h3>
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={reservation.transport.needsBus}
                  onChange={(e) => setReservation(prev => ({
                    ...prev,
                    transport: { ...prev.transport, needsBus: e.target.checked }
                  }))}
                />
                <span>버스 렌트 필요 (협의 후 안내)</span>
              </Label>
            </div>
          </div>

          {/* 예약 정보 요약 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">예약 정보</h3>
            <ul className="text-sm space-y-1">
              {getReservationSummary().map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          {/* 가격 표시 */}
          <div className="mt-6 p-4 bg-primary/10 rounded-lg border-2 border-green-500">
            <div className="text-lg font-semibold">
              총 예약금액: {calculateTotalPrice(reservation).toLocaleString()}원
            </div>
            {reservation.extraGuests > 0 && (
              <p className="text-sm text-muted-foreground">
                * 펜션 기본 패키지 {PRICE_CONFIG.BASE_CAPACITY}인 기준<br />
                * 추가인원 {reservation.extraGuests}명
                (1인 {PRICE_CONFIG.EXTRA_PERSON_FEE.toLocaleString()}원)
              </p>
            )}
          </div>

          {/* 에러 메시지 */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full">
            예약하기
          </Button>
        </CardContent>
      </Card>
    </form>
  );
} 