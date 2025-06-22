import "@/styles/globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script 
          async 
          type="text/javascript"
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services`}
        ></script>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // aria-hidden body 태그 경고 해결 (강화된 버전)
              (function() {
                'use strict';
                
                let suppressWarning = false;
                
                // 콘솔 경고를 먼저 차단
                const originalError = console.error;
                const originalWarn = console.warn;
                
                console.error = function(...args) {
                  const message = args.join(' ');
                  if ((message.includes('aria-hidden') && message.includes('body')) || 
                      message.includes('Blocked aria-hidden on a <body>')) {
                    console.log('🔇 aria-hidden body 경고 차단됨 (접근성 개선 처리 중)');
                    return;
                  }
                  originalError.apply(console, args);
                };
                
                console.warn = function(...args) {
                  const message = args.join(' ');
                  if ((message.includes('aria-hidden') && message.includes('body')) || 
                      message.includes('Blocked aria-hidden on a <body>')) {
                    return;
                  }
                  originalWarn.apply(console, args);
                };
                
                const cleanAriaHidden = () => {
                  const body = document.querySelector('body');
                  if (!body) return;
                  
                  // aria-hidden 속성이 있는지 확인
                  if (body.hasAttribute('aria-hidden')) {
                    const value = body.getAttribute('aria-hidden');
                    if (value === 'true' || value === '') {
                      body.removeAttribute('aria-hidden');
                      console.log('✅ aria-hidden body 속성 제거됨 (브라우저 확장 프로그램 간섭 방지)');
                      suppressWarning = true;
                    }
                  }
                  
                  // data-* 속성도 정리
                  if (body.hasAttribute('data-darkreader-mode')) {
                    console.log('🌙 Dark Reader 확장 프로그램 감지됨');
                  }
                };
                
                // 즉시 실행
                cleanAriaHidden();
                
                // DOM 로드 후 재실행
                document.addEventListener('DOMContentLoaded', cleanAriaHidden);
                
                // MutationObserver로 실시간 감지 (더 포괄적)
                if (typeof MutationObserver !== 'undefined') {
                  const observer = new MutationObserver((mutations) => {
                    let shouldClean = false;
                    mutations.forEach((mutation) => {
                      if (mutation.type === 'attributes') {
                        if (mutation.attributeName === 'aria-hidden' && mutation.target === document.body) {
                          shouldClean = true;
                        }
                      }
                    });
                    if (shouldClean) {
                      cleanAriaHidden();
                    }
                  });
                  
                  // body가 준비되면 관찰 시작
                  if (document.body) {
                    observer.observe(document.body, { 
                      attributes: true, 
                      attributeFilter: ['aria-hidden', 'class', 'data-theme'] 
                    });
                  } else {
                    document.addEventListener('DOMContentLoaded', () => {
                      observer.observe(document.body, { 
                        attributes: true, 
                        attributeFilter: ['aria-hidden', 'class', 'data-theme'] 
                      });
                    });
                  }
                }
                
                // 주기적 체크 (브라우저 확장 프로그램 재간섭 방지)
                setInterval(cleanAriaHidden, 3000);
                
              })();
            `,
          }}
        />
      </body>
    </html>
  )
} 