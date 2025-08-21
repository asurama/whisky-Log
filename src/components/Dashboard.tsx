'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface DashboardProps {
  user: any
}

export default function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('bottles')

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (!error) {
        // 로컬 스토리지와 세션 스토리지 정리
        localStorage.clear();
        sessionStorage.clear();
        // 페이지 새로고침으로 완전한 로그아웃
        window.location.reload();
      } else {
        console.error('로그아웃 오류:', error);
        alert('로그아웃 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('로그아웃 오류:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  }

  return (
    <div 
      className="w-full h-full bg-base-100 overflow-hidden flex flex-col" 
      data-theme="whisky" 
      style={{ 
        width: '100%', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 헤더 */}
      <div 
        className="w-full navbar bg-base-200/50 backdrop-blur-md border-b border-base-300" 
        style={{ width: '100%' }}
      >
        <div className="navbar-start">
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-lg w-12">
                <span className="text-2xl">🥃</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold">Whisky Log</h1>
          </div>
        </div>
        <div className="navbar-end">
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-70">{user.email}</span>
            <button 
              onClick={handleLogout}
              className="btn btn-error btn-sm"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* 네비게이션 */}
      <div 
        className="w-full tabs tabs-boxed bg-base-200/30 backdrop-blur-md justify-center p-4" 
        style={{ width: '100%' }}
      >
        {[
          { id: 'bottles', label: '구매목록', icon: '🛒' },
          { id: 'tastings', label: '시음목록', icon: '🍷' },
          { id: 'brands', label: '브랜드', icon: '🏷️' },
          { id: 'statistics', label: '통계', icon: '📊' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 메인 콘텐츠 */}
      <div 
        className="w-full h-full p-6 flex-1" 
        style={{ 
          width: '100%', 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          flex: 1
        }}
      >
        <div 
          className="w-full h-full card bg-base-200/50 backdrop-blur-md shadow-xl" 
          style={{ 
            width: '100%', 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            flex: 1
          }}
        >
          <div 
            className="card-body w-full h-full flex-1" 
            style={{ 
              width: '100%', 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              flex: 1
            }}
          >
            {activeTab === 'bottles' && (
              <div 
                className="w-full h-full space-y-6 flex-1" 
                style={{ 
                  width: '100%', 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <h2 className="card-title text-2xl">구매목록</h2>
                  <button className="btn btn-primary">
                    <span className="mr-2">+</span>
                    새 위스키 추가
                  </button>
                </div>
                <div 
                  className="w-full h-full hero bg-base-100 rounded-box flex-1 flex items-center justify-center" 
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div 
                    className="hero-content text-center w-full h-full flex items-center justify-center" 
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div className="max-w-md">
                      <div className="text-6xl mb-4">🥃</div>
                      <h3 className="text-xl font-semibold mb-2">아직 구매한 위스키가 없습니다</h3>
                      <p className="opacity-70">첫 번째 위스키를 추가해보세요!</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'tastings' && (
              <div 
                className="w-full h-full space-y-6 flex-1" 
                style={{ 
                  width: '100%', 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <h2 className="card-title text-2xl">시음목록</h2>
                  <button className="btn btn-primary">
                    <span className="mr-2">+</span>
                    새 시음 기록
                  </button>
                </div>
                <div 
                  className="w-full h-full hero bg-base-100 rounded-box flex-1 flex items-center justify-center" 
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div 
                    className="hero-content text-center w-full h-full flex items-center justify-center" 
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div className="max-w-md">
                      <div className="text-6xl mb-4">🍷</div>
                      <h3 className="text-xl font-semibold mb-2">아직 시음 기록이 없습니다</h3>
                      <p className="opacity-70">첫 번째 시음 기록을 추가해보세요!</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'brands' && (
              <div 
                className="w-full h-full space-y-6 flex-1" 
                style={{ 
                  width: '100%', 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <h2 className="card-title text-2xl">브랜드</h2>
                  <button className="btn btn-primary">
                    <span className="mr-2">+</span>
                    새 브랜드 추가
                  </button>
                </div>
                <div 
                  className="w-full h-full hero bg-base-100 rounded-box flex-1 flex items-center justify-center" 
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div 
                    className="hero-content text-center w-full h-full flex items-center justify-center" 
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div className="max-w-md">
                      <div className="text-6xl mb-4">🏷️</div>
                      <h3 className="text-xl font-semibold mb-2">아직 브랜드가 없습니다</h3>
                      <p className="opacity-70">첫 번째 브랜드를 추가해보세요!</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'statistics' && (
              <div 
                className="w-full h-full space-y-6 flex-1" 
                style={{ 
                  width: '100%', 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1
                }}
              >
                <h2 className="card-title text-2xl">통계</h2>
                <div className="stats stats-vertical lg:stats-horizontal shadow">
                  <div className="stat">
                    <div className="stat-figure text-primary text-4xl">📦</div>
                    <div className="stat-title">총 구매</div>
                    <div className="stat-value text-primary">0</div>
                    <div className="stat-desc">병</div>
                  </div>
                  <div className="stat">
                    <div className="stat-figure text-secondary text-4xl">🍷</div>
                    <div className="stat-title">총 시음</div>
                    <div className="stat-value text-secondary">0</div>
                    <div className="stat-desc">회</div>
                  </div>
                  <div className="stat">
                    <div className="stat-figure text-accent text-4xl">💰</div>
                    <div className="stat-title">총 지출</div>
                    <div className="stat-value text-accent">₩0</div>
                    <div className="stat-desc">원</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 