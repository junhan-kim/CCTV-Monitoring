import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { validateRequiredEnvVars } from './utils/envValidator';

// 필수 환경 변수 검증
try {
  validateRequiredEnvVars();
} catch (error) {
  console.error(error);
  document.body.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background-color: #1a1a1a;
      color: #ff6b6b;
      font-family: 'Courier New', monospace;
      padding: 20px;
    ">
      <div style="
        max-width: 800px;
        background-color: #2d2d2d;
        border: 2px solid #ff6b6b;
        border-radius: 8px;
        padding: 30px;
      ">
        <h1 style="margin-top: 0; color: #ff6b6b;">⚠️ 환경 변수 오류</h1>
        <pre style="
          background-color: #1a1a1a;
          padding: 20px;
          border-radius: 4px;
          overflow-x: auto;
          color: #f0f0f0;
        ">${error instanceof Error ? error.message : String(error)}</pre>
      </div>
    </div>
  `;
  throw error;
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(<App />);
