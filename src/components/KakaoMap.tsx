import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapProps {
  width?: string;
  height?: string;
}

const KakaoMap: React.FC<KakaoMapProps> = ({
  width = '100%',
  height = '100vh'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);

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

    const mapTypeControl = new kakao.maps.MapTypeControl();
    map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

    const zoomControl = new kakao.maps.ZoomControl();
    map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

  }, []);

  return (
    <div
      ref={mapContainer}
      style={{
        width,
        height
      }}
    />
  );
};

export default KakaoMap;
