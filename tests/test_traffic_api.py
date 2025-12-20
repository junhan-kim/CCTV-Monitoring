import requests
import json
from datetime import datetime

API_KEY = '044cd0c0407245a4bb5d2f6d1d8458bd'
BASE_URL = 'https://openapi.its.go.kr:9443/bypassFCastInfo'

# 현재 날짜와 시간
now = datetime.now()
fcast_date = now.strftime('%Y%m%d')
fcast_hour = now.strftime('%H')

print(f"교통 예측 정보 API 테스트")
print(f"날짜: {fcast_date}, 시간: {fcast_hour}시")
print("=" * 60)

# API 요청 파라미터
params = {
    'apiKey': API_KEY,
    'sectionId': '10',  # 본선 도로 구간 ID
    'fCastDate': fcast_date,
    'fCastHour': fcast_hour,
    'getType': 'json'
}

try:
    print("\nAPI 요청 중...")
    response = requests.get(BASE_URL, params=params)

    print(f"상태 코드: {response.status_code}")

    if response.status_code == 200:
        data = response.json()

        print(f"\n결과 코드: {data['header']['resultCode']}")
        print(f"결과 메시지: {data['header']['resultMsg']}")
        print(f"총 데이터 개수: {data['body']['totalCount']}")

        print("\n=== 도로 구간별 예측 속도 (상위 10개) ===")
        items = data['body']['items'][:10]

        for idx, item in enumerate(items, 1):
            section_type = "메인도로" if item['sectionType'] == 'M' else "우회도로"
            print(f"{idx}. 링크ID: {item['linkId']}")
            print(f"   구간: {section_type}, 길이: {item['length']}m")
            print(f"   예측 속도: {item['speed']}km/h")
            print()

        # 전체 데이터를 JSON 파일로 저장
        with open('traffic_forecast_result.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print("전체 데이터가 'traffic_forecast_result.json' 파일로 저장되었습니다.")

    else:
        print(f"에러 발생: {response.text}")

except Exception as e:
    print(f"예외 발생: {str(e)}")
