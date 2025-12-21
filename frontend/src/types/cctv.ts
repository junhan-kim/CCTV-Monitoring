/**
 * CCTV 유형 (cctvType)
 * 1: 실시간 스트리밍(HLS) - HTTP
 * 2: 동영상(mp4) - HTTP
 * 3: 정지 영상
 * 4: 실시간 스트리밍(HLS) - HTTPS
 * 5: 동영상(mp4) - HTTPS
 *
 * 도로 유형 (type)
 * ex: 고속도로
 * its: 국도
 */
export interface CCTVInfo {
  cctvname: string;
  cctvurl: string;
  coordx: number; // 경도 (longitude)
  coordy: number; // 위도 (latitude)
  cctvtype: number; // CCTV 유형 (1~5)
  cctvformat: string; // 예: "HLS"
  cctvresolution: string;
  roadsectionid: string;
  filecreatetime: string;
  // 교통정보 매핑 필드 (선택적)
  linkId?: string; // 노드링크 linkId
  linkRoadName?: string; // 링크 도로명
  linkDistance?: number; // CCTV와 링크 간 거리(km)
}

export interface CCTVApiResponse {
  response: {
    coordtype: number;
    data?: CCTVInfo[];
  };
}

export interface CCTVBounds {
  minX: number; // 최소 경도
  maxX: number; // 최대 경도
  minY: number; // 최소 위도
  maxY: number; // 최대 위도
}

export interface FavoritesDropdownProps {
  favorites: CCTVInfo[];
  onSelect: (cctv: CCTVInfo) => void;
  onRemove: (cctvname: string) => void;
}
