/// <reference types="react-scripts" />

declare global {
  interface Window {
    kakao: any;
  }

  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_KAKAO_API_KEY: string;
      REACT_APP_OPENAPI_ITS_KEY: string;
    }
  }
}

export {};
