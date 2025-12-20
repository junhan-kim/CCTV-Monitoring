export interface CCTVInfo {
  cctvid: string;
  cctvname: string;
  coordx: number; // 경도 (longitude)
  coordy: number; // 위도 (latitude)
  cctvtype: string;
  cctvurl: string;
  roadsectionid?: string;
  filecreatetime?: string;
}

export interface CCTVApiResponse {
  response: {
    data?: CCTVInfo[];
  };
}

export interface CCTVBounds {
  minX: number; // 최소 경도
  maxX: number; // 최대 경도
  minY: number; // 최소 위도
  maxY: number; // 최대 위도
}
