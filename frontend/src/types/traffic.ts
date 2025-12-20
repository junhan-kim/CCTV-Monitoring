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

export interface TrafficInfoProps {
  cctv: import('./cctv').CCTVInfo;
}
