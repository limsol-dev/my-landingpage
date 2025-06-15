'use client';

import { useState } from 'react';
import { useSettings } from '@/app/admin/context/SettingsContext';
import { useReservations } from '@/app/admin/context/ReservationContext';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function BookingForm() {
  const { settings } = useSettings();
  const { addReservation } = useReservations();
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    programId: '',
    checkIn: '',
    checkOut: '',
    additionalOptions: [] as { id: string; quantity: number }[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 필드 검증
    if (!formData.customerName || !formData.customerPhone || !formData.programId || !formData.checkIn || !formData.checkOut) {
      toast.error('모든 필수 항목을 입력해주세요.');
      return;
    }

    // 선택된 프로그램 찾기
    const selectedProgram = settings.programs.find(p => p.id === formData.programId);
    if (!selectedProgram) {
      toast.error('프로그램을 선택해주세요.');
      return;
    }

    // 총 금액 계산
    let totalAmount = selectedProgram.price;
    formData.additionalOptions.forEach(option => {
      const additionalOption = settings.additionalOptions.find(o => o.id === option.id);
      if (additionalOption) {
        totalAmount += additionalOption.price * option.quantity;
      }
    });

    // 예약 추가
    addReservation({
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      programId: formData.programId as any,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      totalAmount,
      status: 'pending',
      additionalOptions: formData.additionalOptions,
    });

    // 성공 메시지
    toast.success('예약이 접수되었습니다. 관리자 확인 후 연락드리겠습니다.');

    // 폼 초기화
    setFormData({
      customerName: '',
      customerPhone: '',
      programId: '',
      checkIn: '',
      checkOut: '',
      additionalOptions: [],
    });
  };

  const handleAdditionalOptionChange = (optionId: string, quantity: number) => {
    setFormData(prev => {
      const existingOption = prev.additionalOptions.find(o => o.id === optionId);
      if (existingOption) {
        return {
          ...prev,
          additionalOptions: prev.additionalOptions.map(o =>
            o.id === optionId ? { ...o, quantity } : o
          ),
        };
      } else {
        return {
          ...prev,
          additionalOptions: [...prev.additionalOptions, { id: optionId, quantity }],
        };
      }
    });
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="customerName">예약자명</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="customerPhone">연락처</Label>
            <Input
              id="customerPhone"
              value={formData.customerPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="program">프로그램 선택</Label>
            <Select
              value={formData.programId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, programId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="프로그램을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {settings.programs.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name} - ₩{program.price.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="checkIn">체크인</Label>
              <Input
                id="checkIn"
                type="date"
                value={formData.checkIn}
                onChange={(e) => setFormData(prev => ({ ...prev, checkIn: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="checkOut">체크아웃</Label>
              <Input
                id="checkOut"
                type="date"
                value={formData.checkOut}
                onChange={(e) => setFormData(prev => ({ ...prev, checkOut: e.target.value }))}
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">추가 옵션</h3>
          {settings.additionalOptions.map((option) => (
            <div key={option.id} className="flex items-center justify-between">
              <div>
                <Label>{option.name}</Label>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={formData.additionalOptions.find(o => o.id === option.id)?.quantity || 0}
                  onChange={(e) => handleAdditionalOptionChange(option.id, parseInt(e.target.value) || 0)}
                  className="w-20"
                />
                <span className="text-sm">개</span>
              </div>
            </div>
          ))}
        </div>

        <Button type="submit" className="w-full bg-[#2F513F] hover:bg-[#3d6b4f] text-white">
          예약하기
        </Button>
      </form>
    </Card>
  );
} 