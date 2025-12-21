/**
 * 국가교통정보센터 API Adapter
 * - 로컬: 직접 API 호출 (REACT_APP_OPENAPI_ITS_KEY 사용)
 * - 배포: Netlify Function 프록시 경유 (API 키 숨김)
 */

import type { TrafficApiResponse } from '../types/traffic';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const ITS_API_KEY = process.env.REACT_APP_OPENAPI_ITS_KEY;
const ITS_API_BASE_URL = 'https://openapi.its.go.kr:9443/trafficInfo';

/**
 * 특정 영역의 교통정보 조회
 */
export async function fetchTrafficInfoByArea(
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
): Promise<TrafficApiResponse> {
  const url = IS_PRODUCTION
    ? buildProxyUrl(minX, maxX, minY, maxY)
    : buildDirectUrl(minX, maxX, minY, maxY);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('교통정보 API 요청 실패:', error);
    throw error;
  }
}

/** 배포 환경: Netlify Function 프록시 경유 */
function buildProxyUrl(minX: number, maxX: number, minY: number, maxY: number): string {
  const params = new URLSearchParams({
    minX: minX.toString(),
    maxX: maxX.toString(),
    minY: minY.toString(),
    maxY: maxY.toString(),
  });
  return `/.netlify/functions/traffic-info?${params}`;
}

/** 로컬 환경: 직접 API 호출 */
function buildDirectUrl(minX: number, maxX: number, minY: number, maxY: number): string {
  const params = new URLSearchParams({
    apiKey: ITS_API_KEY || '',
    type: 'all',
    minX: minX.toString(),
    maxX: maxX.toString(),
    minY: minY.toString(),
    maxY: maxY.toString(),
    getType: 'json',
  });
  return `${ITS_API_BASE_URL}?${params}`;
}
