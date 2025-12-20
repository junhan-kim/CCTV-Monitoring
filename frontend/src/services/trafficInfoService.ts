/**
 * 교통정보 비즈니스 로직 서비스
 */

import { fetchTrafficInfoByArea } from '../adapters/trafficInfoAdapter';
import type { TrafficInfo, TrafficApiResponse } from '../types/traffic';

export type { TrafficInfo, TrafficApiResponse };

/**
 * CCTV 좌표 주변의 교통정보 조회
 *
 * @param coordx CCTV 경도
 * @param coordy CCTV 위도
 * @param radius 검색 반경 (도 단위, 기본값: 0.005도 ≈ 500m)
 */
export async function fetchTrafficInfoByCCTV(
  coordx: number,
  coordy: number,
  radius: number = 0.005
): Promise<TrafficApiResponse> {
  return fetchTrafficInfoByArea(
    coordx - radius,
    coordx + radius,
    coordy - radius,
    coordy + radius
  );
}

/**
 * CCTV의 linkId로 교통정보 조회
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
    const result = trafficData.body.items.find((item) => item.linkId === linkId) || null;

    if (!result) {
      console.log(`[TrafficService] linkId ${linkId}에 대한 교통정보 없음 (총 ${trafficData.body.totalCount}개 조회)`);
    }

    return result;
  } catch (error) {
    console.error('CCTV 교통정보 조회 실패:', error);
    return null;
  }
}

/**
 * 속도를 기준으로 색상 코드 반환 (교통 혼잡도)
 */
export function getSpeedColor(speed: number): string {
  if (speed >= 80) return '#22c55e'; // 녹색 - 원활
  if (speed >= 60) return '#eab308'; // 노란색 - 보통
  if (speed >= 40) return '#f97316'; // 주황색 - 서행
  return '#ef4444'; // 빨간색 - 정체
}

/**
 * 속도를 기준으로 혼잡도 텍스트 반환
 */
export function getTrafficStatus(speed: number): string {
  if (speed >= 80) return '원활';
  if (speed >= 60) return '보통';
  if (speed >= 40) return '서행';
  return '정체';
}
