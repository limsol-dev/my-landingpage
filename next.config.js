/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  
  // 타입스크립트 에러 무시
  typescript: {
    ignoreBuildErrors: true
  },
  
  // 실험적 기능
  experimental: {
    // 최적화된 로딩 비활성화
    disableOptimizedLoading: true
  }
}

module.exports = nextConfig 