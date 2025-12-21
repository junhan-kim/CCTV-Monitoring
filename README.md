# CCTV Monitor

대한민국 전역의 CCTV를 실시간으로 모니터링할 수 있는 웹 애플리케이션입니다.

**Demo:** https://cctv-monitoring-service.netlify.app

## 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | React, TypeScript |
| 지도 | Kakao Maps SDK |
| 영상 스트리밍 | HLS.js |
| 스타일링 | CSS |
| 배포 | Netlify (Functions 포함) |
| 데이터 처리 | Python |

## 프로젝트 구조

```
CCTV-Monitoring/
├── frontend/               # React 프론트엔드
│   ├── src/
│   │   ├── adapters/       # 외부 데이터 변환 (API 응답 → 내부 모델)
│   │   ├── components/     # React UI 컴포넌트
│   │   ├── constants/      # 상수값 (API URL, SVG 경로, 설정값)
│   │   ├── datas/          # 정적 JSON 데이터 파일
│   │   ├── hooks/          # React 커스텀 훅 (use* 접두사, 상태/생명주기 관련)
│   │   ├── services/       # 외부 API 호출, 비즈니스 로직 (React 독립적)
│   │   ├── styles/         # CSS 스타일 파일
│   │   ├── types/          # TypeScript 인터페이스/타입 정의
│   │   └── utils/          # 유틸리티 함수
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── python-scripts/         # 데이터 처리 스크립트
├── docker-compose.yml
├── .env
└── README.md
```

## 시작하기

### 1. 환경 변수 설정

`.env.example`을 복사하여 `.env` 파일을 생성하고 API 키를 설정하세요:

```bash
cp .env.example .env
```

> 환경변수 설명은 `.env.example` 파일을 참조하세요.

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

Netlify 대시보드에서 환경변수를 설정하세요.

> 환경변수 목록은 `.env.example.netlify` 파일을 참조하세요.

### 3. Netlify Functions (API 프록시)

교통정보 API 키 보호를 위해 Netlify Functions를 프록시로 사용합니다.

```
클라이언트 → /.netlify/functions/traffic-info → ITS API
```

- API 키가 클라이언트(브라우저 개발자도구)에 노출되지 않음
- `frontend/netlify/functions/` 디렉토리에 함수 정의

### 4. Rate Limiting

`netlify.toml`에서 IP당 분당 50회 요청 제한이 설정되어 있습니다.
- DDoS 및 악의적 봇 트래픽 방지
- 일반 사용자는 영향 없음 (페이지 로드 시 약 5개 요청)
