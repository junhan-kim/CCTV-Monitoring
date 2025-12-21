"""
CCTV 데이터 생성 통합 스크립트

HTTP/HTTPS 버전의 CCTV 데이터를 생성하고 교통정보 linkId를 매핑합니다.
update-cctv-data.py와 map-cctv-to-traffic.py를 순차 실행합니다.

사용법:
    python generate-cctv-data.py          # HTTP + HTTPS 둘 다 생성
    python generate-cctv-data.py --http   # HTTP 버전만 생성
    python generate-cctv-data.py --https  # HTTPS 버전만 생성
"""

import argparse
import sys

from paths import (
    CCTV_DATA_FILE,
    CCTV_DATA_WITH_LINKS_FILE,
    CCTV_DATA_HTTPS_FILE,
    CCTV_DATA_HTTPS_WITH_LINKS_FILE,
)

# 기존 모듈에서 함수 import
from update_cctv_data import download_and_merge, get_api_key
from map_cctv_to_traffic import load_nodelink_shapefile, map_links_to_cctv_data, save_result


def generate_version(cctv_type, data_file, links_file, links_gdf):
    """특정 버전(HTTP/HTTPS) 데이터 생성"""
    protocol = 'HTTPS' if cctv_type == '4' else 'HTTP'

    print(f"\n{'=' * 60}")
    print(f" {protocol} 버전 생성")
    print(f"{'=' * 60}")

    # 1. CCTV 데이터 다운로드 (update-cctv-data.py 호출)
    print(f"\n[1/2] CCTV 데이터 다운로드 ({protocol})")
    print("-" * 40)
    cctv_data = download_and_merge(cctv_type, data_file)

    # 2. linkId 매핑 (map-cctv-to-traffic.py 호출)
    print(f"\n[2/2] 교통정보 linkId 매핑")
    print("-" * 40)
    map_links_to_cctv_data(cctv_data, links_gdf)
    save_result(cctv_data, links_file)

    print(f"\n✅ {protocol} 버전 완료")
    print(f"   - {data_file.name}")
    print(f"   - {links_file.name}")


def main():
    parser = argparse.ArgumentParser(
        description='CCTV 데이터 생성 (HTTP/HTTPS)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
예시:
  python generate-cctv-data.py          # HTTP + HTTPS 둘 다
  python generate-cctv-data.py --http   # HTTP만
  python generate-cctv-data.py --https  # HTTPS만
        """
    )
    parser.add_argument('--http', action='store_true', help='HTTP 버전만 생성')
    parser.add_argument('--https', action='store_true', help='HTTPS 버전만 생성')
    args = parser.parse_args()

    # 둘 다 지정 안 하면 둘 다 생성
    generate_http = args.http or (not args.http and not args.https)
    generate_https = args.https or (not args.http and not args.https)

    print("=" * 60)
    print(" CCTV 데이터 생성")
    print("=" * 60)

    api_key = get_api_key()
    if not api_key:
        print('❌ .env 파일에 REACT_APP_OPENAPI_ITS_KEY를 설정해주세요.')
        sys.exit(1)

    print(f"API 키: {api_key[:10]}...")
    targets = []
    if generate_http:
        targets.append('HTTP')
    if generate_https:
        targets.append('HTTPS')
    print(f"생성 대상: {' + '.join(targets)}")

    # 노드링크 데이터 로드 (1회만) - map-cctv-to-traffic.py에서 가져옴
    print("\n노드링크 데이터 로드 (1회)")
    print("-" * 40)
    links_gdf = load_nodelink_shapefile()

    try:
        if generate_http:
            generate_version('1', CCTV_DATA_FILE, CCTV_DATA_WITH_LINKS_FILE, links_gdf)

        if generate_https:
            generate_version('4', CCTV_DATA_HTTPS_FILE, CCTV_DATA_HTTPS_WITH_LINKS_FILE, links_gdf)

        print(f"\n{'=' * 60}")
        print(" 모든 작업 완료!")
        print(f"{'=' * 60}")

    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
