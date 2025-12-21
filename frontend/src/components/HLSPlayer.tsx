import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { TrafficInfoDisplay } from './TrafficInfo';
import type { HLSPlayerProps } from '../types/player';
import '../styles/HLSPlayer.css';

const HLSPlayer: React.FC<HLSPlayerProps> = ({ url, title, onClose, cctv }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialSizeRef = useRef<{ width: number; height: number } | null>(null);
  const [size, setSize] = useState({ width: 480, height: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    // 최초 크기 저장
    if (!initialSizeRef.current) {
      initialSizeRef.current = {
        width: container.offsetWidth,
        height: container.offsetHeight
      };
    }

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = container.offsetWidth;
    const startHeight = container.offsetHeight;
    const aspectRatio = startWidth / startHeight;
    const minWidth = initialSizeRef.current.width;
    const maxWidth = initialSizeRef.current.width * 2;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = startX - moveEvent.clientX;
      const deltaY = startY - moveEvent.clientY;
      // 더 큰 움직임 기준으로 비율 유지
      const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY * aspectRatio;

      const newWidth = Math.max(minWidth, Math.min(startWidth + delta, maxWidth));
      const newHeight = newWidth / aspectRatio;
      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((error) => {
          console.error('Auto-play failed:', error);
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Network error, trying to recover...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Media error, trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal error, cannot recover');
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch((error) => {
          console.error('Auto-play failed:', error);
        });
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url]);

  return (
    <div
      className="hls-player-container"
      ref={containerRef}
      style={isMobile ? {} : {
        width: size.width,
        height: size.height > 0 ? size.height : 'auto'
      }}
    >
      <div
        className="hls-player-resize-left"
        onMouseDown={handleResizeStart}
      />
      <div
        className="hls-player-resize-top"
        onMouseDown={handleResizeStart}
      />
      <div
        className="hls-player-resize-corner"
        onMouseDown={handleResizeStart}
      />
      <div className="hls-player-header">
        <div className="hls-player-title">
          {title || 'CCTV 스트리밍'}
        </div>
        {onClose && (
          <button onClick={onClose} className="hls-player-close-button">
            ×
          </button>
        )}
      </div>

      {/* 교통정보 표시 */}
      {cctv && (
        <div className="hls-player-traffic-info">
          <TrafficInfoDisplay cctv={cctv} />
        </div>
      )}
      <video
        ref={videoRef}
        controls
        className="hls-player-video"
      />
    </div>
  );
};

export default HLSPlayer;
