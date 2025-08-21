const fs = require('fs');
const path = require('path');

// PWA 아이콘 크기 목록
const ICON_SIZES = [
  16, 32, 72, 96, 128, 144, 152, 192, 384, 512
];

// 필요한 디렉토리 생성
const createDirectories = () => {
  const dirs = ['public/icons', 'public/screenshots'];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ 디렉토리 생성: ${dir}`);
    }
  });
};

// 기본 아이콘 템플릿 생성 (SVG)
const createBaseIcon = () => {
  const svgContent = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1F2937;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- 배경 -->
  <rect width="512" height="512" fill="url(#bg)" rx="80"/>
  
  <!-- 위스키 글래스 -->
  <g transform="translate(156, 156)">
    <!-- 글래스 본체 -->
    <path d="M100 50 L100 200 L80 220 L120 220 L100 200 Z" 
          fill="none" stroke="#FCD34D" stroke-width="8" stroke-linejoin="round"/>
    
    <!-- 글래스 테두리 -->
    <path d="M80 220 L120 220" stroke="#FCD34D" stroke-width="4"/>
    
    <!-- 위스키 액체 -->
    <path d="M90 180 L110 180 L105 200 L95 200 Z" fill="#D97706"/>
    
    <!-- 얼음 -->
    <circle cx="95" cy="160" r="3" fill="#E5E7EB"/>
    <circle cx="105" cy="165" r="2" fill="#E5E7EB"/>
    
    <!-- 증기 -->
    <path d="M95 50 Q100 40 105 50" stroke="#E5E7EB" stroke-width="2" fill="none"/>
    <path d="M98 45 Q103 35 108 45" stroke="#E5E7EB" stroke-width="2" fill="none"/>
  </g>
  
  <!-- 텍스트 -->
  <text x="256" y="420" text-anchor="middle" 
        font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
        fill="white">WL</text>
</svg>`;

  const iconPath = path.join(__dirname, '../public/icons/base-icon.svg');
  fs.writeFileSync(iconPath, svgContent);
  console.log('✅ 기본 아이콘 생성: public/icons/base-icon.svg');
  
  return iconPath;
};

// PNG 아이콘 생성 (실제로는 ImageMagick이나 Sharp 라이브러리 필요)
const generatePNGIcons = () => {
  console.log('📝 PNG 아이콘 생성이 필요합니다.');
  console.log('다음 크기의 아이콘을 생성해주세요:');
  ICON_SIZES.forEach(size => {
    console.log(`  - ${size}x${size}: public/icons/icon-${size}x${size}.png`);
  });
  
  console.log('\n💡 추천 도구:');
  console.log('  - Figma: SVG를 PNG로 내보내기');
  console.log('  - Online Icon Generator: https://realfavicongenerator.net/');
  console.log('  - Sharp (Node.js): npm install sharp');
};

// 스크린샷 템플릿 생성
const createScreenshotTemplates = () => {
  console.log('📱 스크린샷이 필요합니다:');
  console.log('  - public/screenshots/desktop.png (1280x720)');
  console.log('  - public/screenshots/mobile.png (750x1334)');
  
  console.log('\n💡 추천 방법:');
  console.log('  1. 개발 서버 실행: npm run dev');
  console.log('  2. 브라우저에서 스크린샷 촬영');
  console.log('  3. 각각의 크기로 리사이즈');
};

// browserconfig.xml 생성
const createBrowserConfig = () => {
  const browserConfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square150x150logo src="/icons/icon-144x144.png"/>
            <TileColor>#3B82F6</TileColor>
        </tile>
    </msapplication>
</browserconfig>`;

  const configPath = path.join(__dirname, '../public/browserconfig.xml');
  fs.writeFileSync(configPath, browserConfig);
  console.log('✅ browserconfig.xml 생성');
};

// Safari pinned tab SVG 생성
const createSafariPinnedTab = () => {
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
  <path fill="#3B82F6" d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"/>
  <path fill="#3B82F6" d="M8 4c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
</svg>`;

  const svgPath = path.join(__dirname, '../public/icons/safari-pinned-tab.svg');
  fs.writeFileSync(svgPath, svgContent);
  console.log('✅ Safari pinned tab SVG 생성');
};

// 메인 실행 함수
const main = () => {
  console.log('🚀 PWA 자산 생성 시작...\n');
  
  createDirectories();
  createBaseIcon();
  generatePNGIcons();
  createScreenshotTemplates();
  createBrowserConfig();
  createSafariPinnedTab();
  
  console.log('\n✅ PWA 자산 생성 완료!');
  console.log('\n📋 다음 단계:');
  console.log('1. public/icons/base-icon.svg를 PNG로 변환');
  console.log('2. 스크린샷 촬영 및 저장');
  console.log('3. npm run build로 프로덕션 빌드');
  console.log('4. 배포 플랫폼에 업로드');
};

main(); 