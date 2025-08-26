'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface TastingHistoryProps {
  user: any;
  bottle: any;
  onClose: () => void;
}

export default function TastingHistory({ user, bottle, onClose }: TastingHistoryProps) {
  const [tastings, setTastings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTastings();
  }, [bottle?.id, user?.id]);

  const fetchTastings = async () => {
    try {
      setLoading(true);
      if (!bottle?.id) {
        setTastings([]);
        return;
      }
      
      if (!user?.id) {
        setTastings([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('tastings')
        .select('*')
        .eq('user_id', user.id)
        .eq('bottle_id', bottle.id)
        .order('tasting_date', { ascending: false });
      
      if (error) throw error;
      setTastings((data as unknown as any[]) || []);
    } catch (error) {
      console.error('시음 기록 로딩 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 9) return '#10B981'; // 초록색
    if (rating >= 7) return '#3B82F6'; // 파란색
    if (rating >= 5) return '#F59E0B'; // 주황색
    return '#EF4444'; // 빨간색
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%'
      }}>
        <div style={{
          backgroundColor: '#1F2937',
          borderRadius: '12px',
          padding: '24px',
          width: '90%',
          maxWidth: '600px'
        }}>
          <p>시음 기록 로딩중...</p>
        </div>
      </div>
    );
  }

  return (
          <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%'
      }}>
      <div style={{
        backgroundColor: '#1F2937',
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2>시음 기록</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9CA3AF',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#374151', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{bottle.name}</h3>
          <p style={{ margin: '0', color: '#9CA3AF', fontSize: '14px' }}>
            {bottle.brands?.name || bottle.custom_brand}
          </p>
        </div>

        {tastings.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#9CA3AF'
          }}>
            <p>아직 시음 기록이 없습니다.</p>
            <p>첫 번째 시음을 기록해보세요!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {tastings.map((tasting, index) => (
              <div
                key={tasting.id}
                style={{
                  backgroundColor: '#111827',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid #374151'
                }}
              >
                {/* 헤더 */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
                      {formatDate(tasting.tasting_date)}
                    </h4>
                    {tasting.location && (
                      <p style={{ margin: '0', fontSize: '12px', color: '#9CA3AF' }}>
                        📍 {tasting.location}
                      </p>
                    )}
                  </div>
                  {tasting.overall_rating && (
                    <div style={{
                      backgroundColor: getRatingColor(tasting.overall_rating),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {tasting.overall_rating}/10
                    </div>
                  )}
                </div>

                {/* 평가 점수 */}
                {(tasting.nose_rating || tasting.palate_rating || tasting.finish_rating) && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {tasting.nose_rating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Nose:</span>
                          <span style={{
                            backgroundColor: getRatingColor(tasting.nose_rating),
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '11px'
                          }}>
                            {tasting.nose_rating}
                          </span>
                        </div>
                      )}
                      {tasting.palate_rating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Palate:</span>
                          <span style={{
                            backgroundColor: getRatingColor(tasting.palate_rating),
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '11px'
                          }}>
                            {tasting.palate_rating}
                          </span>
                        </div>
                      )}
                      {tasting.finish_rating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Finish:</span>
                          <span style={{
                            backgroundColor: getRatingColor(tasting.finish_rating),
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '11px'
                          }}>
                            {tasting.finish_rating}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 노트 */}
                {(tasting.nose_notes || tasting.palate_notes || tasting.finish_notes) && (
                  <div style={{ marginBottom: '12px' }}>
                    {tasting.nose_notes && (
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 'bold' }}>Nose:</span>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', lineHeight: '1.4' }}>
                          {tasting.nose_notes}
                        </p>
                      </div>
                    )}
                    {tasting.palate_notes && (
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 'bold' }}>Palate:</span>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', lineHeight: '1.4' }}>
                          {tasting.palate_notes}
                        </p>
                      </div>
                    )}
                    {tasting.finish_notes && (
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 'bold' }}>Finish:</span>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', lineHeight: '1.4' }}>
                          {tasting.finish_notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 추가 정보 */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: '#9CA3AF' }}>
                  {tasting.consumed_volume_ml && (
                    <span>🍷 {tasting.consumed_volume_ml}ml</span>
                  )}
                  {tasting.companions && (
                    <span>👥 {tasting.companions}</span>
                  )}
                </div>

                {/* 추가 노트 */}
                {tasting.additional_notes && (
                  <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#374151', borderRadius: '4px' }}>
                    <p style={{ margin: '0', fontSize: '12px', lineHeight: '1.4' }}>
                      {tasting.additional_notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 