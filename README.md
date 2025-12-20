# Kakao Map React App

카카오맵 API를 사용한 리액트 앱입니다.

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
