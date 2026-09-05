exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
      },
      body: '',
    };
  }

  const url = event.queryStringParameters?.url;

  if (!url) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Missing query parameter: url' }),
    };
  }

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/rss+xml, application/xml, text/xml, text/html',
      },
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: `Upstream returned HTTP ${response.status}` }),
      };
    }

    const text = await response.text();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/xml; charset=utf-8',
      },
      body: text,
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to fetch feed',
      }),
    };
  }
};
