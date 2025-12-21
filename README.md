# CCTV Monitor

대한민국 전역의 CCTV를 실시간으로 모니터링할 수 있는 웹 애플리케이션입니다.

## 프로젝트 구조

```
CCTV-Monitoring/
├── frontend/           # React 프론트엔드
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── python-scripts/     # 데이터 처리 스크립트
├── docker-compose.yml
├── .env
└── README.md
```

## 시작하기

### 1. 환경 변수 설정

`.env` 파일에 필요한 API 키를 설정하세요:

```bash
REACT_APP_KAKAO_API_KEY=your_api_key_here
REACT_APP_OPENAPI_ITS_KEY=your_api_key_here
REACT_APP_CCTV_USE_HTTPS=false  # 로컬: false, 배포: true
```

### 2. Docker로 실행

```bash
docker-compose up --build -d
```

### 3. 브라우저에서 확인

http://localhost:3300 에서 카카오맵을 확인할 수 있습니다.

## 중지

```bash
docker-compose down
```

## 기능

- 카카오맵 기본 화면 표시
- 줌 컨트롤
- CCTV 실시간 스트리밍 (HLS)
- 실시간 교통정보 표시

## 초기 설정

### 1. Python 패키지 설치 (최초 1회)

```bash
pip install -r python-scripts/requirements.txt
```

### 2. 노드링크 데이터 다운로드

```bash
# https://www.its.go.kr/opendata/opendataList?service=nodelink
# 위 링크에서 "표준노드링크" 데이터 다운로드
# 압축 해제 후 모든 파일을 frontend/src/datas/nodelink/ 폴더에 복사
```

### 3. CCTV 데이터 생성

```bash
# HTTP + HTTPS 둘 다 생성 (권장)
python python-scripts/generate_cctv_data.py

# HTTP 버전만 생성 (로컬 개발용)
python python-scripts/generate_cctv_data.py --http

# HTTPS 버전만 생성 (배포용)
python python-scripts/generate_cctv_data.py --https
```

**생성된 파일:**

| 파일 | 설명 |
|------|------|
| `cctv-data.json` | HTTP CCTV 원본 데이터 |
| `cctv-data-with-links.json` | HTTP + 교통정보 linkId 매핑 |
| `cctv-data-https.json` | HTTPS CCTV 원본 데이터 |
| `cctv-data-https-with-links.json` | HTTPS + 교통정보 linkId 매핑 |

## 배포 (Netlify)

### 1. Build settings

| 항목 | 값 |
|------|-----|
| Base directory | `frontend` |
| Build command | `npm run build` |
| Publish directory | `frontend/build` |

### 2. 환경변수 설정

```
REACT_APP_KAKAO_API_KEY=your_api_key
REACT_APP_OPENAPI_ITS_KEY=your_api_key
REACT_APP_CCTV_USE_HTTPS=true
```

> HTTPS 모드는 HTTPS 스트리밍 URL을 사용합니다 (Mixed Content 방지)
