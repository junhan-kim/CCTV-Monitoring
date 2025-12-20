const https = require('https');

const API_KEY = '044cd0c0407245a4bb5d2f6d1d8458bd';
const BASE_URL = 'https://openapi.its.go.kr:9443/bypassFCastInfo';

// 현재 날짜와 시간 가져오기
const now = new Date();
const fCastDate = now.toISOString().slice(0, 10).replace(/-/g, '');
const fCastHour = String(now.getHours()).padStart(2, '0');

console.log(`테스트 시작 - 날짜: ${fCastDate}, 시간: ${fCastHour}`);

function makeRequest(requestNum) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      apiKey: API_KEY,
      sectionId: '10',
      fCastDate: fCastDate,
      fCastHour: fCastHour,
      getType: 'json'
    });

    const url = `${BASE_URL}?${params.toString()}`;

    const startTime = Date.now();

    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const elapsed = Date.now() - startTime;
        console.log(`\n[요청 #${requestNum}]`);
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`응답 시간: ${elapsed}ms`);

        try {
          const jsonData = JSON.parse(data);
          console.log('응답 데이터:', JSON.stringify(jsonData, null, 2));
          resolve({ success: true, statusCode: res.statusCode, data: jsonData, elapsed });
        } catch (e) {
          console.log('Raw 응답:', data);
          resolve({ success: false, statusCode: res.statusCode, data: data, elapsed });
        }
      });
    }).on('error', (err) => {
      console.error(`[요청 #${requestNum}] 에러:`, err.message);
      reject(err);
    });
  });
}

async function testRateLimit() {
  console.log('\n========================================');
  console.log('API 응답 확인 (단일 요청)');
  console.log('========================================');

  await makeRequest(1);

  console.log('\n========================================');
  console.log('API Rate Limit 테스트 (연속 10회 요청)');
  console.log('========================================');

  const results = [];

  for (let i = 2; i <= 11; i++) {
    try {
      const result = await makeRequest(i);
      results.push(result);

      // 짧은 딜레이
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (err) {
      results.push({ success: false, error: err.message });
    }
  }

  console.log('\n========================================');
  console.log('테스트 결과 요약');
  console.log('========================================');
  console.log(`총 요청 수: ${results.length + 1}`);
  console.log(`성공: ${results.filter(r => r.success && r.statusCode === 200).length + 1}`);
  console.log(`실패: ${results.filter(r => !r.success || r.statusCode !== 200).length}`);

  const failedRequests = results.filter(r => !r.success || r.statusCode !== 200);
  if (failedRequests.length > 0) {
    console.log('\n실패한 요청:');
    failedRequests.forEach((r, idx) => {
      console.log(`  - 요청 #${idx + 2}: Status ${r.statusCode || 'N/A'}`);
    });
  }
}

testRateLimit();
