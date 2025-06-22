/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  
  // 타입스크립트 에러 무시
  typescript: {
    ignoreBuildErrors: true
  },
  
  // ESLint 에러 무시
  eslint: {
    ignoreDuringBuilds: true
  },
  
  // 실험적 기능
  experimental: {
    // 최적화된 로딩 비활성화
    disableOptimizedLoading: true
  },
  
  // 개발 환경 설정
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // 개발 환경에서 콘솔 경고 최소화
      config.optimization.minimize = false
    }
    return config
  },
  
  // 환경변수 설정
  env: {
    // Redux DevTools 경고 비활성화
    DISABLE_REDUX_DEVTOOLS_EXTENSION: 'true'
  }
}

module.exports = nextConfig 