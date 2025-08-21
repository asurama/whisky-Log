'use client';

import { useDevice } from '@/hooks/useDevice';

export default function DeviceInfo() {
  const { deviceType, isMobile, isTablet, isDesktop, screenWidth, screenHeight } = useDevice();

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      zIndex: 9999,
      fontFamily: 'monospace',
    }}>
      <div>📱 {deviceType.toUpperCase()}</div>
      <div>📏 {screenWidth} x {screenHeight}</div>
      <div>
        {isMobile && '📱 Mobile'}
        {isTablet && '📱 Tablet'}
        {isDesktop && '💻 Desktop'}
      </div>
    </div>
  );
} 