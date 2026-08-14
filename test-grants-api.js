// Quick test: Fetch from Grants.gov API and verify response
const apiUrl = 'https://api.grants.gov/v1/api/search2?statusInd=open&pageOffset=0&limit=5';

fetch(apiUrl, {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'Pathlight/1.0 (Opportunity Discovery)',
  },
})
  .then((res) => {
    console.log('Status:', res.status, res.statusText);
    return res.json();
  })
  .then((data) => {
    console.log('Response Keys:', Object.keys(data));
    console.log('Total Count:', data.totalCount);
    console.log('Records Returned:', Array.isArray(data.oppList) ? data.oppList.length : 0);
    if (data.oppList && data.oppList.length > 0) {
      console.log('First Record Keys:', Object.keys(data.oppList[0]));
    }
  })
  .catch((err) => {
    console.error('API Test Failed:', err.message);
  });
