import type { CCTVInfo } from '../types/cctv';

/**
 * CCTV의 고유 키를 생성합니다.
 * 좌표 + 이름 조합으로 고유성 보장 (동일 좌표에 다른 CCTV 존재 가능)
 */
export function getCCTVKey(cctv: CCTVInfo): string {
  return `${cctv.coordx}-${cctv.coordy}-${cctv.cctvname}`;
}
