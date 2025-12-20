/**
 * 국가교통정보센터 API 연동 모듈
 */

const ITS_API_KEY = process.env.REACT_APP_OPENAPI_ITS_KEY || '';
const ITS_API_BASE_URL = 'https://openapi.its.go.kr:9443/trafficInfo';

export interface TrafficInfo {
  roadName: string;
  linkId: string;
  speed: string;
  travelTime: string;
  createdDate: string;
  startNodeId: string;
  endNodeId: string;
}

export interface TrafficApiResponse {
  header: {
    resultCode: number;
    resultMsg: string;
  };
  body: {
    totalCount: number;
    items: TrafficInfo[];
  };
}

/**
 * 특정 영역의 교통정보 조회
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

/**
 * CCTV 좌표 주변의 교통정보 조회
 */
export async function fetchTrafficInfoByCCTV(
  coordx: number,
  coordy: number,
  radius: number = 0.1
): Promise<TrafficApiResponse> {
  return fetchTrafficInfoByArea(
    coordx - radius,
    coordx + radius,
    coordy - radius,
    coordy + radius
  );
}

/**
 * 특정 linkId의 교통정보 찾기
 */
export function findTrafficByLinkId(
  trafficData: TrafficApiResponse,
  linkId: string
): TrafficInfo | null {
  return trafficData.body.items.find((item) => item.linkId === linkId) || null;
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
    return findTrafficByLinkId(trafficData, linkId);
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
