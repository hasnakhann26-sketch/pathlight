exports.handler = async (event) => {
  const url = event.queryStringParameters && event.queryStringParameters.url;

  if (!url) {
    return {
      statusCode: 400,
      body: 'Missing url parameter',
    };
  }

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000),
    });
    const text = await response.text();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/xml',
      },
      body: text,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: 'Failed to fetch: ' + error.message,
    };
  }
};
