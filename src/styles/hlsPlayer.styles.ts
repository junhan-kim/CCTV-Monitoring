import type { CSSProperties } from 'react';

export const hlsPlayerStyles = {
  // 메인 컨테이너
  container: {
    position: 'fixed',
    bottom: 20,
    right: 20,
    width: 480,
    backgroundColor: '#000',
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
    zIndex: 1000,
  } as CSSProperties,

  // 헤더 바
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 15px',
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  } as CSSProperties,

  // 타이틀
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  } as CSSProperties,

  // 닫기 버튼
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: 20,
    cursor: 'pointer',
    padding: 0,
    width: 24,
    height: 24,
  } as CSSProperties,

  // 교통정보 컨테이너
  trafficInfoContainer: {
    padding: '10px 15px',
    backgroundColor: '#1a1a1a',
  } as CSSProperties,

  // 비디오 요소
  video: {
    width: '100%',
    height: 'auto',
    display: 'block',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  } as CSSProperties,
};
