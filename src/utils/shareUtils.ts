/**
 * 시음 기록 공유 유틸리티 함수들
 */

export interface ShareData {
  title: string;
  text: string;
  url?: string;
  imageUrl?: string;
}

/**
 * 시음 기록을 공유 텍스트로 변환
 */
export function formatTastingForShare(tasting: any): ShareData {
  const whiskyName = tasting.bottles?.name || tasting.bottle_name || '바/모임 시음';
  const brand = tasting.bottles?.brands?.name || tasting.bottles?.custom_brand || tasting.bottle_brand || '';
  const date = new Date(tasting.tasting_date).toLocaleDateString('ko-KR');
  const type = tasting.tasting_type === 'bar' ? '바' : 
               tasting.tasting_type === 'meeting' ? '모임' : '보틀';
  
  let text = `🥃 ${whiskyName}`;
  if (brand) {
    text += ` (${brand})`;
  }
  text += `\n📅 ${date}`;
  text += `\n📍 ${type}에서 시음`;
  
  if (tasting.location) {
    text += `\n🏠 ${tasting.location}`;
  }
  
  if (tasting.overall_rating) {
    text += `\n⭐ 종합 평점: ${tasting.overall_rating}/10`;
  }
  
  if (tasting.nose_rating || tasting.palate_rating || tasting.finish_rating) {
    text += '\n📊 세부 평점:';
    if (tasting.nose_rating) text += ` 노즈(${tasting.nose_rating})`;
    if (tasting.palate_rating) text += ` 팔레트(${tasting.palate_rating})`;
    if (tasting.finish_rating) text += ` 피니시(${tasting.finish_rating})`;
  }
  
  if (tasting.nose_notes || tasting.palate_notes || tasting.finish_notes || tasting.additional_notes) {
    text += '\n📝 시음 노트:';
    if (tasting.nose_notes) text += `\n  노즈: ${tasting.nose_notes}`;
    if (tasting.palate_notes) text += `\n  팔레트: ${tasting.palate_notes}`;
    if (tasting.finish_notes) text += `\n  피니시: ${tasting.finish_notes}`;
    if (tasting.additional_notes) text += `\n  추가: ${tasting.additional_notes}`;
  }
  
  text += '\n\n#위스키 #시음기록 #위스키로그';
  
  return {
    title: `${whiskyName} 시음 기록`,
    text: text,
    imageUrl: tasting.image_url
  };
}

/**
 * 네이티브 공유 API 사용 (모바일)
 */
export async function shareNative(data: ShareData): Promise<boolean> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url
      });
      return true;
    } catch (error) {
      console.log('공유가 취소되었습니다:', error);
      return false;
    }
  }
  return false;
}

/**
 * 카카오톡 공유 (실용적인 방법)
 */
export function shareToKakaoTalk(data: ShareData): void {
  const text = encodeURIComponent(data.text);
  
  // 방법 1: 카카오톡 채팅 공유 (가장 확실한 방법)
  const chatUrl = `https://accounts.kakao.com/login/?continue=https://center-pf.kakao.com/_mxfDd/chat`;
  
  // 방법 2: 카카오스토리 공유
  const storyUrl = `https://story.kakao.com/share?text=${text}`;
  
  // 방법 3: 카카오톡 공유 (모바일에서 더 잘 작동)
  const mobileUrl = `https://story.kakao.com/share?text=${text}`;
  
  // 브라우저 환경에 따라 다른 URL 사용
  const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // 모바일에서는 카카오스토리 공유 시도
    console.log('모바일 카카오톡 공유 시도');
    window.open(mobileUrl, '_blank');
  } else {
    // 데스크톱에서는 카카오톡 채팅 공유 시도
    console.log('데스크톱 카카오톡 공유 시도');
    const newWindow = window.open(chatUrl, '_blank', 'width=600,height=400');
    if (!newWindow) {
      // 팝업이 차단된 경우 현재 창에서 열기
      window.location.href = chatUrl;
    }
  }
  
  // 사용자에게 안내 메시지 표시
  setTimeout(() => {
    alert('카카오톡 공유가 열렸습니다.\n만약 공유가 안된다면:\n1. 클립보드 복사를 사용하세요\n2. 수동으로 카카오톡에 붙여넣기 하세요');
  }, 1000);
  
  console.log('카카오톡 공유 시도:', { text: data.text, isMobile });
}

/**
 * 카카오톡 채팅 공유 (더 간단한 방법)
 */
export function shareToKakaoChat(data: ShareData): void {
  const text = encodeURIComponent(data.text);
  // 카카오톡 채팅 공유 URL
  const url = `https://accounts.kakao.com/login/?continue=https://center-pf.kakao.com/_mxfDd/chat`;
  window.open(url, '_blank', 'width=600,height=400');
}

/**
 * 텔레그램 공유
 */
export function shareToTelegram(data: ShareData): void {
  const text = encodeURIComponent(data.text);
  const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${text}`;
  window.open(url, '_blank', 'width=600,height=400');
}

/**
 * 트위터/X 공유
 */
export function shareToTwitter(data: ShareData): void {
  const text = encodeURIComponent(data.text);
  const url = `https://twitter.com/intent/tweet?text=${text}`;
  window.open(url, '_blank', 'width=600,height=400');
}

/**
 * 페이스북 공유
 */
export function shareToFacebook(data: ShareData): void {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(data.text);
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
  window.open(shareUrl, '_blank', 'width=600,height=400');
}

/**
 * 클립보드에 복사 (개선된 버전)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // 최신 브라우저: navigator.clipboard API 사용
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof window !== 'undefined' && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      console.log('클립보드 복사 성공 (최신 API)');
      return true;
    } else {
      // 폴백: 구형 브라우저 지원
      console.log('구형 브라우저 방식으로 클립보드 복사 시도');
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        console.log('클립보드 복사 성공 (구형 API)');
        return true;
      } else {
        console.error('클립보드 복사 실패 (구형 API)');
        return false;
      }
    }
  } catch (error) {
    console.error('클립보드 복사 오류:', error);
    return false;
  }
}

/**
 * 공유 옵션 표시 (개선된 버전)
 */
export function showShareOptions(data: ShareData): void {
  console.log('공유 옵션 표시:', data);
  
  // 모바일에서는 네이티브 공유 먼저 시도
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    console.log('네이티브 공유 API 사용');
    shareNative(data);
    return;
  }
  
  // 데스크톱에서는 공유 옵션 모달 표시
  console.log('공유 모달 표시');
  showShareModal(data);
}

/**
 * 공유 모달 표시 (데스크톱용, 개선된 버전)
 */
function showShareModal(data: ShareData): void {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;
  
  const content = document.createElement('div');
  content.style.cssText = `
    background: #1F2937;
    border-radius: 12px;
    padding: 24px;
    max-width: 400px;
    width: 90%;
    color: white;
  `;
  
  content.innerHTML = `
    <h3 style="margin: 0 0 20px 0; font-size: 18px;">공유하기</h3>
    <div style="display: grid; gap: 12px;">
      <button id="kakaoTalkBtn" style="
        padding: 12px;
        background: #FEE500;
        color: #000;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
      ">💬 카카오톡 (클립보드 복사 후 붙여넣기)</button>
      
      <button id="telegramBtn" style="
        padding: 12px;
        background: #0088CC;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
      ">📱 텔레그램</button>
      
      <button id="twitterBtn" style="
        padding: 12px;
        background: #1DA1F2;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
      ">🐦 트위터/X</button>
      
      <button id="facebookBtn" style="
        padding: 12px;
        background: #1877F2;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
      ">📘 페이스북</button>
      
      <button id="clipboardBtn" style="
        padding: 12px;
        background: #374151;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
      ">📋 클립보드 복사 (추천)</button>
    </div>
    
    <div style="
      margin-top: 16px;
      padding: 12px;
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 8px;
      font-size: 12px;
      color: #60a5fa;
    ">
      💡 <strong>카카오톡 공유 팁:</strong><br>
      • 클립보드 복사를 먼저 사용하세요<br>
      • 복사된 텍스트를 카카오톡에 붙여넣기 하세요<br>
      • 더 안정적이고 빠릅니다!
    </div>
    
    <button id="closeBtn" style="
      margin-top: 20px;
      width: 100%;
      padding: 12px;
      background: #6B7280;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    ">닫기</button>
  `;
  
  modal.className = 'share-modal';
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  // 이벤트 리스너 등록
  const shareText = `${data.title}\n\n${data.text}`;
  
  document.getElementById('kakaoTalkBtn')?.addEventListener('click', () => {
    console.log('카카오톡 공유 클릭');
    
    // 먼저 클립보드에 복사
    copyToClipboard(shareText).then(success => {
      if (success) {
        alert('✅ 클립보드에 복사되었습니다!\n\n📱 카카오톡 사용법:\n1. 카카오톡 앱을 열어주세요\n2. 원하는 채팅방을 선택하세요\n3. Ctrl+V (또는 붙여넣기)를 눌러주세요\n4. 시음 기록이 공유됩니다!');
      } else {
        alert('❌ 클립보드 복사에 실패했습니다.\n\n📋 수동 복사 방법:\n1. 아래 텍스트를 선택하세요\n2. Ctrl+C로 복사하세요\n3. 카카오톡에 붙여넣기 하세요');
        prompt('복사할 텍스트:', shareText);
      }
    });
    
    // 카카오톡 공유도 시도 (백업)
    shareToKakaoTalk(data);
    modal.remove();
  });
  
  document.getElementById('telegramBtn')?.addEventListener('click', () => {
    console.log('텔레그램 공유 클릭');
    shareToTelegram(data);
    modal.remove();
  });
  
  document.getElementById('twitterBtn')?.addEventListener('click', () => {
    console.log('트위터 공유 클릭');
    shareToTwitter(data);
    modal.remove();
  });
  
  document.getElementById('facebookBtn')?.addEventListener('click', () => {
    console.log('페이스북 공유 클릭');
    shareToFacebook(data);
    modal.remove();
  });
  
  document.getElementById('clipboardBtn')?.addEventListener('click', async () => {
    console.log('클립보드 복사 클릭');
    const success = await copyToClipboard(shareText);
    if (success) {
      alert('클립보드에 복사되었습니다!');
    } else {
      alert('클립보드 복사에 실패했습니다. 수동으로 복사해주세요.');
      // 수동 복사를 위한 텍스트 표시
      const manualCopyText = prompt('다음 텍스트를 복사해주세요:', shareText);
    }
    modal.remove();
  });
  
  document.getElementById('closeBtn')?.addEventListener('click', () => {
    modal.remove();
  });
  
  // 모달 외부 클릭 시 닫기
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
} 