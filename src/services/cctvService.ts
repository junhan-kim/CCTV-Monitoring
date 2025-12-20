import { CCTVInfo, CCTVApiResponse, CCTVBounds } from '../types/cctv';

const OPENAPI_BASE_URL = 'https://openapi.its.go.kr:9443';

export class CCTVService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async fetchCCTVList(bounds: CCTVBounds): Promise<CCTVInfo[]> {
    const { minX, maxX, minY, maxY } = bounds;

    const url = `${OPENAPI_BASE_URL}/cctvInfo?apiKey=${this.apiKey}&type=ex&cctvType=1&minX=${minX}&maxX=${maxX}&minY=${minY}&maxY=${maxY}&getType=json`;

    console.log('🔍 CCTV API 요청:', { minX, maxX, minY, maxY, url });

    try {
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('CCTV API 개인 제한량 초과');
        }
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const data: CCTVApiResponse = await response.json();

      return data.response.data || [];
    } catch (error) {
      console.error('CCTV 데이터 조회 실패:', error);
      throw error;
    }
  }

  static getBoundsFromKakaoMap(map: any): CCTVBounds {
    const bounds = map.getBounds();

    return {
      minX: bounds.getSouthWest().getLng(),
      maxX: bounds.getNorthEast().getLng(),
      minY: bounds.getSouthWest().getLat(),
      maxY: bounds.getNorthEast().getLat(),
    };
  }
}
