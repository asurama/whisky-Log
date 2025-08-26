import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "Whisky Log",
  description: "개인 위스키 컬렉션과 시음 기록을 관리하는 앱",
  manifest: "/whisky-Log/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Whisky Log",
    startupImage: [
      {
        url: "/whisky-Log/icons/icon-512x512.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/whisky-Log/icons/icon-512x512.png",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/whisky-Log/icons/icon-512x512.png",
        media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/whisky-Log/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/whisky-Log/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/whisky-Log/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Whisky Log",
    "application-name": "Whisky Log",
    "msapplication-TileColor": "#3B82F6",
    "msapplication-config": "/whisky-Log/browserconfig.xml",
  },
};

export const viewport: Viewport = {
  themeColor: "#3B82F6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  // 모바일 브라우저 주소창 고정
  height: "device-height",
  minimumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" style={{ width: '100%', height: '100%', margin: 0, padding: 0 }}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        {/* 모바일 브라우저 주소창 고정 */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, height=device-height" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        <meta name="msapplication-TileImage" content="/whisky-Log/icons/icon-144x144.png" />
        
        {/* PWA 관련 메타 태그 */}
        <meta name="application-name" content="Whisky Log" />
        <meta name="apple-mobile-web-app-title" content="Whisky Log" />
        <meta name="msapplication-config" content="/whisky-Log/browserconfig.xml" />
        
        {/* iOS 스플래시 스크린 */}
        <link rel="apple-touch-startup-image" href="/whisky-Log/icons/icon-512x512.png" />
        <link rel="apple-touch-icon" href="/whisky-Log/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/whisky-Log/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/whisky-Log/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/whisky-Log/icons/icon-152x152.png" />
        
        {/* Android 아이콘 */}
        <link rel="icon" type="image/png" sizes="32x32" href="/whisky-Log/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/whisky-Log/icons/icon-16x16.png" />
        <link rel="mask-icon" href="/whisky-Log/icons/safari-pinned-tab.svg" color="#3B82F6" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ 
          width: '100%', 
          height: '100%', 
          margin: 0, 
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          WebkitOverflowScrolling: 'touch',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        <div style={{ 
          width: '100%', 
          height: '100%', 
          margin: 0, 
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          flex: 1
        }}>
          <ErrorBoundary>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ErrorBoundary>
        </div>
        
        {/* Service Worker 등록 */}
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/whisky-Log/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
