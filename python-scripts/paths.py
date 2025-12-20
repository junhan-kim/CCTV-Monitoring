"""경로 설정 모듈"""

from pathlib import Path

# 기준 경로
PROJECT_ROOT = Path(__file__).parent.parent
FRONTEND_ROOT = PROJECT_ROOT / 'frontend'
SRC_DIR = FRONTEND_ROOT / 'src'
DATAS_DIR = SRC_DIR / 'datas'

# CCTV 데이터 경로
CCTV_DIR = DATAS_DIR / 'cctv'
CCTV_DATA_FILE = CCTV_DIR / 'cctv-data.json'
CCTV_DATA_WITH_LINKS_FILE = CCTV_DIR / 'cctv-data-with-links.json'

# 노드링크 데이터 경로
NODELINK_DIR = DATAS_DIR / 'nodelink'
NODELINK_SHAPEFILE = NODELINK_DIR / 'MOCT_LINK.shp'
