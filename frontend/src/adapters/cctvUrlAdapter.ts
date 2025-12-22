/**
 * CCTV URL 갱신 API Adapter
 * - 로컬: 직접 API 호출 (REACT_APP_OPENAPI_ITS_KEY 사용)
 * - 배포: Netlify Function 프록시 경유 (API 키 숨김)
 */

import type { CCTVInfo, CCTVUrlRefreshResponse } from '../types/cctv';
import { CCTV_COORD_TOLERANCE } from '../constants/map';
import { API_BASE_URLS } from '../constants/api';
import { isProduction, getItsApiKey, getCCTVType } from '../utils/env';

/**
 * CCTV의 HLS URL을 갱신합니다.
 * HLS URL은 만료 기한이 있어 재생 시점에 새로운 URL을 받아와야 합니다.
 */
export async function refreshCCTVUrl(cctv: CCTVInfo): Promise<CCTVUrlRefreshResponse> {
  // roadType이 있으면 해당 타입만, 없으면 its/ex 둘 다 시도
  const roadTypes: ('its' | 'ex')[] = cctv.roadType
    ? [cctv.roadType]
    : ['its', 'ex'];

  for (const roadType of roadTypes) {
    // TODO: Netlify Functions에서 ITS API 연결 타임아웃 이슈로 임시로 직접 호출
    const url = buildDirectUrl(cctv, roadType);

    const response = await fetch(url);

    if (!response.ok) {
      continue;
    }

    const data = await response.json();
    const rawData = data.response?.data;
    const dataArray = Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];

    if (dataArray.length > 0) {
      const cctvList: ParsedCCTV[] = dataArray.map((item: {
        cctvurl: string;
        cctvname: string;
        coordx: number;
        coordy: number;
      }) => ({
        cctvurl: item.cctvurl,
        cctvname: item.cctvname,
        coordx: String(item.coordx),
        coordy: String(item.coordy),
      }));
      return findClosestCCTV(cctvList, cctv.coordx, cctv.coordy);
    }
  }

  throw new Error('해당 좌표에서 CCTV를 찾을 수 없습니다');
}

/** 배포 환경: Netlify Function 프록시 경유 */
function buildProxyUrl(cctv: CCTVInfo, roadType: 'its' | 'ex'): string {
  const x = cctv.coordx;
  const y = cctv.coordy;

  const params = new URLSearchParams({
    type: roadType,
    cctvType: getCCTVType().toString(),
    minX: (x - CCTV_COORD_TOLERANCE).toString(),
    maxX: (x + CCTV_COORD_TOLERANCE).toString(),
    minY: (y - CCTV_COORD_TOLERANCE).toString(),
    maxY: (y + CCTV_COORD_TOLERANCE).toString(),
  });
  return `/.netlify/functions/cctv-url?${params}`;
}

/** 로컬 환경: 직접 API 호출 */
function buildDirectUrl(cctv: CCTVInfo, roadType: 'its' | 'ex'): string {
  const x = cctv.coordx;
  const y = cctv.coordy;

  const params = new URLSearchParams({
    apiKey: getItsApiKey(),
    type: roadType,
    cctvType: getCCTVType().toString(),
    minX: (x - CCTV_COORD_TOLERANCE).toString(),
    maxX: (x + CCTV_COORD_TOLERANCE).toString(),
    minY: (y - CCTV_COORD_TOLERANCE).toString(),
    maxY: (y + CCTV_COORD_TOLERANCE).toString(),
    getType: 'json',
  });
  return `${API_BASE_URLS.ITS}/cctvInfo?${params}`;
}

interface ParsedCCTV {
  coordx: string;
  coordy: string;
  cctvurl: string;
  cctvname: string;
}

/** API 응답에서 가장 가까운 CCTV 찾기 */
function findClosestCCTV(
  cctvList: ParsedCCTV[],
  targetX: number,
  targetY: number
): CCTVUrlRefreshResponse {
  if (cctvList.length === 0) {
    throw new Error('해당 좌표에서 CCTV를 찾을 수 없습니다');
  }

  let closest = cctvList[0];
  let minDistance = Infinity;

  for (const cctv of cctvList) {
    const cx = parseFloat(cctv.coordx);
    const cy = parseFloat(cctv.coordy);
    const distance = Math.sqrt(Math.pow(cx - targetX, 2) + Math.pow(cy - targetY, 2));

    if (distance < minDistance) {
      minDistance = distance;
      closest = cctv;
    }
  }

  return {
    cctvurl: closest.cctvurl,
    cctvname: closest.cctvname,
    coordx: closest.coordx,
    coordy: closest.coordy,
  };
}
