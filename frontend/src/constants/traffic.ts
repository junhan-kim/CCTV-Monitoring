/**
 * 교통정보 관련 상수
 */

/** 교통정보 갱신 간격 (밀리초) */
export const TRAFFIC_REFRESH_INTERVAL_MS = 60000;

/** CCTV 주변 교통정보 검색 반경 (도 단위, 0.01도 ≈ 1km) */
export const TRAFFIC_SEARCH_RADIUS = 0.01;

/** linkId prefix 매칭 최소 길이 */
export const LINK_ID_MIN_PREFIX_LENGTH = 4;

/** 속도 기준 임계값 (km/h) */
export const SPEED_THRESHOLDS = {
  SMOOTH: 80, // 원활
  NORMAL: 60, // 보통
  SLOW: 40, // 서행
  // 40 미만: 정체
} as const;

/** 혼잡도별 색상 */
export const SPEED_COLORS = {
  SMOOTH: '#22c55e', // 녹색 - 원활
  NORMAL: '#eab308', // 노란색 - 보통
  SLOW: '#f97316', // 주황색 - 서행
  CONGESTED: '#ef4444', // 빨간색 - 정체
} as const;
