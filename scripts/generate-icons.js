const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 아이콘 크기 목록
const ICON_SIZES = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

// 고래 아이콘 SVG 생성
const createWhaleIconSVG = () => {
  return `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1F2937;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="whale" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#60A5FA;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="water" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0EA5E9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0369A1;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- 배경 -->
  <rect width="512" height="512" fill="url(#bg)" rx="80"/>
  
  <!-- 물결 배경 -->
  <g opacity="0.3">
    <path d="M0 400 Q128 380 256 400 T512 400 L512 512 L0 512 Z" fill="url(#water)"/>
    <path d="M0 420 Q128 400 256 420 T512 420 L512 512 L0 512 Z" fill="url(#water)" opacity="0.7"/>
  </g>
  
  <!-- 고래 -->
  <g transform="translate(100, 200)">
    <!-- 고래 몸체 -->
    <ellipse cx="150" cy="80" rx="120" ry="60" fill="url(#whale)"/>
    
    <!-- 고래 꼬리 -->
    <path d="M50 80 Q20 60 10 80 Q20 100 50 80" fill="url(#whale)"/>
    
    <!-- 고래 지느러미 -->
    <path d="M120 60 Q140 40 150 60 Q140 80 120 60" fill="url(#whale)"/>
    
    <!-- 고래 눈 -->
    <circle cx="180" cy="70" r="4" fill="white"/>
    <circle cx="180" cy="70" r="2" fill="#1F2937"/>
    
    <!-- 고래 분수 -->
    <path d="M200 50 Q210 30 220 50" stroke="#E5E7EB" stroke-width="3" fill="none"/>
    <path d="M205 45 Q215 25 225 45" stroke="#E5E7EB" stroke-width="2" fill="none"/>
    <path d="M210 40 Q220 20 230 40" stroke="#E5E7EB" stroke-width="2" fill="none"/>
  </g>
  
  <!-- 텍스트 -->
  <text x="256" y="420" text-anchor="middle" 
        font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
        fill="white">Water of Life Log</text>
</svg>`;
};

// 샘플 이미지로부터 아이콘 생성 함수
const generateIconsFromImage = async (imagePath) => {
  try {
    console.log('🐋 샘플 이미지로부터 아이콘 생성 시작...');
    
    // icons 디렉토리 생성
    const iconsDir = path.join(__dirname, '../public/icons');
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
      console.log('✅ icons 디렉토리 생성');
    }
    
    // 샘플 이미지 확인
    if (!fs.existsSync(imagePath)) {
      throw new Error(`이미지 파일을 찾을 수 없습니다: ${imagePath}`);
    }
    
    // 각 크기별 PNG 생성
    for (const size of ICON_SIZES) {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      
      await sharp(imagePath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 31, g: 41, b: 55, alpha: 1 } // 배경색
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ ${size}x${size} 아이콘 생성`);
    }
    
    // maskable 아이콘 생성 (안전 영역 포함)
    const maskableSizes = [192, 512];
    for (const size of maskableSizes) {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}-maskable.png`);
      
      // 안전 영역을 포함한 더 큰 캔버스
      const safeArea = Math.round(size * 0.1); // 10% 안전 영역
      const contentSize = size - (safeArea * 2);
      
      await sharp(imagePath)
        .resize(contentSize, contentSize, {
          fit: 'contain',
          background: { r: 31, g: 41, b: 55, alpha: 1 }
        })
        .extend({
          top: safeArea,
          bottom: safeArea,
          left: safeArea,
          right: safeArea,
          background: { r: 31, g: 41, b: 55, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ ${size}x${size} maskable 아이콘 생성`);
    }
    
    console.log('\n🎉 샘플 이미지로부터 모든 아이콘 생성 완료!');
    
  } catch (error) {
    console.error('❌ 아이콘 생성 실패:', error);
  }
};

// 기본 고래 아이콘 생성 함수
const generateWhaleIcons = async () => {
  try {
    console.log('🐋 고래 아이콘 생성 시작...');
    
    // icons 디렉토리 생성
    const iconsDir = path.join(__dirname, '../public/icons');
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
      console.log('✅ icons 디렉토리 생성');
    }
    
    // 기본 SVG 생성
    const svgContent = createWhaleIconSVG();
    const svgPath = path.join(iconsDir, 'whale-icon.svg');
    fs.writeFileSync(svgPath, svgContent);
    console.log('✅ 기본 고래 SVG 아이콘 생성');
    
    // 각 크기별 PNG 생성
    for (const size of ICON_SIZES) {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      
      await sharp(Buffer.from(svgContent))
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ ${size}x${size} 아이콘 생성`);
    }
    
    // maskable 아이콘 생성 (안전 영역 포함)
    const maskableSizes = [192, 512];
    for (const size of maskableSizes) {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}-maskable.png`);
      
      // 안전 영역을 포함한 더 큰 캔버스
      const safeArea = Math.round(size * 0.1); // 10% 안전 영역
      const contentSize = size - (safeArea * 2);
      
      await sharp(Buffer.from(svgContent))
        .resize(contentSize, contentSize)
        .extend({
          top: safeArea,
          bottom: safeArea,
          left: safeArea,
          right: safeArea,
          background: { r: 31, g: 41, b: 55, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ ${size}x${size} maskable 아이콘 생성`);
    }
    
    console.log('\n🎉 모든 고래 아이콘 생성 완료!');
    console.log('\n📁 생성된 파일들:');
    console.log('- public/icons/whale-icon.svg');
    ICON_SIZES.forEach(size => {
      console.log(`- public/icons/icon-${size}x${size}.png`);
    });
    maskableSizes.forEach(size => {
      console.log(`- public/icons/icon-${size}x${size}-maskable.png`);
    });
    
  } catch (error) {
    console.error('❌ 아이콘 생성 실패:', error);
  }
};

// 메인 실행 함수
const main = () => {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // 샘플 이미지 경로가 제공된 경우
    const imagePath = args[0];
    console.log(`🖼️ 샘플 이미지 사용: ${imagePath}`);
    generateIconsFromImage(imagePath);
  } else {
    // 기본 고래 아이콘 생성
    console.log('🐋 기본 고래 아이콘 생성');
    generateWhaleIcons();
  }
};

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { generateWhaleIcons, generateIconsFromImage }; 