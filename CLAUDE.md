# Project Rules

## Git 규칙
- git commit, git push 실행 전에 반드시 사용자 검토 및 승인을 받을 것

## 배포 규칙
- "prod에 배포해" = main 브랜치를 prod 브랜치에 병합 (Netlify 자동 배포됨)

## Frontend 코드 컨벤션 (frontend/)
- interface는 `src/types/` 디렉토리에 정의
- CSS 스타일은 `src/styles/` 디렉토리에 별도 파일로 정의 (인라인 스타일 지양)
