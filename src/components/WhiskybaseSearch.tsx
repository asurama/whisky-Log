'use client';

import { useState, useEffect } from 'react';
import { useToast } from './Toast';
import LoadingSpinner, { ButtonLoading } from './ui/LoadingSpinner';
import { SearchResultSkeleton } from './ui/SkeletonLoader';

interface WhiskybaseResult {
  id: string;
  name: string;
  brand: string;
  age?: string;
  abv?: string;
  region?: string;
  type?: string;
  rating?: string;
  vintage?: string;
  bottled_year?: string;
  volume_ml?: string;
  cask_number?: string;
  imageUrl?: string;
  url: string;
}

interface WhiskybaseSearchProps {
  onSelectWhisky: (whisky: WhiskybaseResult) => void;
  disabled?: boolean;
  initialSearchTerm?: string;
}

export default function WhiskybaseSearch({ onSelectWhisky, disabled = false, initialSearchTerm = '' }: WhiskybaseSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<WhiskybaseResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [displayResults, setDisplayResults] = useState<WhiskybaseResult[]>([]);
  const [showMore, setShowMore] = useState(false);
  const { showToast } = useToast();

  // 초기 검색어가 변경되면 검색창 업데이트
  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  const searchWhiskybase = async () => {
    if (!searchTerm.trim()) {
      showToast('검색어를 입력해주세요.', 'error');
      return;
    }

    setSearching(true);
    setResults([]);
    setShowResults(true);

    try {
      // 먼저 데이터베이스에서 검색 시도 (디버그 모드 포함)
      let response = await fetch(`/api/whiskybase-db?q=${encodeURIComponent(searchTerm)}&debug=true`);
      let data;
      let source = 'database';
      
      if (!response.ok) {
        console.log('데이터베이스 검색 실패, 기존 API로 폴백');
        // 데이터베이스 검색 실패 시 기존 API로 폴백 (디버그 모드 포함)
        response = await fetch(`/api/whiskybase?q=${encodeURIComponent(searchTerm)}&debug=true`);
        source = 'whiskybase';
      }
      
      if (!response.ok) {
        throw new Error('검색 요청에 실패했습니다.');
      }
      
      data = await response.json();
      const allResults = data.results || [];
      setResults(allResults);
      
      // 디버그 정보 출력
      if (data.debug) {
        console.log('🔍 Whiskybase 검색 디버그 정보:', data.debug);
        console.log('📊 샘플 결과:', data.debug.sampleResults);
        console.log('📈 총 결과 수:', data.debug.totalResults);
        console.log('🔍 검색 소스:', source);
      }
      
      // 모든 결과 표시
      setDisplayResults(allResults);
      setShowMore(false); // 더보기 버튼 제거
      
      // 검색 결과에서 브랜드 정보가 있으면 검색창에 자동 입력
      if (allResults.length > 0 && allResults[0].brand) {
        setSearchTerm(allResults[0].brand);
      }
      
      if (allResults.length === 0) {
        showToast('검색 결과가 없습니다.', 'info');
      } else {
        if (source === 'database') {
          showToast(`✅ 데이터베이스에서 ${allResults.length}개의 결과를 찾았습니다.`, 'success');
        } else {
          const isDummyData = !allResults[0]?.id?.startsWith('wb_');
          if (isDummyData) {
            showToast(`⚠️ Whiskybase 접근이 제한되어 더미 데이터를 제공합니다.`, 'warning');
            showToast(`${allResults.length}개의 샘플 결과를 찾았습니다.`, 'info');
          } else {
            showToast(`✅ Whiskybase에서 ${allResults.length}개의 결과를 찾았습니다.`, 'success');
          }
        }
      }
    } catch (error) {
      console.error('Whiskybase 검색 오류:', error);
      showToast('검색 중 오류가 발생했습니다.', 'error');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectWhisky = (whisky: WhiskybaseResult) => {
    onSelectWhisky(whisky);
    setShowResults(false);
    setSearchTerm(whisky.brand || whisky.name); // 브랜드명 또는 위스키명을 검색창에 입력
    setResults([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchWhiskybase();
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* 검색 입력 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <input
          type="text"
          placeholder="Whiskybase에서 위스키 검색 (접근 제한 시 샘플 데이터 제공)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled || searching}
          className={`
            flex-1 px-3 py-2 border rounded-lg text-sm transition-all duration-200
            ${disabled || searching
              ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
            }
          `}
        />
        <button
          onClick={searchWhiskybase}
          disabled={disabled || searching || !searchTerm.trim()}
          className={`
            px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
            ${searching || disabled || !searchTerm.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 cursor-pointer shadow-md hover:shadow-lg'
            }
            flex items-center gap-2
          `}
        >
          {searching ? (
            <ButtonLoading text="검색중..." />
          ) : (
            <>
              <span className="text-lg">🔍</span>
              검색
            </>
          )}
        </button>
      </div>

      {/* 검색 결과 */}
      {showResults && (
        <div 
          className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-lg z-[1000] shadow-2xl" 
          style={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          {searching ? (
            <div className="p-4">
              <SearchResultSkeleton count={3} />
            </div>
          ) : displayResults.length > 0 ? (
            <>
              {displayResults.map((whisky) => (
                <div
                  key={whisky.id}
                  onClick={() => handleSelectWhisky(whisky)}
                  className="p-4 border-b border-gray-600 cursor-pointer transition-all duration-200 hover:bg-gray-700 active:bg-gray-600"
                >
                  <div className="flex gap-3 items-start">
                    {/* 이미지 */}
                    <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                      🥃
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-white truncate">
                          {whisky.name}
                        </h4>
                        {!whisky.id.startsWith('wb_') && (
                          <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded font-medium">
                            샘플
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-1">
                        {whisky.brand} • {whisky.type}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                        {whisky.vintage && (
                          <span className="bg-gray-700 px-2 py-1 rounded">
                            🍇 {whisky.vintage}년 빈티지
                          </span>
                        )}
                        {whisky.bottled_year && (
                          <span className="bg-gray-700 px-2 py-1 rounded">
                            📅 {whisky.bottled_year}년 병입
                          </span>
                        )}
                        {whisky.age && (
                          <span className="bg-gray-700 px-2 py-1 rounded">
                            ⏰ {whisky.age}년
                          </span>
                        )}
                        {whisky.volume_ml && (
                          <span className="bg-gray-700 px-2 py-1 rounded">
                            🍾 {whisky.volume_ml}ml
                          </span>
                        )}
                        {whisky.cask_number && (
                          <span className="bg-gray-700 px-2 py-1 rounded">
                            🔢 {whisky.cask_number}
                          </span>
                        )}
                        {whisky.abv && (
                          <span className="bg-gray-700 px-2 py-1 rounded">
                            🍾 {whisky.abv}
                          </span>
                        )}
                        {whisky.region && (
                          <span className="bg-gray-700 px-2 py-1 rounded">
                            🏔️ {whisky.region}
                          </span>
                        )}
                        {whisky.rating && (
                          <span className="bg-yellow-600 px-2 py-1 rounded text-yellow-100">
                            ⭐ {whisky.rating}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 선택 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectWhisky(whisky);
                      }}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-xs font-medium rounded transition-colors duration-200"
                    >
                      선택
                    </button>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="p-8 text-center text-gray-400 text-sm">
              {searching ? (
                <div className="flex flex-col items-center gap-2">
                  <LoadingSpinner size="sm" color="secondary" />
                  <span>검색 중...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl">🔍</span>
                  <span>검색 결과가 없습니다.</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 외부 클릭 시 결과 닫기 */}
      {showResults && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 998
          }}
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
} 