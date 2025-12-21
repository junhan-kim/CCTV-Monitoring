import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CCTVService } from '../services/cctvService';
import { CCTVInfo } from '../types/cctv';
import { KakaoMapProps } from '../types/map';
import HLSPlayer from './HLSPlayer';
import CCTVSearch from './CCTVSearch';
import FavoritesDropdown from './FavoritesDropdown';
import { MAP_CONSTANTS } from '../constants/map';
import { useFavorites } from '../hooks/useFavorites';
import { useIsMobile } from '../hooks/useIsMobile';

declare global {
  interface Window {
    kakao: any;
  }
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
  const { favorites, toggleFavorite, isFavorite, removeFavorite } = useFavorites();
  const isMobile = useIsMobile();

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker: any) => marker.setMap(null));
    markersRef.current = [];
  }, []);

  const drawCCTVMarkers = useCallback(async (map: any) => {
    try {
      clearMarkers();

      const bounds = CCTVService.getBoundsFromKakaoMap(map);
      const cctvList = await cctvService.fetchCCTVList(bounds);

      const { kakao } = window;

      cctvList.forEach((cctv: CCTVInfo) => {
        const position = new kakao.maps.LatLng(cctv.coordy, cctv.coordx);

        const markerImage = new kakao.maps.MarkerImage(
          MAP_CONSTANTS.CCTV_MARKER_IMAGE_URL,
          new kakao.maps.Size(MAP_CONSTANTS.CCTV_MARKER_SIZE.width, MAP_CONSTANTS.CCTV_MARKER_SIZE.height)
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
  }, [cctvService, clearMarkers]);

  const debouncedDrawCCTVMarkers = useCallback((map: any) => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      drawCCTVMarkers(map);
    }, debounceMs);
  }, [debounceMs, drawCCTVMarkers]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const { kakao } = window;

    if (!kakao || !kakao.maps) {
      console.error('Kakao maps SDK not loaded');
      return;
    }

    const options = {
      center: new kakao.maps.LatLng(MAP_CONSTANTS.DEFAULT_CENTER.lat, MAP_CONSTANTS.DEFAULT_CENTER.lng),
      level: MAP_CONSTANTS.DEFAULT_ZOOM_LEVEL
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
        MAP_CONSTANTS.GEOLOCATION_OPTIONS
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
  }, [cctvService, debouncedDrawCCTVMarkers, clearMarkers, drawCCTVMarkers]);

  const handleCCTVSelect = useCallback((cctv: CCTVInfo) => {
    if (!mapRef.current) return;

    const { kakao } = window;
    const position = new kakao.maps.LatLng(cctv.coordy, cctv.coordx);

    mapRef.current.setCenter(position);
    mapRef.current.setLevel(3);

    setSelectedCCTV(cctv);
  }, []);

  return (
    <React.Fragment>
      {!isMobile && (
        <FavoritesDropdown
          favorites={favorites}
          onSelect={handleCCTVSelect}
          onRemove={removeFavorite}
        />
      )}
      <CCTVSearch cctvService={cctvService} onSelectCCTV={handleCCTVSelect} />
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
          cctv={selectedCCTV}
          onClose={() => setSelectedCCTV(null)}
          isFavorite={isFavorite(selectedCCTV.cctvname)}
          onToggleFavorite={() => toggleFavorite(selectedCCTV)}
        />
      )}
    </React.Fragment>
  );
};

export default KakaoMap;
