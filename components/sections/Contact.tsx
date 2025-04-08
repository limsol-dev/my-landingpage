import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Phone, Mail } from "lucide-react"

export default function Contact() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="grid lg:grid-cols-[1fr_400px] gap-12">
          {/* 문의 폼 */}
          <Card>
            <CardHeader>
              <CardTitle>문의하기</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input placeholder="이름" />
                  <Input placeholder="연락처" />
                </div>
                <Input placeholder="이메일" type="email" />
                <Input placeholder="회사/단체명" />
                <Textarea placeholder="문의 내용을 입력해주세요" rows={5} />
                <Button className="w-full">문의하기</Button>
              </form>
            </CardContent>
          </Card>

          {/* 연락처 정보 */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Contact Us</h2>
            <p className="text-muted-foreground">
              궁금하신 점이 있으시다면 언제든 문의해주세요.
            </p>
            
            <div className="space-y-4">
              {[
                { icon: <Phone className="h-5 w-5" />, text: "1544-0000" },
                { icon: <Mail className="h-5 w-5" />, text: "support@example.com" },
                { icon: <MessageSquare className="h-5 w-5" />, text: "실시간 채팅 문의" }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 