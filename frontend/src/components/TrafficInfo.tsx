import React, { useEffect, useState } from 'react';
import { getTrafficInfoForCCTV, getSpeedColor, getTrafficStatus } from '../services/trafficInfoService';
import type { TrafficInfo, TrafficInfoProps } from '../types/traffic';
import { trafficInfoStyles, trafficBadgeStyles } from '../styles/trafficInfo.styles';

export const TrafficInfoDisplay: React.FC<TrafficInfoProps> = ({ cctv }) => {
  const [trafficInfo, setTrafficInfo] = useState<TrafficInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // CCTV가 바뀌면 이전 교통정보 초기화
    setTrafficInfo(null);
    setError(null);

    // linkId가 없으면 교통정보 조회 안함
    if (!cctv.linkId) {
      return;
    }

    const fetchTrafficInfo = async () => {
      setLoading(true);
      setError(null);

      try {
        const info = await getTrafficInfoForCCTV(cctv.coordx, cctv.coordy, cctv.linkId!);
        if (info) {
          console.log(`[TrafficInfo] 교통정보 갱신: ${cctv.cctvname} - ${info.speed}km/h at ${new Date().toLocaleTimeString()}`);
          setTrafficInfo(info);
        } else {
          console.log(`[TrafficInfo] 교통정보 없음: ${cctv.cctvname} at ${new Date().toLocaleTimeString()}`);
        }
      } catch (err) {
        setError('교통정보 조회 실패');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrafficInfo();

    // 30초마다 업데이트
    const interval = setInterval(fetchTrafficInfo, 30000);

    return () => clearInterval(interval);
  }, [cctv.linkId, cctv.coordx, cctv.coordy]);

  // linkId가 없으면 표시 안함
  if (!cctv.linkId) {
    return null;
  }

  if (loading && !trafficInfo) {
    return (
      <div className="traffic-info loading" style={trafficInfoStyles.loading}>
        <span>교통정보 조회 중...</span>
      </div>
    );
  }

  if (error) {
    return null; // 에러 시 조용히 숨김
  }

  if (!trafficInfo) {
    return (
      <div className="traffic-info no-data" style={trafficInfoStyles.noData}>
        <span>교통정보 없음</span>
      </div>
    );
  }

  const speed = parseFloat(trafficInfo.speed);
  const speedColor = getSpeedColor(speed);
  const status = getTrafficStatus(speed);

  console.log(`[TrafficInfo] 화면 렌더링 - ${cctv.cctvname}: ${speed}km/h (${status}) at ${new Date().toLocaleTimeString()}`);

  return (
    <div className="traffic-info" style={trafficInfoStyles.container}>
      <div style={trafficInfoStyles.speedRow}>
        <div style={trafficInfoStyles.speedGroup}>
          <div style={trafficInfoStyles.speedIndicator(speedColor)} />
          <span style={trafficInfoStyles.statusText}>{status}</span>
        </div>
        <span style={trafficInfoStyles.speedValue(speedColor)}>
          {speed} km/h
        </span>
      </div>
      {trafficInfo.roadName && (
        <div style={trafficInfoStyles.roadName}>
          📍 {trafficInfo.roadName}
        </div>
      )}
      <div style={trafficInfoStyles.travelTime}>
        통행시간: {parseFloat(trafficInfo.travelTime).toFixed(0)}초
      </div>
    </div>
  );
};

/**
 * 간단한 인라인 교통정보 표시 (마커 오버레이용)
 */
export const TrafficInfoBadge: React.FC<TrafficInfoProps> = ({ cctv }) => {
  const [trafficInfo, setTrafficInfo] = useState<TrafficInfo | null>(null);

  useEffect(() => {
    if (!cctv.linkId) return;

    const fetchTrafficInfo = async () => {
      try {
        const info = await getTrafficInfoForCCTV(cctv.coordx, cctv.coordy, cctv.linkId!);
        setTrafficInfo(info);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTrafficInfo();
    const interval = setInterval(fetchTrafficInfo, 60000); // 1분마다 업데이트
    return () => clearInterval(interval);
  }, [cctv.linkId, cctv.coordx, cctv.coordy]);

  if (!trafficInfo) return null;

  const speed = parseFloat(trafficInfo.speed);
  const speedColor = getSpeedColor(speed);

  return (
    <div style={trafficBadgeStyles.badge(speedColor)}>
      {speed} km/h
    </div>
  );
};
