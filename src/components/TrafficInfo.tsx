import React, { useEffect, useState } from 'react';
import { getTrafficInfoForCCTV, getSpeedColor, getTrafficStatus, TrafficInfo } from '../utils/trafficInfoApi';
import type { CCTVInfo } from '../types/cctv';

interface TrafficInfoProps {
  cctv: CCTVInfo;
}

export const TrafficInfoDisplay: React.FC<TrafficInfoProps> = ({ cctv }) => {
  const [trafficInfo, setTrafficInfo] = useState<TrafficInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // linkId가 없으면 교통정보 조회 안함
    if (!cctv.linkId) {
      return;
    }

    const fetchTrafficInfo = async () => {
      setLoading(true);
      setError(null);

      try {
        const info = await getTrafficInfoForCCTV(cctv.coordx, cctv.coordy, cctv.linkId!);
        setTrafficInfo(info);
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
      <div className="traffic-info loading">
        <span>교통정보 조회 중...</span>
      </div>
    );
  }

  if (error || !trafficInfo) {
    return null; // 에러 시 조용히 숨김
  }

  const speed = parseFloat(trafficInfo.speed);
  const speedColor = getSpeedColor(speed);
  const status = getTrafficStatus(speed);

  return (
    <div className="traffic-info" style={{
      padding: '12px',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: '6px',
      color: 'white',
      fontSize: '14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: speedColor,
              boxShadow: `0 0 8px ${speedColor}`,
            }}
          />
          <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{status}</span>
        </div>
        <span style={{ color: speedColor, fontWeight: 'bold', fontSize: '18px' }}>
          {speed} km/h
        </span>
      </div>
      {trafficInfo.roadName && (
        <div style={{ fontSize: '12px', opacity: 0.7, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' }}>
          📍 {trafficInfo.roadName}
        </div>
      )}
      <div style={{ fontSize: '11px', opacity: 0.5, marginTop: '4px' }}>
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
    <div
      style={{
        display: 'inline-block',
        padding: '2px 6px',
        backgroundColor: speedColor,
        color: 'white',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 'bold',
      }}
    >
      {speed} km/h
    </div>
  );
};
