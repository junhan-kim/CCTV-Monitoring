/**
 * 국가교통정보센터 API Adapter
 * 외부 API와의 통신만 담당
 */

import { getRequiredEnv } from '../utils/envValidator';
import { API_BASE_URLS } from '../constants/api';
import type { TrafficApiResponse } from '../types/traffic';

const ITS_API_KEY = getRequiredEnv('REACT_APP_OPENAPI_ITS_KEY');
const ITS_API_BASE_URL = `${API_BASE_URLS.ITS}/trafficInfo`;

/**
 * 특정 영역의 교통정보 조회 (외부 API 호출)
 */
export async function fetchTrafficInfoByArea(
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
): Promise<TrafficApiResponse> {
  const params = new URLSearchParams({
    apiKey: ITS_API_KEY,
    type: 'all',
    minX: minX.toString(),
    maxX: maxX.toString(),
    minY: minY.toString(),
    maxY: maxY.toString(),
    getType: 'json',
  });

  const url = `${ITS_API_BASE_URL}?${params}`;

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
