import React, { useState, useRef, useEffect } from 'react';
import type { CCTVInfo, FavoritesDropdownProps } from '../types/cctv';
import { ICON_CONSTANTS, SVG_XMLNS } from '../constants/icons';
import '../styles/FavoritesDropdown.css';

const FavoritesDropdown: React.FC<FavoritesDropdownProps> = ({
  favorites,
  onSelect,
  onRemove,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (favorites.length === 0) {
    return null;
  }

  const handleSelect = (favorite: CCTVInfo) => {
    onSelect(favorite);
    setIsOpen(false);
  };

  return (
    <div className="favorites-dropdown-container" ref={containerRef}>
      <button
        className="favorites-dropdown-button"
        onClick={() => setIsOpen(!isOpen)}
        title="즐겨찾기"
      >
        <svg
          xmlns={SVG_XMLNS}
          width="20"
          height="20"
          viewBox={ICON_CONSTANTS.STAR.viewBox}
          fill={ICON_CONSTANTS.STAR.fillColorActive}
          stroke={ICON_CONSTANTS.STAR.strokeColor}
          strokeWidth="2"
        >
          <polygon points={ICON_CONSTANTS.STAR.points} />
        </svg>
        <span className="favorites-count">{favorites.length}</span>
      </button>

      {isOpen && (
        <ul className="favorites-dropdown-list">
          {favorites.map((favorite) => (
            <li key={favorite.cctvname} className="favorites-dropdown-item">
              <span
                className="favorites-item-name"
                onClick={() => handleSelect(favorite)}
              >
                {favorite.cctvname}
              </span>
              <button
                className="favorites-item-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(favorite.cctvname);
                }}
                title="즐겨찾기 삭제"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FavoritesDropdown;
