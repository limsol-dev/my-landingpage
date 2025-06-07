"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "체크인/체크아웃 시간은 어떻게 되나요?",
    answer: "체크인은 오후 3시부터, 체크아웃은 오전 11시까지입니다. 얼리 체크인이나 레이트 체크아웃은 사전 문의 시 가능할 수 있습니다."
  },
  {
    question: "예약 취소 및 환불 규정은 어떻게 되나요?",
    answer: "체크인 7일 전 취소 시 100% 환불, 3일 전 취소 시 70% 환불, 당일 취소 시 환불이 불가합니다. 자세한 사항은 예약 시 안내드립니다."
  },
  {
    question: "주차는 가능한가요?",
    answer: "네, 투숙객을 위한 무료 주차장이 마련되어 있습니다. 전기차 충전소도 구비되어 있습니다."
  },
  {
    question: "객실 내 취사가 가능한가요?",
    answer: "기본적인 조리도구와 전자레인지가 구비되어 있어 간단한 조리가 가능합니다. 바비큐는 지정된 장소에서만 가능합니다."
  }
]

export default function FAQ() {
  return (
    <section id="faq-section" className="py-20 bg-gray-50">
      <div className="container max-w-4xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">자주 묻는 질문</h2>
          <p className="text-muted-foreground">
            고객님들이 자주 문의하시는 내용을 모았습니다
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
} 