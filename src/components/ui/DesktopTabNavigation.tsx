'use client';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface DesktopTabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function DesktopTabNavigation({ 
  tabs, 
  activeTab, 
  onTabChange 
}: DesktopTabNavigationProps) {
  return (
    <div style={{
      display: 'flex',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: '#1F2937',
      padding: '0 20px',
    }}>
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '0',
        overflowX: 'auto',
        padding: '10px 0'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              backgroundColor: activeTab === tab.id ? '#3B82F6' : '#374151',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? '600' : '400',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              minWidth: 'fit-content',
            }}
          >
            <span style={{ fontSize: '16px' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 