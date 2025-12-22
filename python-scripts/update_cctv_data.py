"""
CCTV 데이터 다운로드 모듈

API에서 CCTV 데이터를 다운로드하고 저장합니다.
"""

import argparse
import json
import os
from pathlib import Path

import requests
from dotenv import load_dotenv

from paths import CCTV_DATA_FILE

load_dotenv()

# cctvType: 1=HLS(HTTP), 2=MP4(HTTP), 3=정지영상, 4=HLS(HTTPS), 5=MP4(HTTPS)
DEFAULT_CCTV_TYPE = '1'

CONFIG = {
    'api_url': 'https://openapi.its.go.kr:9443/cctvInfo',
    'api_key': os.getenv('REACT_APP_OPENAPI_ITS_KEY', ''),
    'min_x': '124.0',
    'max_x': '132.0',
    'min_y': '33.0',
    'max_y': '43.0',
    'get_type': 'json'
}


def get_api_key():
    """API 키 반환"""
    return CONFIG['api_key']


def fetch_cctv_data(road_type, cctv_type):
    """API 호출하여 CCTV 데이터 가져오기"""
    road_type_name = '고속도로' if road_type == 'ex' else '국도'
    print(f"  {road_type_name} CCTV 데이터를 가져오는 중...")

    params = {
        'apiKey': CONFIG['api_key'],
        'type': road_type,
        'cctvType': cctv_type,
        'minX': CONFIG['min_x'],
        'maxX': CONFIG['max_x'],
        'minY': CONFIG['min_y'],
        'maxY': CONFIG['max_y'],
        'getType': CONFIG['get_type']
    }

    try:
        response = requests.get(CONFIG['api_url'], params=params, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"API 호출 오류 ({road_type_name}): {e}")


def save_to_file(data, file_path):
    """JSON 파일 저장"""
    if isinstance(file_path, str):
        file_path = Path(file_path)
    file_path.parent.mkdir(parents=True, exist_ok=True)
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def download_and_merge(cctv_type, output_file):
    """CCTV 데이터 다운로드 및 병합 후 저장 (외부 호출용)"""
    ex_data = fetch_cctv_data('ex', cctv_type)
    its_data = fetch_cctv_data('its', cctv_type)

    if not ex_data or 'response' not in ex_data or not its_data or 'response' not in its_data:
        raise Exception('유효하지 않은 API 응답')

    # 각 CCTV에 도로 타입 추가 (ex=고속도로, its=국도)
    for cctv in ex_data['response']['data']:
        cctv['roadType'] = 'ex'
    for cctv in its_data['response']['data']:
        cctv['roadType'] = 'its'

    merged_data = {
        'response': {
            'coordtype': ex_data['response']['coordtype'],
            'datacount': len(ex_data['response']['data']) + len(its_data['response']['data']),
            'data': ex_data['response']['data'] + its_data['response']['data']
        }
    }

    print(f"  고속도로: {len(ex_data['response']['data'])}개")
    print(f"  국도: {len(its_data['response']['data'])}개")
    print(f"  총: {merged_data['response']['datacount']}개")

    save_to_file(merged_data, output_file)
    print(f"  저장: {output_file}")

    return merged_data


def parse_args():
    """커맨드라인 인자 파싱"""
    parser = argparse.ArgumentParser(description='CCTV 데이터 업데이트 스크립트')
    parser.add_argument(
        '--cctv-type',
        type=str,
        default=DEFAULT_CCTV_TYPE,
        choices=['1', '2', '3', '4', '5'],
        help='CCTV 유형 (1=HLS/HTTP, 2=MP4/HTTP, 3=정지영상, 4=HLS/HTTPS, 5=MP4/HTTPS). 기본값: 1'
    )
    parser.add_argument(
        '--output',
        type=str,
        default=None,
        help='출력 파일 경로. 기본값: cctv-data.json'
    )
    return parser.parse_args()


def main():
    args = parse_args()
    cctv_type = args.cctv_type
    output_file = args.output if args.output else CCTV_DATA_FILE

    print('========================================')
    print('CCTV 데이터 업데이트 시작')
    print('========================================\n')

    if not CONFIG['api_key']:
        print('❌ .env 파일에 REACT_APP_OPENAPI_ITS_KEY를 설정해주세요.')
        return

    print(f"API URL: {CONFIG['api_url']}")
    print(f"API 키: {CONFIG['api_key'][:10]}...")
    print(f"CCTV 유형: {cctv_type} ({'HTTPS' if cctv_type == '4' else 'HTTP'})")
    print(f"좌표 범위: ({CONFIG['min_x']}, {CONFIG['min_y']}) ~ ({CONFIG['max_x']}, {CONFIG['max_y']})\n")

    try:
        download_and_merge(cctv_type, output_file)

        print('\n========================================')
        print('✓ CCTV 데이터 업데이트 완료')
        print('========================================')

    except Exception as e:
        print('\n========================================')
        print('✗ 오류 발생')
        print('========================================')
        print(str(e))
        exit(1)


if __name__ == '__main__':
    main()
