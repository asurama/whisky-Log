'use client';

import { useState, useEffect } from 'react';
import { useDevice } from '@/hooks/useDevice';
import { AccessibilityManager } from '@/utils/accessibility';

export default function AccessibilitySettings() {
  const { isMobile } = useDevice();
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    highContrast: false,
    reducedMotion: false,
    fontSize: 'medium' as 'small' | 'medium' | 'large',
    screenReader: false
  });

  const accessibilityManager = AccessibilityManager.getInstance();

  useEffect(() => {
    setSettings(accessibilityManager.getSettings());
  }, []);

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    accessibilityManager.updateSetting(key, value);
  };

  return (
    <>
      {/* 접근성 설정 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: isMobile ? '140px' : '80px',
          right: '20px',
          backgroundColor: '#3B82F6',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
        }}
        aria-label="접근성 설정"
        title="접근성 설정"
      >
        ♿
      </button>

      {/* 접근성 설정 패널 */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#1F2937',
          border: '1px solid #374151',
          borderRadius: '12px',
          padding: isMobile ? '20px' : '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          width: isMobile ? '90vw' : '400px',
          maxWidth: '400px',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          {/* 헤더 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: '600',
              color: 'white'
            }}>
              ♿ 접근성 설정
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#9CA3AF',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#9CA3AF';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label="설정 닫기"
            >
              ×
            </button>
          </div>

          {/* 설정 옵션들 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 고대비 모드 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div>
                <div style={{
                  fontSize: isMobile ? '14px' : '16px',
                  fontWeight: '500',
                  color: 'white',
                  marginBottom: '4px'
                }}>
                  고대비 모드
                </div>
                <div style={{
                  fontSize: isMobile ? '12px' : '13px',
                  color: '#9CA3AF'
                }}>
                  텍스트와 배경의 대비를 높여 가독성을 개선합니다
                </div>
              </div>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '48px',
                height: '24px'
              }}>
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
                  style={{
                    opacity: 0,
                    width: 0,
                    height: 0
                  }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: settings.highContrast ? '#3B82F6' : '#4B5563',
                  borderRadius: '24px',
                  transition: '0.3s'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '18px',
                    width: '18px',
                    left: '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: '0.3s',
                    transform: settings.highContrast ? 'translateX(24px)' : 'translateX(0)'
                  }} />
                </span>
              </label>
            </div>

            {/* 모션 감소 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div>
                <div style={{
                  fontSize: isMobile ? '14px' : '16px',
                  fontWeight: '500',
                  color: 'white',
                  marginBottom: '4px'
                }}>
                  모션 감소
                </div>
                <div style={{
                  fontSize: isMobile ? '12px' : '13px',
                  color: '#9CA3AF'
                }}>
                  애니메이션과 전환 효과를 줄여 움직임에 민감한 사용자를 돕습니다
                </div>
              </div>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '48px',
                height: '24px'
              }}>
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={(e) => handleSettingChange('reducedMotion', e.target.checked)}
                  style={{
                    opacity: 0,
                    width: 0,
                    height: 0
                  }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: settings.reducedMotion ? '#3B82F6' : '#4B5563',
                  borderRadius: '24px',
                  transition: '0.3s'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '18px',
                    width: '18px',
                    left: '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: '0.3s',
                    transform: settings.reducedMotion ? 'translateX(24px)' : 'translateX(0)'
                  }} />
                </span>
              </label>
            </div>

            {/* 폰트 크기 */}
            <div style={{
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: '500',
                color: 'white',
                marginBottom: '8px'
              }}>
                폰트 크기
              </div>
              <div style={{
                fontSize: isMobile ? '12px' : '13px',
                color: '#9CA3AF',
                marginBottom: '12px'
              }}>
                텍스트 크기를 조정하여 가독성을 개선합니다
              </div>
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSettingChange('fontSize', size)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: settings.fontSize === size ? '#3B82F6' : 'transparent',
                      color: settings.fontSize === size ? 'white' : '#9CA3AF',
                      border: `1px solid ${settings.fontSize === size ? '#3B82F6' : '#4B5563'}`,
                      borderRadius: '6px',
                      fontSize: isMobile ? '12px' : '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (settings.fontSize !== size) {
                        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                        e.currentTarget.style.color = 'white';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (settings.fontSize !== size) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#9CA3AF';
                      }
                    }}
                  >
                    {size === 'small' ? '작게' : size === 'medium' ? '보통' : '크게'}
                  </button>
                ))}
              </div>
            </div>

            {/* 스크린 리더 지원 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div>
                <div style={{
                  fontSize: isMobile ? '14px' : '16px',
                  fontWeight: '500',
                  color: 'white',
                  marginBottom: '4px'
                }}>
                  스크린 리더 지원
                </div>
                <div style={{
                  fontSize: isMobile ? '12px' : '13px',
                  color: '#9CA3AF'
                }}>
                  스크린 리더 사용자를 위한 추가 정보를 제공합니다
                </div>
              </div>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '48px',
                height: '24px'
              }}>
                <input
                  type="checkbox"
                  checked={settings.screenReader}
                  onChange={(e) => handleSettingChange('screenReader', e.target.checked)}
                  style={{
                    opacity: 0,
                    width: 0,
                    height: 0
                  }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: settings.screenReader ? '#3B82F6' : '#4B5563',
                  borderRadius: '24px',
                  transition: '0.3s'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '18px',
                    width: '18px',
                    left: '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: '0.3s',
                    transform: settings.screenReader ? 'translateX(24px)' : 'translateX(0)'
                  }} />
                </span>
              </label>
            </div>
          </div>

          {/* 도움말 */}
          <div style={{
            marginTop: '20px',
            padding: '12px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <div style={{
              fontSize: isMobile ? '12px' : '13px',
              color: '#93C5FD',
              lineHeight: '1.5'
            }}>
              💡 <strong>접근성 팁:</strong> 키보드로 Tab 키를 사용하여 모든 요소에 접근할 수 있습니다. 
              스크린 리더 사용자는 화면의 모든 정보를 음성으로 들을 수 있습니다.
            </div>
          </div>
        </div>
      )}

      {/* 배경 오버레이 */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
        />
      )}
    </>
  );
} 