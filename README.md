# CCTV Monitor

대한민국 전역의 CCTV를 실시간으로 모니터링할 수 있는 웹 애플리케이션입니다.

## 시작하기

### 1. 환경 변수 설정

`.env` 파일에 카카오 API 키를 설정하세요:

```
REACT_APP_KAKAO_API_KEY=your_kakao_api_key_here
```

### 2. Docker로 실행

```bash
docker-compose up --build
```

### 3. 브라우저에서 확인

http://localhost:3000 에서 카카오맵을 확인할 수 있습니다.

## 중지

```bash
docker-compose down
```

## 기능

- 카카오맵 기본 화면 표시 (서울 시청 중심)
- 지도 타입 컨트롤 (일반지도/스카이뷰)
- 줌 컨트롤
- CCTV 실시간 스트리밍 (HLS)

## 초기 설정

### 1. Python 패키지 설치 (최초 1회)

```bash
pip install -r python-scripts/requirements.txt
```

### 2. 노드링크 데이터 다운로드

```bash
# https://www.its.go.kr/opendata/opendataList?service=nodelink
# 위 링크에서 "표준노드링크" 데이터 다운로드
# 압축 해제 후 모든 파일을 datas/nodelink/ 폴더에 복사
```

### 3. CCTV 데이터 생성

```bash
# CCTV 원본 데이터 생성
python python-scripts/update-cctv-data.py

# 교통정보 linkId 매핑
python python-scripts/map-cctv-to-traffic.py
```

**생성된 파일:**
- `datas/cctv/cctv-data.json` - CCTV 원본 데이터
- `datas/cctv/cctv-data-with-links.json` - 교통정보 linkId 매핑 완료

### CCTV 데이터 업데이트

```bash
# 두 스크립트를 순서대로 실행
python python-scripts/update-cctv-data.py
python python-scripts/map-cctv-to-traffic.py
```
