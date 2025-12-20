import type { CSSProperties } from 'react';

export const trafficInfoStyles = {
  // 기본 컨테이너 스타일
  container: {
    padding: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: '6px',
    color: 'white',
    fontSize: '14px',
  } as CSSProperties,

  // 로딩 상태
  loading: {
    padding: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: '6px',
    color: 'white',
    fontSize: '14px',
    textAlign: 'center',
  } as CSSProperties,

  // 데이터 없음 상태
  noData: {
    padding: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: '6px',
    color: 'white',
    fontSize: '14px',
    textAlign: 'center',
    opacity: 0.7,
  } as CSSProperties,

  // 속도 정보 행
  speedRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  } as CSSProperties,

  // 왼쪽 속도 그룹
  speedGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as CSSProperties,

  // 속도 인디케이터 (동적 색상 필요)
  speedIndicator: (color: string): CSSProperties => ({
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: color,
    boxShadow: `0 0 8px ${color}`,
  }),

  // 상태 텍스트
  statusText: {
    fontWeight: 'bold',
    fontSize: '15px',
  } as CSSProperties,

  // 속도 값 (동적 색상 필요)
  speedValue: (color: string): CSSProperties => ({
    color: color,
    fontWeight: 'bold',
    fontSize: '18px',
  }),

  // 도로명
  roadName: {
    fontSize: '12px',
    opacity: 0.7,
    borderTop: '1px solid rgba(255,255,255,0.1)',
    paddingTop: '8px',
  } as CSSProperties,

  // 통행시간
  travelTime: {
    fontSize: '11px',
    opacity: 0.5,
    marginTop: '4px',
  } as CSSProperties,
};

// TrafficInfoBadge 스타일
export const trafficBadgeStyles = {
  badge: (color: string): CSSProperties => ({
    display: 'inline-block',
    padding: '2px 6px',
    backgroundColor: color,
    color: 'white',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
  }),
};
