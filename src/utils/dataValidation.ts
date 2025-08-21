/**
 * 데이터 검증 유틸리티 함수들
 */

/**
 * 문자열을 안전하게 숫자로 변환
 * @param value - 변환할 값
 * @returns 숫자 또는 null
 */
export function safeParseInt(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return isNaN(value) ? null : value;
  if (typeof value === 'string') {
    if (value.trim() === '') return null;
    const parsed = parseInt(value.trim());
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

/**
 * 문자열을 안전하게 실수로 변환
 * @param value - 변환할 값
 * @returns 실수 또는 null
 */
export function safeParseFloat(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return isNaN(value) ? null : value;
  if (typeof value === 'string') {
    if (value.trim() === '') return null;
    const parsed = parseFloat(value.trim());
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

/**
 * 문자열을 안전하게 정리
 * @param value - 정리할 값
 * @returns 정리된 문자열 또는 null
 */
export function safeString(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'string') {
    if (value.trim() === '') return null;
    return value.trim();
  }
  return null;
}

/**
 * 위스키 데이터 검증
 * @param data - 검증할 위스키 데이터
 * @returns 검증된 데이터
 */
export function validateWhiskyData(data: any) {
  return {
    ...data,
    // brand_id는 UUID이므로 그대로 유지 (null 또는 유효한 UUID)
    brand_id: data.brand_id,
    vintage: safeParseInt(data.vintage),
    age_years: safeParseInt(data.age_years),
    retail_price: safeParseFloat(data.retail_price),
    purchase_price: safeParseFloat(data.purchase_price),
    discount_rate: safeParseFloat(data.discount_rate),
    total_volume_ml: safeParseFloat(data.total_volume_ml),
    remaining_volume_ml: safeParseFloat(data.remaining_volume_ml),
    abv: safeParseFloat(data.abv),
    purchase_location: safeString(data.purchase_location),
    purchase_date: safeString(data.purchase_date),
    notes: safeString(data.notes),
    custom_brand: safeString(data.custom_brand),
  };
} 