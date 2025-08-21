'use client';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface MobileTabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  zIndex?: number;
}

export default function MobileTabNavigation({ 
  tabs, 
  activeTab, 
  onTabChange,
  zIndex = 1000
}: MobileTabNavigationProps) {
  return (
    <div className="mobile-nav-fixed" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#1F2937',
      borderTop: '1px solid #374151',
      padding: '8px 0 6px 0',
      zIndex: zIndex,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingBottom: 'calc(6px + env(safe-area-inset-bottom))', // iOS safe area
      boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
      // 모바일 브라우저 주소창 변화에 대응
      transform: 'translateZ(0)', // 하드웨어 가속
      willChange: 'transform', // 성능 최적화
      // 뷰포트 높이 고정 - 더 강력한 고정
      height: 'calc(52px + env(safe-area-inset-bottom))',
      minHeight: 'calc(52px + env(safe-area-inset-bottom))',
      maxHeight: 'calc(52px + env(safe-area-inset-bottom))',
      maxWidth: '100vw',
      width: '100%',
      // 확대/축소 대응
      transformOrigin: 'bottom center',
      WebkitTransformOrigin: 'bottom center',
    }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px 8px',
            backgroundColor: activeTab === tab.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            color: activeTab === tab.id ? '#3B82F6' : '#9CA3AF',
            fontSize: '10px',
            fontWeight: activeTab === tab.id ? '600' : '400',
            cursor: 'pointer',
            minWidth: '50px',
            transition: 'all 0.2s ease',
            transform: activeTab === tab.id ? 'scale(1.02)' : 'scale(1)',
            position: 'relative',
          }}
        >
          <span style={{ 
            fontSize: '18px', 
            marginBottom: '2px',
            filter: activeTab === tab.id ? 'drop-shadow(0 1px 2px rgba(59, 130, 246, 0.3))' : 'none',
          }}>
            {tab.icon}
          </span>
          <span style={{
            fontSize: '10px',
            lineHeight: '1.1',
            textAlign: 'center',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {tab.label}
          </span>
          {/* 활성 탭 인디케이터 */}
          {activeTab === tab.id && (
            <div style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '3px',
              height: '3px',
              backgroundColor: '#3B82F6',
              borderRadius: '50%',
            }} />
          )}
        </button>
      ))}
    </div>
  );
} 