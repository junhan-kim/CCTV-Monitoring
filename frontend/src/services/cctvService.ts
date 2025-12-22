import { CCTVInfo, CCTVApiResponse, CCTVBounds } from '../types/cctv';
import { refreshCCTVUrl as refreshCCTVUrlFromApi } from '../adapters/cctvUrlAdapter';

// 환경변수에 따라 HTTP/HTTPS 데이터 선택
// 빌드 시점에 결정됨 (CRA는 동적 import 불가)
import cctvDataHttp from '../datas/cctv/cctv-data-with-links.json';
// HTTPS 데이터가 없을 수 있으므로 try-catch로 처리하지 않고
// 빌드 시 USE_HTTPS=true면 HTTPS 파일이 있어야 함

const USE_HTTPS = process.env.REACT_APP_CCTV_USE_HTTPS === 'true';

// HTTPS 모드일 때는 https 파일을, 아니면 http 파일 사용
// 참고: HTTPS 파일이 없으면 HTTP 파일을 fallback으로 사용
let cctvDataJson: CCTVApiResponse;
try {
  if (USE_HTTPS) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cctvDataJson = require('../datas/cctv/cctv-data-https-with-links.json');
  } else {
    cctvDataJson = cctvDataHttp as CCTVApiResponse;
  }
} catch {
  console.warn('HTTPS CCTV 데이터 없음, HTTP 데이터 사용');
  cctvDataJson = cctvDataHttp as CCTVApiResponse;
}

export class CCTVService {
  private allCCTVData: CCTVInfo[];

  constructor() {
    const data = cctvDataJson;
    this.allCCTVData = data.response.data || [];
    console.log(`📦 전국 CCTV 데이터 로드 완료: ${this.allCCTVData.length}개 (HTTPS: ${USE_HTTPS})`);
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

  searchByName(query: string): CCTVInfo[] {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    return this.allCCTVData.filter((cctv) =>
      cctv.cctvname.toLowerCase().includes(lowerQuery)
    );
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

  /**
   * CCTV의 HLS URL을 갱신합니다.
   * HLS URL은 만료 기한이 있어 재생 시점에 새로운 URL을 받아와야 합니다.
   */
  refreshCCTVUrl(cctv: CCTVInfo) {
    return refreshCCTVUrlFromApi(cctv);
  }
}
