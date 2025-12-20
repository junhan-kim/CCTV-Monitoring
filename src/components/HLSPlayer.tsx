import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { TrafficInfoDisplay } from './TrafficInfo';
import type { HLSPlayerProps } from '../types/player';

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
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 480,
        backgroundColor: '#000',
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 15px',
          backgroundColor: '#1a1a1a',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <div style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>
          {title || 'CCTV 스트리밍'}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: 20,
              cursor: 'pointer',
              padding: 0,
              width: 24,
              height: 24,
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* 교통정보 표시 */}
      {cctv && (
        <div style={{ padding: '10px 15px', backgroundColor: '#1a1a1a' }}>
          <TrafficInfoDisplay cctv={cctv} />
        </div>
      )}
      <video
        ref={videoRef}
        controls
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
        }}
      />
    </div>
  );
};

export default HLSPlayer;
