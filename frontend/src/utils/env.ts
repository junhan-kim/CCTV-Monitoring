/**
 * 환경 관련 유틸리티
 */

export const isProduction = () => process.env.NODE_ENV === 'production';

export const getItsApiKey = () => process.env.REACT_APP_OPENAPI_ITS_KEY || '';

/**
 * 환경에 맞는 CCTV 타입 반환
 * - 로컬: 1 (HTTP HLS)
 * - 프로덕션: 4 (HTTPS HLS)
 */
export const getCCTVType = () => isProduction() ? 4 : 1;
