import Hero from "@/components/sections/Hero"
import ProgramMatcher from "@/components/sections/ProgramMatcher"
import Programs from "@/components/sections/Programs"
import HealingSpaces from "@/components/sections/HealingSpaces"
import Stories from "@/components/sections/Stories"
import Footer from "@/components/sections/Footer"
import BookingGuide from "@/components/sections/BookingGuide"

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      {/* 1. 히어로 섹션 */}
      <Hero />

      {/* 2. 프로그램 퀵 매칭 */}
      <ProgramMatcher />

      {/* 3. 주요 프로그램 소개 */}
      <Programs />

      {/* 4. 힐링 스페이스 */}
      <HealingSpaces />

      {/* 5. 실제 참여자 스토리 */}
      <Stories />

      <BookingGuide />

      {/* 푸터 */}
      <Footer />
    </main>
  )
} 