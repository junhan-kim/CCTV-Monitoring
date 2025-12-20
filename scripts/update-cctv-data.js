const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ============================================
// 설정값
// ============================================
const CONFIG = {
  apiUrl: 'https://openapi.its.go.kr:9443/cctvInfo',
  apiKey: process.env.REACT_APP_OPENAPI_ITS_KEY || '', // .env 파일에서 읽어옴
  type: 'ex', // 도로 유형 (ex: 고속도로 / its: 국도)
  cctvType: '1', // CCTV 유형 (1: 실시간 스트리밍(HLS))
  // 남한 전체를 커버하는 좌표 범위
  minX: '124.0', // 최소 경도 (서쪽 끝)
  maxX: '132.0', // 최대 경도 (동쪽 끝)
  minY: '33.0', // 최소 위도 (제주도 포함)
  maxY: '43.0', // 최대 위도 (북쪽 끝)
  getType: 'json', // 출력 형식
  outputFile: path.join('src', 'data', 'cctv-data.json')
};

/**
 * API 호출하여 CCTV 데이터 가져오기
 */
function fetchCCTVData(roadType) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      apiKey: CONFIG.apiKey,
      type: roadType,
      cctvType: CONFIG.cctvType,
      minX: CONFIG.minX,
      maxX: CONFIG.maxX,
      minY: CONFIG.minY,
      maxY: CONFIG.maxY,
      getType: CONFIG.getType
    });

    const url = `${CONFIG.apiUrl}?${params.toString()}`;
    const roadTypeName = roadType === 'ex' ? '고속도로' : '국도';

    console.log(`${roadTypeName} CCTV 데이터를 가져오는 중...`);

    https.get(url, (res) => {
      let data = '';

      // 데이터 수신
      res.on('data', (chunk) => {
        data += chunk;
      });

      // 데이터 수신 완료
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (error) {
            console.error('\n받은 응답 데이터:');
            console.error(data.substring(0, 500));
            reject(new Error(`JSON 파싱 오류: ${error.message}`));
          }
        } else {
          reject(new Error(`HTTP 오류: ${res.statusCode}\n응답: ${data.substring(0, 500)}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`API 호출 오류: ${error.message}`));
    });
  });
}

/**
 * JSON 파일 저장
 */
function saveToFile(data, filePath) {
  return new Promise((resolve, reject) => {
    // 디렉토리가 없으면 생성
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // JSON 파일 저장 (포맷팅 적용)
    fs.writeFile(filePath, JSON.stringify(data, null, 4), 'utf8', (error) => {
      if (error) {
        reject(new Error(`파일 저장 오류: ${error.message}`));
      } else {
        resolve();
      }
    });
  });
}

/**
 * 메인 함수
 */
async function main() {
  try {
    console.log('========================================');
    console.log('CCTV 데이터 업데이트 시작');
    console.log('========================================\n');

    // API 키 확인
    if (!CONFIG.apiKey) {
      throw new Error('.env 파일에 REACT_APP_OPENAPI_ITS_KEY를 설정해주세요.');
    }

    console.log(`API URL: ${CONFIG.apiUrl}`);
    console.log(`API 키: ${CONFIG.apiKey.substring(0, 10)}...`);
    console.log(`좌표 범위: (${CONFIG.minX}, ${CONFIG.minY}) ~ (${CONFIG.maxX}, ${CONFIG.maxY})\n`);

    // 고속도로와 국도 데이터를 병렬로 가져오기
    const [exData, itsData] = await Promise.all([
      fetchCCTVData('ex'),  // 고속도로
      fetchCCTVData('its')  // 국도
    ]);

    // 데이터 검증
    if (!exData || !exData.response || !itsData || !itsData.response) {
      throw new Error('유효하지 않은 API 응답');
    }

    // 두 데이터 병합
    const mergedData = {
      response: {
        coordtype: exData.response.coordtype,
        datacount: exData.response.data.length + itsData.response.data.length,
        data: [...exData.response.data, ...itsData.response.data]
      }
    };

    console.log(`\n고속도로 CCTV: ${exData.response.data.length}개`);
    console.log(`국도 CCTV: ${itsData.response.data.length}개`);
    console.log(`총 CCTV 개수: ${mergedData.response.datacount}개`);

    // 파일 저장
    console.log(`\n파일 저장 중: ${CONFIG.outputFile}`);
    await saveToFile(mergedData, CONFIG.outputFile);

    console.log('\n========================================');
    console.log('✓ CCTV 데이터 업데이트 완료');
    console.log('========================================');
    console.log(`저장된 파일: ${CONFIG.outputFile}`);
    console.log(`총 CCTV 개수: ${mergedData.response.datacount}개`);

  } catch (error) {
    console.error('\n========================================');
    console.error('✗ 오류 발생');
    console.error('========================================');
    console.error(error.message);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { fetchCCTVData, saveToFile };
