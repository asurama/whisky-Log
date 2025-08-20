import { BottleFormData, TastingFormData } from '@/types';
import { createValidationError } from './errorHandler';
import { useState } from 'react';

// 검증 규칙 타입
export interface ValidationRule<T> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => boolean | string;
}

// 검증 결과 타입
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// 문자열 검증 함수
export function validateString(
  value: string,
  fieldName: string,
  rules: ValidationRule<string>
): string | null {
  // 필수 검증
  if (rules.required && (!value || value.trim().length === 0)) {
    return `${fieldName}은(는) 필수 항목입니다.`;
  }

  if (!value || value.trim().length === 0) {
    return null; // 빈 값이 허용되는 경우
  }

  // 길이 검증
  if (rules.minLength && value.length < rules.minLength) {
    return `${fieldName}은(는) 최소 ${rules.minLength}자 이상이어야 합니다.`;
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return `${fieldName}은(는) 최대 ${rules.maxLength}자까지 입력 가능합니다.`;
  }

  // 패턴 검증
  if (rules.pattern && !rules.pattern.test(value)) {
    return `${fieldName}의 형식이 올바르지 않습니다.`;
  }

  // 커스텀 검증
  if (rules.custom) {
    const result = rules.custom(value);
    if (typeof result === 'string') {
      return result;
    }
    if (!result) {
      return `${fieldName}의 값이 유효하지 않습니다.`;
    }
  }

  return null;
}

// 숫자 검증 함수
export function validateNumber(
  value: string | number,
  fieldName: string,
  rules: ValidationRule<number>
): string | null {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // 필수 검증
  if (rules.required && (value === '' || value === null || value === undefined || isNaN(numValue))) {
    return `${fieldName}은(는) 필수 항목입니다.`;
  }

  if (value === '' || value === null || value === undefined) {
    return null; // 빈 값이 허용되는 경우
  }

  // 숫자 형식 검증
  if (isNaN(numValue)) {
    return `${fieldName}은(는) 숫자여야 합니다.`;
  }

  // 커스텀 검증
  if (rules.custom) {
    const result = rules.custom(numValue);
    if (typeof result === 'string') {
      return result;
    }
    if (!result) {
      return `${fieldName}의 값이 유효하지 않습니다.`;
    }
  }

  return null;
}

// 위스키 폼 검증 규칙
export const bottleValidationRules = {
  name: {
    required: true,
    minLength: 1,
    maxLength: 255
  } as ValidationRule<string>,
  
  brand_id: {
    required: true
  } as ValidationRule<string>,
  
  vintage: {
    custom: (value: number) => {
      if (value < 1900 || value > new Date().getFullYear()) {
        return '빈티지는 1900년부터 현재까지의 연도여야 합니다.';
      }
      return true;
    }
  } as ValidationRule<number>,
  
  age_years: {
    custom: (value: number) => {
      if (value < 0 || value > 100) {
        return '숙성연수는 0-100년 사이여야 합니다.';
      }
      return true;
    }
  } as ValidationRule<number>,
  
  retail_price: {
    custom: (value: number) => {
      if (value < 0) {
        return '시중가는 0원 이상이어야 합니다.';
      }
      return true;
    }
  } as ValidationRule<number>,
  
  purchase_price: {
    custom: (value: number) => {
      if (value < 0) {
        return '구매가는 0원 이상이어야 합니다.';
      }
      return true;
    }
  } as ValidationRule<number>,
  
  total_volume_ml: {
    required: true,
    custom: (value: number) => {
      if (value <= 0) {
        return '총 용량은 0ml보다 커야 합니다.';
      }
      return true;
    }
  } as ValidationRule<number>,
  
  remaining_volume_ml: {
    required: true,
    custom: (value: number) => {
      if (value < 0) {
        return '남은 용량은 0ml 이상이어야 합니다.';
      }
      return true;
    }
  } as ValidationRule<number>,
  
  abv: {
    custom: (value: number) => {
      if (value < 0 || value > 100) {
        return '도수는 0-100% 사이여야 합니다.';
      }
      return true;
    }
  } as ValidationRule<number>
};

// 시음 기록 폼 검증 규칙
export const tastingValidationRules = {
  bottle_name: {
    required: true,
    minLength: 1,
    maxLength: 255
  } as ValidationRule<string>,
  
  tasting_date: {
    required: true,
    custom: (value: string) => {
      const date = new Date(value);
      const today = new Date();
      if (date > today) {
        return '시음 날짜는 오늘 이전이어야 합니다.';
      }
      return true;
    }
  } as ValidationRule<string>,
  
  consumed_volume_ml: {
    custom: (value: number) => {
      if (value < 0) {
        return '소비량은 0ml 이상이어야 합니다.';
      }
      return true;
    }
  } as ValidationRule<number>,
  
  nose_rating: {
    custom: (value: number) => {
      if (value < 1 || value > 10) {
        return '코 평점은 1-10 사이여야 합니다.';
      }
      return true;
    }
  } as ValidationRule<number>,
  
  palate_rating: {
    custom: (value: number) => {
      if (value < 1 || value > 10) {
        return '입 평점은 1-10 사이여야 합니다.';
      }
      return true;
    }
  } as ValidationRule<number>,
  
  finish_rating: {
    custom: (value: number) => {
      if (value < 1 || value > 10) {
        return '피니시 평점은 1-10 사이여야 합니다.';
      }
      return true;
    }
  } as ValidationRule<number>,
  
  overall_rating: {
    custom: (value: number) => {
      if (value < 1 || value > 10) {
        return '종합 평점은 1-10 사이여야 합니다.';
      }
      return true;
    }
  } as ValidationRule<number>
};

// 위스키 폼 전체 검증
export function validateBottleForm(formData: BottleFormData): ValidationResult {
  const errors: Record<string, string> = {};

  // 각 필드 검증
  Object.entries(bottleValidationRules).forEach(([field, rules]) => {
    const value = formData[field as keyof BottleFormData];
    const fieldName = getFieldDisplayName(field);
    
    if (typeof value === 'string') {
      const error = validateString(value, fieldName, rules as ValidationRule<string>);
      if (error) errors[field] = error;
    } else if (typeof value === 'number' || !isNaN(parseFloat(value))) {
      const error = validateNumber(value, fieldName, rules as ValidationRule<number>);
      if (error) errors[field] = error;
    }
  });

  // 추가 검증: 남은 용량이 총 용량을 초과하지 않도록
  const totalVolume = parseFloat(formData.total_volume_ml);
  const remainingVolume = parseFloat(formData.remaining_volume_ml);
  
  if (!isNaN(totalVolume) && !isNaN(remainingVolume) && remainingVolume > totalVolume) {
    errors.remaining_volume_ml = '남은 용량은 총 용량을 초과할 수 없습니다.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// 시음 기록 폼 전체 검증
export function validateTastingForm(formData: TastingFormData): ValidationResult {
  const errors: Record<string, string> = {};

  // 각 필드 검증
  Object.entries(tastingValidationRules).forEach(([field, rules]) => {
    const value = formData[field as keyof TastingFormData];
    const fieldName = getFieldDisplayName(field);
    
    if (typeof value === 'string') {
      const error = validateString(value, fieldName, rules as ValidationRule<string>);
      if (error) errors[field] = error;
    } else if (typeof value === 'number' || !isNaN(parseFloat(value))) {
      const error = validateNumber(value, fieldName, rules as ValidationRule<number>);
      if (error) errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// 필드명을 사용자 친화적인 이름으로 변환
function getFieldDisplayName(field: string): string {
  const fieldNames: Record<string, string> = {
    name: '위스키명',
    brand_id: '브랜드',
    vintage: '빈티지',
    age_years: '숙성연수',
    retail_price: '시중가',
    purchase_price: '구매가',
    total_volume_ml: '총 용량',
    remaining_volume_ml: '남은 용량',
    abv: '도수',
    bottle_name: '위스키명',
    tasting_date: '시음 날짜',
    consumed_volume_ml: '소비량',
    nose_rating: '코 평점',
    palate_rating: '입 평점',
    finish_rating: '피니시 평점',
    overall_rating: '종합 평점'
  };

  return fieldNames[field] || field;
}

// 실시간 검증 훅
export function useFormValidation<T extends Record<string, any>>(
  formData: T,
  validationRules: Record<string, ValidationRule<any>>,
  validateFunction: (data: T) => ValidationResult
) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // 필드 터치 처리
  const handleFieldTouch = (fieldName: string) => {
    setTouched((prev: Record<string, boolean>) => ({ ...prev, [fieldName]: true }));
  };

  // 필드 값 변경 시 검증
  const validateField = (fieldName: string, value: any) => {
    const rules = validationRules[fieldName];
    if (!rules) return null;

    const fieldNameDisplay = getFieldDisplayName(fieldName);
    
    if (typeof value === 'string') {
      return validateString(value, fieldNameDisplay, rules as ValidationRule<string>);
    } else if (typeof value === 'number' || !isNaN(parseFloat(value))) {
      return validateNumber(value, fieldNameDisplay, rules as ValidationRule<number>);
    }
    
    return null;
  };

  // 전체 폼 검증
  const validateForm = () => {
    const result = validateFunction(formData);
    setErrors(result.errors);
    return result.isValid;
  };

  // 필드별 에러 가져오기
  const getFieldError = (fieldName: string): string | null => {
    if (!touched[fieldName]) return null;
    return errors[fieldName] || null;
  };

  return {
    errors,
    touched,
    handleFieldTouch,
    validateField,
    validateForm,
    getFieldError
  };
} 