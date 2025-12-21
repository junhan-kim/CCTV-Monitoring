import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CCTVInfo } from '../types/cctv';
import { CCTVSearchProps } from '../types/search';
import '../styles/CCTVSearch.css';

const CCTVSearch: React.FC<CCTVSearchProps> = ({ cctvService, onSelectCCTV }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CCTVInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    setSelectedIndex(-1);
    if (value.trim()) {
      const searchResults = cctvService.searchByName(value).slice(0, 10);
      setResults(searchResults);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [cctvService]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          onSelectCCTV(results[selectedIndex]);
          setQuery('');
          setResults([]);
          setIsOpen(false);
          setSelectedIndex(-1);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  }, [isOpen, results, selectedIndex, onSelectCCTV]);

  const handleSelect = useCallback((cctv: CCTVInfo) => {
    onSelectCCTV(cctv);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  }, [onSelectCCTV]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleSlashKey = (event: KeyboardEvent) => {
      // 이미 input이나 textarea에 포커스되어 있으면 무시
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (event.key === '/') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleSlashKey);
    return () => document.removeEventListener('keydown', handleSlashKey);
  }, []);

  return (
    <div className="cctv-search-container" ref={containerRef}>
      <input
        ref={inputRef}
        type="text"
        className="cctv-search-input"
        placeholder="CCTV 검색 (예: 강남, 서초)   '/' 키를 눌러 포커스"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => results.length > 0 && setIsOpen(true)}
      />
      {isOpen && results.length > 0 && (
        <ul className="cctv-search-results">
          {results.map((cctv, index) => (
            <li
              key={cctv.roadsectionid}
              className={`cctv-search-result-item${index === selectedIndex ? ' selected' : ''}`}
              onClick={() => handleSelect(cctv)}
            >
              {cctv.cctvname}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CCTVSearch;
