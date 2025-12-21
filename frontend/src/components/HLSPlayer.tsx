import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { TrafficInfoDisplay } from './TrafficInfo';
import type { HLSPlayerProps } from '../types/player';
import '../styles/HLSPlayer.css';

const HLSPlayer: React.FC<HLSPlayerProps> = ({ url, title, onClose, cctv }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

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
    <div className="hls-player-container">
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
