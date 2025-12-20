import json
import os
import requests
from dotenv import load_dotenv

from paths import CCTV_DATA_FILE

load_dotenv()

CONFIG = {
    'api_url': 'https://openapi.its.go.kr:9443/cctvInfo',
    'api_key': os.getenv('REACT_APP_OPENAPI_ITS_KEY', ''),
    'cctv_type': '1',
    'min_x': '124.0',
    'max_x': '132.0',
    'min_y': '33.0',
    'max_y': '43.0',
    'get_type': 'json'
}


def fetch_cctv_data(road_type):
    """API 호출하여 CCTV 데이터 가져오기"""
    road_type_name = '고속도로' if road_type == 'ex' else '국도'
    print(f"{road_type_name} CCTV 데이터를 가져오는 중...")

    params = {
        'apiKey': CONFIG['api_key'],
        'type': road_type,
        'cctvType': CONFIG['cctv_type'],
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
    file_path.parent.mkdir(parents=True, exist_ok=True)
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def main():
    print('========================================')
    print('CCTV 데이터 업데이트 시작')
    print('========================================\n')

    if not CONFIG['api_key']:
        print('❌ .env 파일에 REACT_APP_OPENAPI_ITS_KEY를 설정해주세요.')
        return

    print(f"API URL: {CONFIG['api_url']}")
    print(f"API 키: {CONFIG['api_key'][:10]}...")
    print(f"좌표 범위: ({CONFIG['min_x']}, {CONFIG['min_y']}) ~ ({CONFIG['max_x']}, {CONFIG['max_y']})\n")

    try:
        ex_data = fetch_cctv_data('ex')
        its_data = fetch_cctv_data('its')

        if not ex_data or 'response' not in ex_data or not its_data or 'response' not in its_data:
            raise Exception('유효하지 않은 API 응답')

        merged_data = {
            'response': {
                'coordtype': ex_data['response']['coordtype'],
                'datacount': len(ex_data['response']['data']) + len(its_data['response']['data']),
                'data': ex_data['response']['data'] + its_data['response']['data']
            }
        }

        print(f"\n고속도로 CCTV: {len(ex_data['response']['data'])}개")
        print(f"국도 CCTV: {len(its_data['response']['data'])}개")
        print(f"총 CCTV 개수: {merged_data['response']['datacount']}개")

        print(f"\n파일 저장 중: {CCTV_DATA_FILE}")
        save_to_file(merged_data, CCTV_DATA_FILE)

        print('\n========================================')
        print('✓ CCTV 데이터 업데이트 완료')
        print('========================================')
        print(f"저장된 파일: {CCTV_DATA_FILE}")
        print(f"총 CCTV 개수: {merged_data['response']['datacount']}개")

    except Exception as e:
        print('\n========================================')
        print('✗ 오류 발생')
        print('========================================')
        print(str(e))
        exit(1)


if __name__ == '__main__':
    main()
