import type { Handler, HandlerEvent } from '@netlify/functions';

const ITS_API_KEY = process.env.OPENAPI_ITS_KEY;
const ITS_API_BASE_URL = 'https://openapi.its.go.kr:9443/cctvInfo';

const handler: Handler = async (event: HandlerEvent) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  if (!ITS_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key not configured' }),
    };
  }

  const { minX, maxX, minY, maxY, type, cctvType } = event.queryStringParameters || {};

  if (!minX || !maxX || !minY || !maxY) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required parameters: minX, maxX, minY, maxY' }),
    };
  }

  const params = new URLSearchParams({
    apiKey: ITS_API_KEY,
    type: type || 'all',
    cctvType: cctvType || '1',
    minX,
    maxX,
    minY,
    maxY,
    getType: 'json',
  });

  try {
    const response = await fetch(`${ITS_API_BASE_URL}?${params}`);

    if (!response.ok) {
      throw new Error(`ITS API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('CCTV URL API error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch CCTV info' }),
    };
  }
};

export { handler };
