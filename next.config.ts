import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // GitHub Pages 배포 설정
  output: 'export',
  trailingSlash: true,
  assetPrefix: '/whisky-Log/',
  basePath: '/whisky-Log',
  images: {
    unoptimized: true,
    domains: ['localhost', '127.0.0.1', '121.152.193.247', 'whisky-log.com', 'www.whisky-log.com'],
    formats: ['image/webp', 'image/avif'],
  },
  // 정적 사이트 생성에서 제외할 경로들
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  // 개발 환경에서 크로스 오리진 요청 허용
  allowedDevOrigins: [
    '121.152.193.247:8501',
    '121.152.193.247',
    'localhost:8501',
    'localhost',
    '127.0.0.1:8501',
    '127.0.0.1'
  ],
  // WebSocket 연결 설정
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
  // 정적 사이트 생성 최적화
  experimental: {
    optimizeCss: false,
    optimizePackageImports: ['@supabase/supabase-js'],
    // 정적 사이트 생성 시 메모리 최적화
    workerThreads: false,
    cpus: 1,
  },
  // SSR 설정
  reactStrictMode: true,
  // 개발 모드에서 Next.js 로고 숨기기
  devIndicators: {
    position: 'bottom-right',
  },

  // 압축 설정
  compress: false, // 정적 사이트 생성 시 압축 비활성화
  // 모바일 성능 최적화
  poweredByHeader: false,
  generateEtags: false,
  // 성능 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // 번들 분석 (개발 시에만)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer')({
          enabled: true,
        }))()
      );
      return config;
    },
  }),
}

export default nextConfig
