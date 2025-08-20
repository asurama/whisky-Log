'use client';

import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'tablet-landscape' | 'desktop';

interface UseDeviceReturn {
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isTabletLandscape: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
}

export const useDevice = (): UseDeviceReturn => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [screenWidth, setScreenWidth] = useState(0);
  const [screenHeight, setScreenHeight] = useState(0);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const updateDeviceType = () => {
      if (typeof window === 'undefined') return;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenWidth(width);
      setScreenHeight(height);
      setOrientation(width > height ? 'landscape' : 'portrait');

      // 실무 표준 breakpoint 적용
      if (width <= 767) {
        setDeviceType('mobile');
      } else if (width >= 768 && width <= 1023) {
        setDeviceType('tablet');
      } else if (width >= 1024 && width <= 1279) {
        setDeviceType('tablet-landscape');
      } else {
        setDeviceType('desktop');
      }
    };

    // 초기 설정
    updateDeviceType();

    // 리사이즈 이벤트 리스너
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateDeviceType);

      // 클린업
      return () => window.removeEventListener('resize', updateDeviceType);
    }
  }, []);

  return {
    deviceType,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isTabletLandscape: deviceType === 'tablet-landscape',
    isDesktop: deviceType === 'desktop',
    screenWidth,
    screenHeight,
    orientation,
  };
}; 