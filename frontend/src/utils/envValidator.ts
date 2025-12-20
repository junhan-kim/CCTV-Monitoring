/**
 * 환경 변수 검증 유틸리티
 */

interface RequiredEnvVars {
  REACT_APP_KAKAO_API_KEY: string;
  REACT_APP_OPENAPI_ITS_KEY: string;
}

/**
 * 필수 환경 변수가 모두 설정되어 있는지 검증
 * @throws {Error} 환경 변수가 누락된 경우 에러 발생
 */
export function validateRequiredEnvVars(): void {
  const requiredVars: (keyof RequiredEnvVars)[] = [
    'REACT_APP_KAKAO_API_KEY',
    'REACT_APP_OPENAPI_ITS_KEY',
  ];

  const missingVars: string[] = [];

  requiredVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    const errorMessage = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
환경 변수 오류: 필수 환경 변수가 설정되지 않았습니다.

누락된 환경 변수:
${missingVars.map((v) => `  - ${v}`).join('\n')}

해결 방법:
1. 프로젝트 루트에 .env 파일을 생성하세요
2. .env.example 파일을 참고하여 필요한 환경 변수를 설정하세요

예시:
${missingVars.map((v) => `  ${v}=your_api_key_here`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    throw new Error(errorMessage);
  }
}

/**
 * 환경 변수 값을 가져오기 (검증된 값만 반환)
 */
export function getRequiredEnv(key: keyof RequiredEnvVars): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(`환경 변수 ${key}가 설정되지 않았습니다.`);
  }
  return value;
}
