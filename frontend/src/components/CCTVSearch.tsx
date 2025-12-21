import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CCTVInfo } from '../types/cctv';
import { CCTVSearchProps } from '../types/search';
import '../styles/CCTVSearch.css';

const CCTVSearch: React.FC<CCTVSearchProps> = ({ cctvService, onSelectCCTV }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CCTVInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (value.trim()) {
      const searchResults = cctvService.searchByName(value).slice(0, 10);
      setResults(searchResults);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [cctvService]);

  const handleSelect = useCallback((cctv: CCTVInfo) => {
    onSelectCCTV(cctv);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  }, [onSelectCCTV]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="cctv-search-container" ref={containerRef}>
      <input
        type="text"
        className="cctv-search-input"
        placeholder="CCTV 검색 (예: 강남, 서초)"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => results.length > 0 && setIsOpen(true)}
      />
      {isOpen && results.length > 0 && (
        <ul className="cctv-search-results">
          {results.map((cctv) => (
            <li
              key={cctv.roadsectionid}
              className="cctv-search-result-item"
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
