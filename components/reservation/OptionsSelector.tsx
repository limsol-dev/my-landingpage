"use client"

import { useReservationStore, BbqType } from "@/store/useReservationStore"
import { useReservationAnalytics } from "@/hooks/use-reservation-analytics"
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
  
  const { trackEvent, isInitialized } = useReservationAnalytics()

  const totalPeople = adults + children
  const recommendedKg = Math.ceil(totalPeople / 5)

  const handleAdultsChange = (newCount: number) => {
    const previousCount = adults
    setAdults(newCount) // Store에서 자동 추적됨
    
    // 추가 상세 추적
    if (isInitialized) {
      trackEvent({
        event_type: 'guest_count_change',
        adults_count: newCount,
        children_count: children,
        conversion_funnel_step: 3,
        metadata: {
          change_method: 'plus_minus_button',
          guest_type: 'adults',
          delta: newCount - previousCount,
          recommended_bbq_kg: Math.ceil((newCount + children) / 5),
          pricing_impact: newCount > 2 ? 'additional_charge' : 'base_rate'
        }
      })
    }
  }

  const handleChildrenChange = (newCount: number) => {
    const previousCount = children
    setChildren(newCount) // Store에서 자동 추적됨
    
    // 추가 상세 추적
    if (isInitialized) {
      trackEvent({
        event_type: 'guest_count_change',
        adults_count: adults,
        children_count: newCount,
        conversion_funnel_step: 3,
        metadata: {
          change_method: 'plus_minus_button',
          guest_type: 'children',
          delta: newCount - previousCount,
          recommended_bbq_kg: Math.ceil((adults + newCount) / 5),
          pricing_impact: 'partial_charge'
        }
      })
    }
  }

  const handleBbqSelection = (type: BbqType | null, selectedPackage?: typeof bbqPackages[number]) => {
    setBbqOption(type, options.bbq.quantity) // Store에서 자동 추적됨
    
    // 추가 상세 추적
    if (isInitialized && selectedPackage) {
      trackEvent({
        event_type: type ? 'program_add' : 'program_remove',
        conversion_funnel_step: 3,
        metadata: {
          option_type: 'bbq_package',
          package_name: selectedPackage.label,
          package_description: selectedPackage.description,
          package_price: selectedPackage.price,
          recommended_for_guests: totalPeople,
          selection_method: 'dropdown'
        }
      })
    }
  }

  const handleOptionToggle = (option: 'breakfast' | 'bus') => {
    const currentValue = options[option]
    toggleOption(option) // Store에서 자동 추적됨
    
    // 추가 상세 추적
    if (isInitialized) {
      trackEvent({
        event_type: !currentValue ? 'program_add' : 'program_remove',
        conversion_funnel_step: 3,
        metadata: {
          option_type: option,
          option_name: option === 'breakfast' ? '조식 서비스' : '셔틀버스 서비스',
          enabled: !currentValue,
          guest_count_applicable: option === 'breakfast' ? totalPeople : null,
          selection_method: 'checkbox'
        }
      })
    }
  }

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
                  onClick={() => adults > 1 && handleAdultsChange(adults - 1)}
                  disabled={adults <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{adults}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => adults < 10 && handleAdultsChange(adults + 1)}
                  disabled={adults >= 10}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">아동</h3>
                <p className="text-sm text-muted-foreground">만 4-12세</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => children > 0 && handleChildrenChange(children - 1)}
                  disabled={children <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{children}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => children < 5 && handleChildrenChange(children + 1)}
                  disabled={children >= 5}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {totalPeople > 2 && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  기준 인원 초과시 추가 요금이 발생합니다
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* BBQ 패키지 선택 */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">BBQ 패키지</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {totalPeople}명 기준 {recommendedKg}kg 권장
              </p>
            </div>

            <Select 
              value={options.bbq.type || "none"} 
              onValueChange={(value) => {
                const selectedPackage = bbqPackages.find(pkg => pkg.id === value)
                handleBbqSelection(value === "none" ? null : value as BbqType, selectedPackage)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="BBQ 패키지 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">선택 안함</SelectItem>
                {bbqPackages.map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{pkg.label} - {pkg.price.toLocaleString()}원</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {options.bbq.type && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="space-y-1">
                  {bbqPackages.find(pkg => pkg.id === options.bbq.type)?.details.map((detail, index) => (
                    <p key={index} className="text-sm text-green-800">• {detail}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 추가 옵션 */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="font-medium">추가 서비스</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="breakfast" 
                  checked={options.breakfast}
                  onCheckedChange={() => handleOptionToggle('breakfast')}
                />
                <Coffee className="w-4 h-4 text-amber-600" />
                <Label htmlFor="breakfast" className="font-medium">
                  조식 서비스 ({totalPeople}명 기준)
                </Label>
                <span className="text-sm text-muted-foreground ml-auto">
                  {(totalPeople * 10000).toLocaleString()}원
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="bus" 
                  checked={options.bus}
                  onCheckedChange={() => handleOptionToggle('bus')}
                />
                <Bus className="w-4 h-4 text-blue-600" />
                <Label htmlFor="bus" className="font-medium">
                  셔틀버스 서비스
                </Label>
                <span className="text-sm text-muted-foreground ml-auto">
                  20,000원
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 