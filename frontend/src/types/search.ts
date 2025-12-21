import { CCTVInfo } from './cctv';
import { CCTVService } from '../services/cctvService';

export interface CCTVSearchProps {
  cctvService: CCTVService;
  onSelectCCTV: (cctv: CCTVInfo) => void;
}
