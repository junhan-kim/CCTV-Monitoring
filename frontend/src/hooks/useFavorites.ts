import { useState, useEffect, useCallback } from 'react';
import type { CCTVInfo } from '../types/cctv';

const STORAGE_KEY = 'cctv-favorites';
const MAX_FAVORITES = 10;

export function useFavorites() {
  const [favorites, setFavorites] = useState<CCTVInfo[]>([]);

  // 초기 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.error('즐겨찾기 로드 실패:', e);
    }
  }, []);

  // 즐겨찾기 추가
  const addFavorite = useCallback((cctv: CCTVInfo) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.cctvname === cctv.cctvname);
      if (exists) return prev;
      const newFavorites = [...prev, cctv];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  // 즐겨찾기 제거
  const removeFavorite = useCallback((cctvname: string) => {
    setFavorites(prev => {
      const newFavorites = prev.filter(f => f.cctvname !== cctvname);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  // 즐겨찾기 토글
  const toggleFavorite = useCallback((cctv: CCTVInfo) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.cctvname === cctv.cctvname);
      if (!exists && prev.length >= MAX_FAVORITES) {
        alert(`즐겨찾기는 최대 ${MAX_FAVORITES}개까지 등록할 수 있습니다.`);
        return prev;
      }
      const newFavorites = exists
        ? prev.filter(f => f.cctvname !== cctv.cctvname)
        : [...prev, cctv];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  // 즐겨찾기 여부 확인
  const isFavorite = useCallback((cctvname: string) => {
    return favorites.some(f => f.cctvname === cctvname);
  }, [favorites]);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}
