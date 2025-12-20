import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CCTVService } from '../services/cctvService';
import { CCTVInfo } from '../types/cctv';
import HLSPlayer from './HLSPlayer';

declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapProps {
  width?: string;
  height?: string;
  debounceMs?: number;
}

const KakaoMap: React.FC<KakaoMapProps> = ({
  width = '100%',
  height = '100vh',
  debounceMs = 500
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const debounceTimerRef = useRef<number | null>(null);
  const currentLocationMarkerRef = useRef<any>(null);
  const [cctvService] = useState(() => new CCTVService());
  const [selectedCCTV, setSelectedCCTV] = useState<CCTVInfo | null>(null);

  const clearMarkers = () => {
    markersRef.current.forEach((marker: any) => marker.setMap(null));
    markersRef.current = [];
  };

  const drawCCTVMarkers = async (map: any) => {
    try {
      clearMarkers();

      const bounds = CCTVService.getBoundsFromKakaoMap(map);
      const cctvList = await cctvService.fetchCCTVList(bounds);

      const { kakao } = window;
      const markerImageUrl =
        'https://toppng.com//public/uploads/preview/cctv-camera-icon-cctv-camera-icon-1156329928317vhhunz9l.png';

      cctvList.forEach((cctv: CCTVInfo) => {
        const position = new kakao.maps.LatLng(cctv.coordy, cctv.coordx);

        const markerImage = new kakao.maps.MarkerImage(
          markerImageUrl,
          new kakao.maps.Size(30, 30)
        );

        const marker = new kakao.maps.Marker({
          position,
          image: markerImage,
        });

        kakao.maps.event.addListener(marker, 'click', () => {
          setSelectedCCTV(cctv);
        });

        marker.setMap(map);
        markersRef.current.push(marker);
      });

      console.log(`${cctvList.length}개의 CCTV 마커 렌더링 완료`);
    } catch (error) {
      console.error('CCTV 마커 렌더링 실패:', error);
    }
  };

  const debouncedDrawCCTVMarkers = useCallback((map: any) => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      drawCCTVMarkers(map);
    }, debounceMs);
  }, [debounceMs]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const { kakao } = window;

    if (!kakao || !kakao.maps) {
      console.error('Kakao maps SDK not loaded');
      return;
    }

    const options = {
      center: new kakao.maps.LatLng(37.5665, 126.9780),
      level: 3
    };

    const map = new kakao.maps.Map(mapContainer.current, options);
    mapRef.current = map;

    const mapTypeControl = new kakao.maps.MapTypeControl();
    map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

    const zoomControl = new kakao.maps.ZoomControl();
    map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log('내 위치:', latitude, longitude);
          console.log('위치 정확도:', accuracy, '미터');

          const myPosition = new kakao.maps.LatLng(latitude, longitude);
          map.setCenter(myPosition);

          // 내 위치 마커 추가
          if (currentLocationMarkerRef.current) {
            currentLocationMarkerRef.current.setMap(null);
          }

          const myLocationMarker = new kakao.maps.Marker({
            position: myPosition,
            map: map
          });

          currentLocationMarkerRef.current = myLocationMarker;

          const center = map.getCenter();
          console.log('지도 중심:', center.getLat(), center.getLng());
          drawCCTVMarkers(map);
        },
        (error) => {
          console.error('Geolocation 에러:', error);
          drawCCTVMarkers(map);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      drawCCTVMarkers(map);
    }

    kakao.maps.event.addListener(map, 'zoom_changed', () => {
      debouncedDrawCCTVMarkers(map);
    });

    kakao.maps.event.addListener(map, 'dragend', () => {
      debouncedDrawCCTVMarkers(map);
    });

    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
      clearMarkers();
    };
  }, [cctvService, debouncedDrawCCTVMarkers]);

  return (
    <React.Fragment>
      <div
        ref={mapContainer}
        style={{
          width,
          height
        }}
      />
      {selectedCCTV && (
        <HLSPlayer
          url={selectedCCTV.cctvurl}
          title={selectedCCTV.cctvname}
          onClose={() => setSelectedCCTV(null)}
        />
      )}
    </React.Fragment>
  );
};

export default KakaoMap;
