import { CCTVInfo, CCTVApiResponse, CCTVBounds } from '../types/cctv';
import cctvDataJson from '../data/cctv-data.json';

export class CCTVService {
  private allCCTVData: CCTVInfo[];

  constructor() {
    const data = cctvDataJson as CCTVApiResponse;
    this.allCCTVData = data.response.data || [];
    console.log(`📦 전국 CCTV 데이터 로드 완료: ${this.allCCTVData.length}개`);
  }

  async fetchCCTVList(bounds: CCTVBounds): Promise<CCTVInfo[]> {
    const { minX, maxX, minY, maxY } = bounds;

    const filtered = this.allCCTVData.filter((cctv) => {
      return (
        cctv.coordx >= minX &&
        cctv.coordx <= maxX &&
        cctv.coordy >= minY &&
        cctv.coordy <= maxY
      );
    });

    console.log(`🔍 CCTV 필터링: ${filtered.length}개 (bounds: ${minX}, ${minY} ~ ${maxX}, ${maxY})`);

    return filtered;
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
