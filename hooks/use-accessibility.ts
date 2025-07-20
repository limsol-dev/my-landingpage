import { useEffect } from 'react'

/**
 * body 요소의 aria-hidden 속성을 방지하는 접근성 훅
 * Radix UI 컴포넌트들이 모달 열 때 body에 설정하는 aria-hidden="true"를 방지합니다.
 * 
 * WAI-ARIA 명세에 따르면 body 요소에 aria-hidden을 사용하면 안 됩니다.
 * 이는 전체 페이지가 보조 기술에서 숨겨지기 때문입니다.
 */
export function usePreventBodyAriaHidden() {
  useEffect(() => {
    const preventBodyAriaHidden = () => {
      const body = document.body
      if (body && body.getAttribute('aria-hidden') === 'true') {
        body.removeAttribute('aria-hidden')
        console.log('🔧 접근성 개선: body aria-hidden 속성이 제거되었습니다.')
      }
    }

    // 초기 체크
    preventBodyAriaHidden()

    // MutationObserver로 실시간 모니터링
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'aria-hidden' &&
          mutation.target === document.body
        ) {
          preventBodyAriaHidden()
        }
      })
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['aria-hidden']
    })

    return () => {
      observer.disconnect()
    }
  }, [])
}

/**
 * 모달 포커스 이벤트에서 body aria-hidden을 방지하는 헬퍼 함수
 */
export function handleModalFocus() {
  const body = document.body
  if (body.getAttribute('aria-hidden') === 'true') {
    body.removeAttribute('aria-hidden')
  }
} 