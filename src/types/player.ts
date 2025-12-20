import type { CCTVInfo } from './cctv';

export interface HLSPlayerProps {
  url: string;
  title?: string;
  onClose?: () => void;
  cctv?: CCTVInfo;
}
