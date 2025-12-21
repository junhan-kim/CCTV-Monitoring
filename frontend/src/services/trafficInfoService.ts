/**
 * 교통정보 비즈니스 로직 서비스
 */

import { fetchTrafficInfoByArea } from '../adapters/trafficInfoAdapter';
import type { TrafficInfo, TrafficApiResponse } from '../types/traffic';
import {
  TRAFFIC_SEARCH_RADIUS,
  LINK_ID_MIN_PREFIX_LENGTH,
  SPEED_THRESHOLDS,
  SPEED_COLORS,
} from '../constants/traffic';

export type { TrafficInfo, TrafficApiResponse };

/**
 * CCTV 좌표 주변의 교통정보 조회
 *
 * @param coordx CCTV 경도
 * @param coordy CCTV 위도
 * @param radius 검색 반경 (도 단위, 기본값: 0.01도 ≈ 1km)
 */
export async function fetchTrafficInfoByCCTV(
  coordx: number,
  coordy: number,
  radius: number = TRAFFIC_SEARCH_RADIUS
): Promise<TrafficApiResponse> {
  return fetchTrafficInfoByArea(
    coordx - radius,
    coordx + radius,
    coordy - radius,
    coordy + radius
  );
}

/**
 * 두 linkId 간의 공통 prefix 길이 계산
 */
function getCommonPrefixLength(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) {
    i++;
  }
  return i;
}

/**
 * CCTV의 linkId로 교통정보 조회
 * linkId가 정확히 일치하지 않으면 가장 유사한(prefix가 긴) linkId 사용
 *
 * @param coordx CCTV 경도
 * @param coordy CCTV 위도
 * @param linkId CCTV에 매핑된 linkId
 * @returns 해당 링크의 교통정보 또는 null
 */
export async function getTrafficInfoForCCTV(
  coordx: number,
  coordy: number,
  linkId: string
): Promise<TrafficInfo | null> {
  try {
    const trafficData = await fetchTrafficInfoByCCTV(coordx, coordy);
    const items = trafficData.body.items || [];

    if (items.length === 0) {
      return null;
    }

    // 1. 정확히 일치하는 linkId 먼저 찾기
    const exactMatch = items.find((item) => item.linkId === linkId);
    if (exactMatch) {
      console.log(`[TrafficService] linkId ${linkId} 정확히 일치`);
      return exactMatch;
    }

    // 2. 정확히 일치하지 않으면 가장 유사한 linkId 찾기 (prefix 매칭)
    let bestMatch: TrafficInfo | null = null;
    let bestPrefixLength = 0;

    for (const item of items) {
      const prefixLength = getCommonPrefixLength(linkId, item.linkId);
      if (prefixLength > bestPrefixLength) {
        bestPrefixLength = prefixLength;
        bestMatch = item;
      }
    }

    // 최소 N자리 이상 일치해야 유효한 매칭으로 간주
    if (bestMatch && bestPrefixLength >= LINK_ID_MIN_PREFIX_LENGTH) {
      console.log(`[TrafficService] linkId ${linkId} → ${bestMatch.linkId} (prefix ${bestPrefixLength}자리 일치)`);
      return bestMatch;
    }

    console.log(`[TrafficService] linkId ${linkId}에 대한 유사 교통정보 없음 (총 ${items.length}개 조회)`);
    return null;
  } catch (error) {
    console.error('CCTV 교통정보 조회 실패:', error);
    return null;
  }
}

/**
 * 속도를 기준으로 색상 코드 반환 (교통 혼잡도)
 */
export function getSpeedColor(speed: number): string {
  if (speed >= SPEED_THRESHOLDS.SMOOTH) return SPEED_COLORS.SMOOTH;
  if (speed >= SPEED_THRESHOLDS.NORMAL) return SPEED_COLORS.NORMAL;
  if (speed >= SPEED_THRESHOLDS.SLOW) return SPEED_COLORS.SLOW;
  return SPEED_COLORS.CONGESTED;
}

/**
 * 속도를 기준으로 혼잡도 텍스트 반환
 */
export function getTrafficStatus(speed: number): string {
  if (speed >= SPEED_THRESHOLDS.SMOOTH) return '원활';
  if (speed >= SPEED_THRESHOLDS.NORMAL) return '보통';
  if (speed >= SPEED_THRESHOLDS.SLOW) return '서행';
  return '정체';
}
