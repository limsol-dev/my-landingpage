"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Facebook, Instagram, Youtube, ArrowRight } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-muted/50">
      <div className="container py-20">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h3 className="font-bold text-lg">힐링스테이</h3>
            <p className="text-sm text-muted-foreground">
              자연 속에서 찾는 온전한 휴식
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">바로가기</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground">프로그램 안내</a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">예약하기</a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">오시는 길</a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">문의하기</a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">고객센터</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>전화: 1544-0000</li>
              <li>이메일: help@healingstay.com</li>
              <li>평일 09:00 - 18:00</li>
              <li>주말 및 공휴일 10:00 - 17:00</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">뉴스레터 구독</h4>
            <p className="text-sm text-muted-foreground">
              힐링스테이의 새로운 소식을 받아보세요
            </p>
            <div className="flex gap-2">
              <Input placeholder="이메일 주소" />
              <Button variant="outline">
                구독
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between gap-4 text-sm text-muted-foreground">
          <div className="space-y-2">
            <p>사업자등록번호: 123-45-67890</p>
            <p>주소: 강원도 평창군 대관령면 올림픽로 123</p>
            <p>대표: 홍길동</p>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">이용약관</a>
            <a href="#" className="hover:text-foreground">개인정보처리방침</a>
            <a href="#" className="hover:text-foreground">사업자정보확인</a>
          </div>
        </div>
      </div>
    </footer>
  )
} 