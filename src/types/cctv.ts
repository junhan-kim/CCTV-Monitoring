export interface CCTVInfo {
  cctvname: string;
  cctvurl: string;
  coordx: number; // 경도 (longitude)
  coordy: number; // 위도 (latitude)
  cctvtype: number; // 1 = 고속도로
  cctvformat: string; // 예: "HLS"
  cctvresolution: string;
  roadsectionid: string;
  filecreatetime: string;
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
