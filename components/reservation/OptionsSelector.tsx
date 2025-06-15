"use client"

import { useReservationStore, BbqType } from "@/store/useReservationStore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Minus, Plus, Coffee, Bus } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const bbqPackages = [
  {
    id: "basic",
    label: "실속형",
    description: "숯불용 양질의 고기만 제공",
    details: [
      "국내산 냉장 목살 1kg",
      "5인 기준",
    ],
    price: 50000
  },
  {
    id: "standard",
    label: "기본형",
    description: "고기와 기본 식사 제공",
    details: [
      "국내산 냉장 목살 1kg",
      "햇반 5개",
      "5인 기준",
    ],
    price: 60000
  },
  {
    id: "premium",
    label: "프리미엄형",
    description: "손 안대고 몸만 오면 되는 풀 패키지",
    details: [
      "국내산 냉장 목살 1kg",
      "햇반 5개",
      "상차림 (쌈장, 쌈채소, 쌈무)",
      "5인 기준",
    ],
    price: 80000
  }
] as const

export default function OptionsSelector() {
  const {
    adults,
    children,
    options,
    setAdults,
    setChildren,
    setBbqOption,
    toggleOption
  } = useReservationStore()

  const totalPeople = adults + children
  const recommendedKg = Math.ceil(totalPeople / 5)

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">인원 및 옵션 선택</h2>
        <p className="text-muted-foreground">
          투숙 인원과 추가 옵션을 선택해주세요
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">성인</h3>
                <p className="text-sm text-muted-foreground">만 13세 이상</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => adults > 1 && setAdults(adults - 1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{adults}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => adults < 4 && setAdults(adults + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">소아</h3>
                <p className="text-sm text-muted-foreground">만 12세 이하</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => children > 0 && setChildren(children - 1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{children}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => children < 2 && setChildren(children + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-medium mb-4">추가 옵션</h3>
          <div className="space-y-6">
            {/* 조식 옵션 */}
            <div className="flex items-start space-x-4">
              <Checkbox
                id="breakfast"
                checked={options.breakfast}
                onCheckedChange={() => toggleOption('breakfast')}
              />
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="breakfast"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Coffee className="w-4 h-4" />
                  조식 추가
                </Label>
                <p className="text-sm text-muted-foreground">
                  건강한 보리밥 조식 제공
                </p>
                <p className="text-sm font-medium">
                  10,000원 / 1인
                </p>
              </div>
            </div>

            {/* BBQ 패키지 */}
            <div className="space-y-4">
              <h4 className="font-medium">BBQ 패키지 선택</h4>
              <Select
                value={options.bbq.type || ""}
                onValueChange={(value) => setBbqOption(value as BbqType || null, options.bbq.quantity)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="BBQ 패키지를 선택해주세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">선택 안함</SelectItem>
                  {bbqPackages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.label} - {pkg.price.toLocaleString()}원
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {options.bbq.type && (
                <div className="space-y-4 pt-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h5 className="font-medium mb-2">
                      {bbqPackages.find(p => p.id === options.bbq.type)?.label} 패키지 구성
                    </h5>
                    <ul className="text-sm space-y-1">
                      {bbqPackages
                        .find(p => p.id === options.bbq.type)
                        ?.details.map((detail, i) => (
                          <li key={i}>{detail}</li>
                        ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm mb-2">수량 선택 (추천: {recommendedKg}kg)</p>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => options.bbq.quantity > 1 && 
                          setBbqOption(options.bbq.type, options.bbq.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{options.bbq.quantity}kg</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setBbqOption(options.bbq.type, options.bbq.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 버스 서비스 */}
            <div className="flex items-start space-x-4">
              <Checkbox
                id="bus"
                checked={options.bus}
                onCheckedChange={() => toggleOption('bus')}
              />
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="bus"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Bus className="w-4 h-4" />
                  버스 서비스
                </Label>
                <p className="text-sm text-muted-foreground">
                  픽업 서비스 (가격 협의 필요)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 